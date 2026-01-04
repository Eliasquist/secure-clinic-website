import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
        authenticated: true,
        user: {
            name: session.user?.name,
            email: session.user?.email,
            id: session.user?.id,
        },
        // Critical for operational support (grant-trial)
        tenantId: session.tenantId,
        expires: session.expires,
    });
}
