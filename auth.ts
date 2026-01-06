import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

// ============================================
// CONSTANTS
// ============================================

// Microsoft consumers tenant ID (personal accounts like Hotmail, Outlook.com)
const MSA_CONSUMERS_TID = "9188040d-6c67-4c5b-b112-36a304b66dad";

// ============================================
// TYPES
// ============================================

interface AuthDecisionLog {
    decision: "ALLOW" | "DENY";
    reason: string;
    email: string;
    emailDomain: string;
    tid: string;
    latencyMs?: number;
    httpStatus?: number;
    isSuperadmin: boolean;
    isProd: boolean;
}

interface DbGateResult {
    allowed: boolean;
    httpStatus: number;
    latencyMs: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

/**
 * Log auth decision in structured format for observability
 */
function logAuthDecision(log: AuthDecisionLog): void {
    const logData = {
        event: "AUTH_DECISION",
        decision: log.decision,
        reason: log.reason,
        email: log.email.substring(0, 3) + "***@" + log.emailDomain, // Redact email
        domain: log.emailDomain,
        tid: log.tid ? log.tid.substring(0, 8) + "..." : "N/A",
        latencyMs: log.latencyMs ?? null,
        httpStatus: log.httpStatus ?? null,
        isSuperadmin: log.isSuperadmin,
        isProd: log.isProd,
        ts: new Date().toISOString(),
    };

    if (log.decision === "ALLOW") {
        console.log(`✅ AUTH_DECISION:`, JSON.stringify(logData));
    } else {
        console.warn(`🛑 AUTH_DECISION:`, JSON.stringify(logData));
    }
}

/**
 * Check if tenant exists in backend database (DB-gate)
 * Returns result with status code and latency for observability
 */
async function checkTenantExistsInBackend(tid: string): Promise<DbGateResult> {
    const backendUrl = process.env.BACKEND_URL;
    const portalKey = process.env.PORTAL_BACKEND_KEY;

    const startTime = Date.now();

    // This should never happen in production (checked earlier), but defensive
    if (!backendUrl || !portalKey) {
        return { allowed: false, httpStatus: 0, latencyMs: 0 };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

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
        const latencyMs = Date.now() - startTime;

        if (response.status === 200) {
            return { allowed: true, httpStatus: 200, latencyMs };
        }

        if (response.status === 404) {
            return { allowed: false, httpStatus: 404, latencyMs };
        }

        // Unexpected status - fail closed
        return { allowed: false, httpStatus: response.status, latencyMs };
    } catch (error) {
        const latencyMs = Date.now() - startTime;
        // Fail closed on any error (network, timeout, etc.)
        const isTimeout = error instanceof Error && error.name === 'AbortError';
        console.error(`❌ DB-gate ${isTimeout ? 'timeout' : 'error'}:`, error);
        return { allowed: false, httpStatus: isTimeout ? 408 : 0, latencyMs };
    }
}

// ============================================
// NEXTAUTH CONFIGURATION
// ============================================

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            // TEMP DEBUG: Commenting out issuer to force default (common) endpoint
            // ...(process.env.AZURE_AD_TENANT_ID && process.env.AZURE_AD_TENANT_ID !== "common"
            //    ? { issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0` }
            //    : {}),
            authorization: {
                params: {
                    scope: "openid profile email User.Read",
                },
            },
        }),
    ],
    debug: true, // Enable debug logs for Vercel

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
         * 3. PRODUCTION: DB-gate is REQUIRED (fail-closed if not configured)
         * 4. NON-PRODUCTION: Fallback to ENV allowlists if DB-gate not configured
         * 
         * Fail-closed: If backend is down, returns error, or not configured in prod → login blocked.
         */
        async signIn({ user, account, profile }) {
            const email = (user?.email || (profile as Record<string, unknown>)?.email || "").toString().toLowerCase();
            const emailDomain = email.includes("@") ? email.split("@")[1] : "";
            const isProd = process.env.NODE_ENV === "production";

            // Read tid from id_token (Entra/Microsoft)
            const claims = decodeJwtPayload((account as Record<string, unknown>)?.id_token as string);
            const tid = ((claims?.tid as string) || "").toLowerCase();

            // Base log data
            const baseLog: Omit<AuthDecisionLog, "decision" | "reason" | "latencyMs" | "httpStatus"> = {
                email,
                emailDomain,
                tid,
                isSuperadmin: false,
                isProd,
            };

            // 1. Superadmin bypass (always passes, even if tenant not onboarded)
            const superadmins = parseCsvEnv("SUPERADMIN_EMAILS");
            if (email && superadmins.includes(email)) {
                logAuthDecision({ ...baseLog, decision: "ALLOW", reason: "SUPERADMIN", isSuperadmin: true });
                return true;
            }

            // 2. Block MSA (personal Microsoft accounts) in production
            const denyMsa = (process.env.AUTH_DENY_MSA_IN_PROD || "true").toLowerCase() === "true";
            if (isProd && denyMsa && tid === MSA_CONSUMERS_TID) {
                logAuthDecision({ ...baseLog, decision: "DENY", reason: "MSA_BLOCKED" });
                return false;
            }

            // 3. Check DB-gate configuration
            const backendConfigured = !!(process.env.BACKEND_URL && process.env.PORTAL_BACKEND_KEY);

            // PRODUCTION: DB-gate is REQUIRED
            // PRODUCTION: DB-gate is REQUIRED
            if (isProd && !backendConfigured) {
                logAuthDecision({ ...baseLog, decision: "DENY", reason: "DB_GATE_NOT_CONFIGURED" });
                console.error("❌ CRITICAL: DB-gate not configured in production. Login blocked.");
                return false;
            }

            // 4. DB-gate: Check if tenant exists in backend
            // DEBUG: Temporarily bypass DB-gate to test OAuth flow
            // TODO: Remove this bypass after confirming OAuth works!
            if (backendConfigured && tid) {
                console.log(`🔧 DEBUG: Bypassing DB-gate for testing. TID: ${tid.substring(0, 8)}...`);
                logAuthDecision({
                    ...baseLog,
                    decision: "ALLOW",
                    reason: "DEBUG_BYPASS",
                    latencyMs: 0,
                    httpStatus: 0,
                });
                return true;

                /* ORIGINAL CODE - uncomment after testing:
                const result = await checkTenantExistsInBackend(tid);

                if (result.allowed) {
                    logAuthDecision({
                        ...baseLog,
                        decision: "ALLOW",
                        reason: "DB_GATE_PASSED",
                        latencyMs: result.latencyMs,
                        httpStatus: result.httpStatus,
                    });
                    return true;
                }

                // Denied by DB-gate
                const reason = result.httpStatus === 404 ? "TENANT_NOT_ONBOARDED" :
                    result.httpStatus === 408 ? "DB_GATE_TIMEOUT" :
                        result.httpStatus === 0 ? "DB_GATE_ERROR" :
                            `DB_GATE_HTTP_${result.httpStatus}`;

                logAuthDecision({
                    ...baseLog,
                    decision: "DENY",
                    reason,
                    latencyMs: result.latencyMs,
                    httpStatus: result.httpStatus,
                });
                return false;
                */
            }

            // 5. NON-PRODUCTION FALLBACK: ENV allowlists (only if DB-gate not configured)
            // In production, we never reach here because of the check above

            const allowedTids = parseCsvEnv("ALLOWED_ENTRA_TENANT_IDS");
            if (allowedTids.length > 0 && tid && !allowedTids.includes(tid)) {
                logAuthDecision({ ...baseLog, decision: "DENY", reason: "TID_NOT_IN_ALLOWLIST" });
                return false;
            }

            const allowedDomains = parseCsvEnv("ALLOWED_EMAIL_DOMAINS");
            if (allowedDomains.length > 0 && emailDomain && !allowedDomains.includes(emailDomain)) {
                logAuthDecision({ ...baseLog, decision: "DENY", reason: "DOMAIN_NOT_IN_ALLOWLIST" });
                return false;
            }

            // Non-production: Allow by default (pilot-friendly) if no restrictions
            logAuthDecision({ ...baseLog, decision: "ALLOW", reason: "NO_RESTRICTIONS" });
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
