// Edge Middleware - Rate limiting with Vercel KV
// Runs on Vercel Edge before hitting serverless function
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const config = {
    matcher: ["/api/chat"],
};

export async function middleware(req: NextRequest) {
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
        // This prevents complete failure if KV is down
        console.error("KV rate limit error:", error);
        // Continue to next() - fail open rather than fail closed
    }

    return NextResponse.next();
}
