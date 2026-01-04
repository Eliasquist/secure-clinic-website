import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';

// Release info - In production, this would come from a database or API
const RELEASES = {
    latest: {
        version: '0.3.0',
        releaseDate: '2026-01-04',
        changelog: [
            'Forbedret PKCE-autentisering for desktop',
            'Fikset Azure Container Apps konfigurasjon',
            'Oppgradert sikkerhet og stabilitet',
        ],
        downloads: {
            windows: {
                filename: 'SecureClinicJournal_0.3.0_x64_msi.msi',
                size: '~65 MB',
                checksum: 'TBD - Will be populated from release',
            },
        },
    },
};

export async function GET() {
    return NextResponse.json({ release: RELEASES.latest });
}
