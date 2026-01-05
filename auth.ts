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
         * Policy:
         * 1. Superadmins always pass (SUPERADMIN_EMAILS)
         * 2. Block MSA (personal Microsoft accounts) in production (AUTH_DENY_MSA_IN_PROD)
         * 3. If ALLOWED_ENTRA_TENANT_IDS is set, only those tenant IDs pass
         * 4. If ALLOWED_EMAIL_DOMAINS is set, only those email domains pass
         * 
         * Default (no env vars set): Pilot-friendly, allows all Entra logins
         */
        async signIn({ user, account, profile }) {
            const email = (user?.email || (profile as Record<string, unknown>)?.email || "").toString().toLowerCase();
            const emailDomain = email.includes("@") ? email.split("@")[1] : "";

            // 1. Superadmin bypass
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

            // 3. Tenant ID allowlist (if configured)
            const allowedTids = parseCsvEnv("ALLOWED_ENTRA_TENANT_IDS");
            if (allowedTids.length > 0 && tid && !allowedTids.includes(tid)) {
                console.warn(`🛑 Blocked login: tenantId not allowlisted: ${email} (tid: ${tid})`);
                return false;
            }

            // 4. Email domain allowlist (if configured)
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
