import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTenantAccess, computeEntitlement } from '@/lib/tenant-access';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ subscription: null });
        }

        const tenantId = session.tenantId;
        if (!tenantId) {
            return NextResponse.json({ subscription: null });
        }

        // Get tenant access and compute entitlement
        const access = getTenantAccess(tenantId);
        const entitlement = computeEntitlement(access);

        if (!access) {
            return NextResponse.json({ subscription: null });
        }

        // Return subscription info with trial/active differentiation
        return NextResponse.json({
            subscription: {
                status: access.status.toLowerCase(),
                source: access.source.toLowerCase(),
                mode: entitlement.entitled ? entitlement.mode : null,
                entitled: entitlement.entitled,
                reason: entitlement.reason,
                plan: access.status === 'TRIALING' ? 'Prøveperiode' : 'Professional',
                seats: access.seatLimit,
                seatsUsed: access.seatsUsed,
                // For trial: show trial end date
                // For active: show billing period end
                currentPeriodEnd: (access.trialEndsAt || access.activeUntil)?.toISOString() || null,
                trialEndsAt: access.trialEndsAt?.toISOString() || null,
                activeUntil: access.activeUntil?.toISOString() || null,
            },
        });
    } catch (error) {
        console.error('Subscription status error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription status' },
            { status: 500 }
        );
    }
}
