
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const vars = [
        "AZURE_AD_CLIENT_ID",
        "AZURE_AD_CLIENT_SECRET",
        "AZURE_AD_TENANT_ID",
        "AUTH_SECRET",
        "NEXTAUTH_SECRET",
        "NEXTAUTH_URL",
        "NEXT_PUBLIC_API_URL",
        "NODE_ENV"
    ];

    const status: Record<string, any> = {};

    vars.forEach(key => {
        const value = process.env[key];
        status[key] = {
            exists: !!value,
            length: value ? value.length : 0,
            prefix: value ? value.substring(0, 3) + "..." : "N/A",
            is_empty_string: value === "",
        };
    });

    return NextResponse.json({
        canary: "alive",
        timestamp: new Date().toISOString(),
        env_status: status,
        process_env_keys: Object.keys(process.env).sort(),
    }, { status: 200 });
}
