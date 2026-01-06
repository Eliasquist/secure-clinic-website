// Edge Middleware - Rate limiting with Vercel KV + Auth protection
// Runs on Vercel Edge before hitting serverless function
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const config = {
    matcher: ["/api/chat", "/dashboard/:path*"],
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Auth protection for dashboard routes
    if (pathname.startsWith("/dashboard")) {
        // Check for session cookie
        // NextAuth v5 uses "authjs.session-token" (or "__Secure-authjs.session-token" on HTTPS)
        // NextAuth v4 used "next-auth.session-token"
        const sessionToken = req.cookies.get("authjs.session-token")?.value
            || req.cookies.get("__Secure-authjs.session-token")?.value
            // Fallback to v4 names for compatibility during migration
            || req.cookies.get("next-auth.session-token")?.value
            || req.cookies.get("__Secure-next-auth.session-token")?.value;

        if (!sessionToken) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Rate limiting for /api/chat
    if (pathname === "/api/chat") {
        // Parse x-forwarded-for correctly (take first IP in comma-separated list)
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") ||
            "unknown";

        // 20 requests per minute per IP
        const windowSec = 60;
        const max = 20;

        // Create bucket key per minute
        const bucket = Math.floor(Date.now() / (windowSec * 1000));
        const key = `rl:chat:${ip}:${bucket}`;

        try {
            // Increment counter and get current count
            const count = (await kv.incr(key)) as number;

            // Set expiration on first request in this bucket
            if (count === 1) {
                await kv.expire(key, windowSec);
            }

            // Enforce rate limit
            if (count > max) {
                return NextResponse.json(
                    { error: "For mange forespørsler. Prøv igjen litt senere." },
                    { status: 429 }
                );
            }
        } catch (error) {
            // If KV fails (e.g., not configured), log and allow through
            console.error("KV rate limit error:", error);
        }
    }

    return NextResponse.next();
}
