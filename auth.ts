import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

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
        async jwt({ token, account }) {
            // Persist accessToken and tenantId from Azure to the JWT
            if (account) {
                token.accessToken = account.access_token;
                token.tenantId = account.providerAccountId?.split(".")[1]; // Extract tenant from oid
            }
            return token;
        },
        async session({ session, token }) {
            // Make accessToken available to client
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
