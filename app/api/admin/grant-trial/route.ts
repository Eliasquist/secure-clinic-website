import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { grantTrial, AccessChangeLog, accessChangeLogs } from '@/lib/tenant-access';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        // 1. Authentication check
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userEmail = session.user.email;

        // 2. Authorization check (Superadmin)
        // Load allowed emails from env var, defaulting to empty if not set
        const allowedEmailsStr = process.env.SUPERADMIN_EMAILS || '';
        const allowedEmails = allowedEmailsStr.split(',').map(e => e.trim().toLowerCase());

        if (allowedEmails.length === 0) {
            console.error('❌ SUPERADMIN_EMAILS env var is missing or empty.');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        if (!allowedEmails.includes(userEmail.toLowerCase())) {
            console.warn(`🛑 Unauthorized trial grant attempt by ${userEmail}`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 3. Parse and Validate Request
        const body = await request.json();
        const { tenantId, days = 14, seatLimit = 1 } = body;

        if (!tenantId || typeof tenantId !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid tenantId' }, { status: 400 });
        }

        // Operational Limits (Safety)
        if (days > 60) {
            return NextResponse.json({ error: 'Days cannot exceed 60' }, { status: 400 });
        }
        if (seatLimit > 50) {
            return NextResponse.json({ error: 'Seat limit cannot exceed 50 for manual trials' }, { status: 400 });
        }

        // 4. Grant trial
        const access = await grantTrial(tenantId, days, seatLimit);

        // 5. Log the action (Audit)
        const logEntry: AccessChangeLog = {
            timestamp: new Date(),
            tenantId,
            action: 'GRANT_TRIAL',
            oldStatus: null, // Unknown/New
            newStatus: 'TRIALING',
            source: 'MANUAL',
            actorEmail: userEmail,
            metadata: { days, seatLimit }
        };
        accessChangeLogs.push(logEntry);

        console.log(`👮 Admin ${userEmail} granted trial to ${tenantId}`);

        return NextResponse.json({
            success: true,
            access,
            message: `Trial granted for ${days} days with ${seatLimit} seats.`
        });

    } catch (error) {
        console.error('Grant manual trial error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
