import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';

// Map platform to download info
const DOWNLOAD_MAP: Record<string, {
    filename: string;
    contentType: string;
    githubAsset: string;
}> = {
    windows: {
        filename: 'SecureClinicJournal_0.3.0_x64.msi',
        contentType: 'application/x-msi',
        // GitHub release download URL (fallback for now)
        githubAsset: 'https://github.com/Eliasquist/secure-clinic-journal/releases/download/v0.3.0/SecureClinicJournal_0.3.0_x64_msi.msi',
    },
    macos: {
        filename: 'SecureClinicJournal_0.3.0.dmg',
        contentType: 'application/x-apple-diskimage',
        githubAsset: '', // Not available yet
    },
};

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ platform: string }> }
) {
    try {
        const session = await auth();
        const { platform } = await params;

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Du må være innlogget for å laste ned' },
                { status: 401 }
            );
        }

        // Check subscription status
        const customers = await stripe.customers.list({
            email: session.user.email,
            limit: 1,
        });

        if (customers.data.length === 0) {
            return NextResponse.json(
                { error: 'Du må ha et aktivt abonnement for å laste ned' },
                { status: 403 }
            );
        }

        const customerId = customers.data[0].id;
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            return NextResponse.json(
                { error: 'Du må ha et aktivt abonnement for å laste ned' },
                { status: 403 }
            );
        }

        // Get download info
        const download = DOWNLOAD_MAP[platform];
        if (!download) {
            return NextResponse.json(
                { error: 'Ugyldig plattform' },
                { status: 400 }
            );
        }

        if (!download.githubAsset) {
            return NextResponse.json(
                { error: 'Denne plattformen er ikke tilgjengelig ennå' },
                { status: 404 }
            );
        }

        // For MVP, redirect to GitHub release
        // In production, this would generate a signed Azure Blob Storage URL
        console.log(`Download initiated: ${platform} by ${session.user.email}`);

        return NextResponse.json({
            url: download.githubAsset,
            filename: download.filename,
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: 'Nedlasting feilet' },
            { status: 500 }
        );
    }
}
