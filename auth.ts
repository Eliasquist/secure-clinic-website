import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

// ============================================
// HELPER FUNCTIONS
// ============================================

// Microsoft consumers tenant ID (personal accounts like Hotmail, Outlook.com)
const MSA_CONSUMERS_TID = "9188040d-6c67-4c5b-b112-36a304b66dad";

/**
 * Parse comma-separated env var into lowercase trimmed array
 */
function parseCsvEnv(name: string): string[] {
    return (process.env[name] || "")
        .split(",")
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
}

/**
 * Decode JWT payload without verification (claims already verified by Microsoft + NextAuth)
 * Used only to read the 'tid' (tenant ID) claim from id_token
 */
function decodeJwtPayload(token?: string): Record<string, unknown> | null {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    try {
        return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    } catch {
        return null;
    }
}

/**
 * Check if tenant exists in backend database (DB-gate)
 * Returns true if tenant is onboarded, false otherwise
 * Fail-closed: returns false on any error
 */
async function checkTenantExistsInBackend(tid: string): Promise<boolean> {
    const backendUrl = process.env.BACKEND_URL;
    const portalKey = process.env.PORTAL_BACKEND_KEY;

    // If not configured, skip DB-gate (pilot-friendly)
    if (!backendUrl || !portalKey) {
        console.log(`ℹ️ DB-gate not configured (BACKEND_URL or PORTAL_BACKEND_KEY missing). Skipping tenant check.`);
        return true;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(
            `${backendUrl}/internal/tenants/exists?tid=${encodeURIComponent(tid)}`,
            {
                headers: {
                    'x-portal-key': portalKey,
                },
                cache: 'no-store',
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (response.status === 200) {
            console.log(`✅ Tenant validated in backend: ${tid.substring(0, 8)}...`);
            return true;
        }

        if (response.status === 404) {
            console.warn(`🛑 Tenant not onboarded in backend: ${tid.substring(0, 8)}...`);
            return false;
        }

        // Unexpected status - fail closed
        console.error(`⚠️ Unexpected response from backend tenant check: ${response.status}`);
        return false;
    } catch (error) {
        // Fail closed on any error (network, timeout, etc.)
        console.error(`❌ Failed to check tenant in backend (fail-closed):`, error);
        return false;
    }
}

// ============================================
// NEXTAUTH CONFIGURATION
// ============================================

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            // Use issuer for tenant-specific login, omit for multi-tenant ("common")
            ...(process.env.AZURE_AD_TENANT_ID && process.env.AZURE_AD_TENANT_ID !== "common"
                ? { issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0` }
                : {}),
            authorization: {
                params: {
                    scope: "openid profile email User.Read",
                },
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        /**
         * signIn callback: Security gate for login attempts
         * 
         * Policy (in order):
         * 1. Superadmins always pass (SUPERADMIN_EMAILS)
         * 2. Block MSA (personal Microsoft accounts) in production
         * 3. DB-gate: Check if tenant exists in backend database
         * 4. Fallback allowlists (if DB-gate not configured)
         * 
         * Fail-closed: If backend is down or returns error, login is blocked.
         */
        async signIn({ user, account, profile }) {
            const email = (user?.email || (profile as Record<string, unknown>)?.email || "").toString().toLowerCase();

            // 1. Superadmin bypass (always passes, even if tenant not onboarded)
            const superadmins = parseCsvEnv("SUPERADMIN_EMAILS");
            if (email && superadmins.includes(email)) {
                console.log(`✅ Superadmin login allowed: ${email}`);
                return true;
            }

            const isProd = process.env.NODE_ENV === "production";
            const denyMsa = (process.env.AUTH_DENY_MSA_IN_PROD || "true").toLowerCase() === "true";

            // Read tid from id_token (Entra/Microsoft)
            const claims = decodeJwtPayload((account as Record<string, unknown>)?.id_token as string);
            const tid = ((claims?.tid as string) || "").toLowerCase();

            // 2. Block MSA (personal Microsoft accounts) in production
            if (isProd && denyMsa && tid === MSA_CONSUMERS_TID) {
                console.warn(`🛑 Blocked MSA login in production: ${email} (tid: ${tid})`);
                return false;
            }

            // 3. DB-gate: Check if tenant exists in backend
            // This is the primary check - if configured, it overrides allowlists
            const backendConfigured = !!(process.env.BACKEND_URL && process.env.PORTAL_BACKEND_KEY);

            if (backendConfigured && tid) {
                const tenantExists = await checkTenantExistsInBackend(tid);
                if (!tenantExists) {
                    console.warn(`🛑 Blocked login: tenant not onboarded in backend: ${email} (tid: ${tid})`);
                    return false;
                }
                // Tenant exists in backend - allow login
                console.log(`✅ Login allowed (DB-gate passed): ${email} (tid: ${tid})`);
                return true;
            }

            // 4. Fallback: ENV allowlists (if DB-gate not configured)
            const allowedTids = parseCsvEnv("ALLOWED_ENTRA_TENANT_IDS");
            if (allowedTids.length > 0 && tid && !allowedTids.includes(tid)) {
                console.warn(`🛑 Blocked login: tenantId not allowlisted: ${email} (tid: ${tid})`);
                return false;
            }

            const emailDomain = email.includes("@") ? email.split("@")[1] : "";
            const allowedDomains = parseCsvEnv("ALLOWED_EMAIL_DOMAINS");
            if (allowedDomains.length > 0 && emailDomain && !allowedDomains.includes(emailDomain)) {
                console.warn(`🛑 Blocked login: email domain not allowlisted: ${email} (domain: ${emailDomain})`);
                return false;
            }

            console.log(`✅ Login allowed: ${email} (tid: ${tid || "N/A"})`);
            return true;
        },

        async jwt({ token, account }) {
            // Persist accessToken and tenantId from Azure to the JWT
            if (account) {
                token.accessToken = account.access_token;
                // Extract tid from id_token for more reliable tenant ID
                const claims = decodeJwtPayload(account.id_token as string);
                token.tenantId = (claims?.tid as string) || account.providerAccountId?.split(".")[1];
            }
            return token;
        },

        async session({ session, token }) {
            // Make accessToken and tenantId available to client
            session.accessToken = token.accessToken as string;
            session.tenantId = token.tenantId as string;
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login", // Redirect to login page on error (with error query param)
    },
    trustHost: true,
});

// Type augmentation for session
declare module "next-auth" {
    interface Session {
        accessToken?: string;
        tenantId?: string;
    }
}
