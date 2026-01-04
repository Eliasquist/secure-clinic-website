import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import {
    hasActiveSubscription,
    downloadLogs,
    DownloadLog,
} from '@/lib/subscription-store';

// ============================================
// WHITELIST: Only allowed platforms/assets
// ============================================
const ALLOWED_PLATFORMS = ['windows', 'macos'] as const;
type Platform = typeof ALLOWED_PLATFORMS[number];

// ============================================
// RELEASE CONFIGURATION
// In production, this would come from database or releases API
// ============================================
interface ReleaseAsset {
    filename: string;
    contentType: string;
    size: string;
    checksum: string;
    sourceUrl: string;
    available: boolean;
}

const RELEASES: Record<Platform, ReleaseAsset> = {
    windows: {
        filename: 'SecureClinicJournal_0.3.0_x64.msi',
        contentType: 'application/x-msi',
        size: '~65 MB',
        checksum: 'TBD',
        sourceUrl: 'https://github.com/Eliasquist/secure-clinic-journal/releases/download/v0.3.0/SecureClinicJournal_0.3.0_x64_msi.msi',
        available: true,
    },
    macos: {
        filename: 'SecureClinicJournal_0.3.0.dmg',
        contentType: 'application/x-apple-diskimage',
        size: '~80 MB',
        checksum: 'TBD',
        sourceUrl: '',
        available: false,
    },
};

// ============================================
// RATE LIMITING: Per-tenant, in-memory
// ============================================
interface RateLimit {
    count: number;
    resetAt: Date;
}
const rateLimits = new Map<string, RateLimit>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(tenantId: string): { allowed: boolean; remaining: number } {
    const now = new Date();
    let limit = rateLimits.get(tenantId);

    if (!limit || now > limit.resetAt) {
        limit = { count: 0, resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS) };
    }

    if (limit.count >= RATE_LIMIT_MAX) {
        return { allowed: false, remaining: 0 };
    }

    limit.count++;
    rateLimits.set(tenantId, limit);
    return { allowed: true, remaining: RATE_LIMIT_MAX - limit.count };
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ platform: string }> }
) {
    const startTime = Date.now();
    const { platform } = await params;

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const logEntry: DownloadLog = {
        timestamp: new Date(),
        tenantId: '',
        userId: '',
        userEmail: '',
        platform,
        filename: '',
        ip,
        userAgent,
        success: false,
    };

    try {
        // STEP 1: Validate platform (whitelist)
        if (!ALLOWED_PLATFORMS.includes(platform as Platform)) {
            logEntry.error = 'Invalid platform';
            downloadLogs.push(logEntry);
            return NextResponse.json(
                { error: 'Ugyldig plattform. Tillatt: windows, macos' },
                { status: 400 }
            );
        }

        const release = RELEASES[platform as Platform];
        logEntry.filename = release.filename;

        if (!release.available) {
            logEntry.error = 'Platform not available';
            downloadLogs.push(logEntry);
            return NextResponse.json(
                { error: 'Denne plattformen er ikke tilgjengelig ennå' },
                { status: 404 }
            );
        }

        // STEP 2: Check authentication
        const session = await auth();

        if (!session?.user?.email) {
            logEntry.error = 'Not authenticated';
            downloadLogs.push(logEntry);
            return NextResponse.json(
                { error: 'Du må være innlogget for å laste ned' },
                { status: 401 }
            );
        }

        logEntry.userEmail = session.user.email;
        logEntry.userId = session.user.id || session.user.email;

        // STEP 3: Get tenant and check entitlements
        const tenantId = session.tenantId;

        if (!tenantId) {
            logEntry.error = 'No tenant ID';
            downloadLogs.push(logEntry);
            return NextResponse.json(
                { error: 'Mangler tenant-tilknytning. Kontakt support.' },
                { status: 403 }
            );
        }

        logEntry.tenantId = tenantId;

        // Check local entitlements first (fast, source of truth)
        let isActive = hasActiveSubscription(tenantId);

        // Fallback to Stripe if local store is empty
        if (!isActive && isStripeConfigured()) {
            const customers = await stripe.customers.list({
                email: session.user.email,
                limit: 1,
            });

            if (customers.data.length > 0) {
                const subscriptions = await stripe.subscriptions.list({
                    customer: customers.data[0].id,
                    status: 'active',
                    limit: 1,
                });
                isActive = subscriptions.data.length > 0;
            }
        }

        if (!isActive) {
            logEntry.error = 'No active subscription';
            downloadLogs.push(logEntry);
            return NextResponse.json(
                { error: 'Du må ha et aktivt abonnement for å laste ned' },
                { status: 403 }
            );
        }

        // STEP 4: Rate limiting
        const { allowed, remaining } = checkRateLimit(tenantId);

        if (!allowed) {
            logEntry.error = 'Rate limit exceeded';
            downloadLogs.push(logEntry);
            return NextResponse.json(
                { error: 'For mange nedlastninger. Prøv igjen om en time.' },
                { status: 429, headers: { 'Retry-After': '3600' } }
            );
        }

        // STEP 5: Generate download URL
        const downloadUrl = release.sourceUrl;

        logEntry.success = true;
        downloadLogs.push(logEntry);

        console.log(`📥 Download: ${platform} by ${session.user.email} (tenant: ${tenantId}) - ${Date.now() - startTime}ms`);

        return NextResponse.json({
            url: downloadUrl,
            filename: release.filename,
            size: release.size,
            checksum: release.checksum,
            remaining,
        });
    } catch (error) {
        console.error('Download error:', error);
        logEntry.error = error instanceof Error ? error.message : 'Unknown error';
        downloadLogs.push(logEntry);

        return NextResponse.json(
            { error: 'Nedlasting feilet. Prøv igjen.' },
            { status: 500 }
        );
    }
}
