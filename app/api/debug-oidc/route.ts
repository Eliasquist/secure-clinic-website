
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const tenantId = process.env.AZURE_AD_TENANT_ID;

    if (!tenantId) {
        return NextResponse.json({ error: "AZURE_AD_TENANT_ID not set" }, { status: 500 });
    }

    const isCommon = tenantId === "common";
    const issuer = isCommon
        ? "https://login.microsoftonline.com/common/v2.0"
        : `https://login.microsoftonline.com/${tenantId}/v2.0`;

    const metadataUrl = `${issuer}/.well-known/openid-configuration`;

    try {
        const start = Date.now();
        const res = await fetch(metadataUrl);
        const latency = Date.now() - start;

        if (!res.ok) {
            return NextResponse.json({
                status: "error",
                metadataUrl,
                httpStatus: res.status,
                text: await res.text(),
                latency
            }, { status: 500 });
        }

        const data = await res.json();
        return NextResponse.json({
            status: "success",
            metadataUrl,
            issuer: data.issuer, // Verify this matches
            latency,
            authorization_endpoint: data.authorization_endpoint
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "exception",
            metadataUrl,
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
