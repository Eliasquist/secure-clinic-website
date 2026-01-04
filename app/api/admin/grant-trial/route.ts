import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { grantTrial, accessChangeLogs, AccessChangeLog } from '@/lib/tenant-access';

// List of superadmin emails (in production, use role claims from Entra)
const SUPERADMIN_EMAILS = [
    'elias@secureclinic.no',
    'admin@secureclinic.no',
    // Add your email here
];

function isSuperAdmin(email: string | null | undefined): boolean {
    if (!email) return false;
    return SUPERADMIN_EMAILS.includes(email.toLowerCase());
}

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Superadmin check
        if (!isSuperAdmin(session.user.email)) {
            console.warn(`⚠️ Unauthorized grant-trial attempt by ${session.user.email}`);
            return NextResponse.json(
                { error: 'Superadmin access required' },
                { status: 403 }
            );
        }

        // Parse request
        const { tenantId, days = 14, seatLimit = 1 } = await request.json();

        if (!tenantId) {
            return NextResponse.json(
                { error: 'tenantId is required' },
                { status: 400 }
            );
        }

        if (days < 1 || days > 90) {
            return NextResponse.json(
                { error: 'days must be between 1 and 90' },
                { status: 400 }
            );
        }

        if (seatLimit < 1 || seatLimit > 100) {
            return NextResponse.json(
                { error: 'seatLimit must be between 1 and 100' },
                { status: 400 }
            );
        }

        // Grant trial
        const access = grantTrial(tenantId, days, seatLimit);

        // Log the action
        const logEntry: AccessChangeLog = {
            timestamp: new Date(),
            tenantId,
            action: 'GRANT_TRIAL',
            oldStatus: null,
            newStatus: 'TRIAL',
            source: 'MANUAL',
            actorEmail: session.user.email,
            metadata: { days, seatLimit },
        };
        accessChangeLogs.push(logEntry);

        console.log(`✅ Trial granted by ${session.user.email} to tenant ${tenantId} for ${days} days`);

        return NextResponse.json({
            success: true,
            access: {
                tenantId: access.tenantId,
                status: access.status,
                trialEndsAt: access.trialEndsAt?.toISOString(),
                seatLimit: access.seatLimit,
            },
        });
    } catch (error) {
        console.error('Grant trial error:', error);
        return NextResponse.json(
            { error: 'Failed to grant trial' },
            { status: 500 }
        );
    }
}

// GET: List recent access changes (for audit)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email || !isSuperAdmin(session.user.email)) {
            return NextResponse.json(
                { error: 'Superadmin access required' },
                { status: 403 }
            );
        }

        // Return last 50 access changes
        const recentLogs = accessChangeLogs.slice(-50).reverse();

        return NextResponse.json({ logs: recentLogs });
    } catch (error) {
        console.error('Get access logs error:', error);
        return NextResponse.json(
            { error: 'Failed to get access logs' },
            { status: 500 }
        );
    }
}
