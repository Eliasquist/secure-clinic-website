import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe, PRICE_IDS, isStripeConfigured } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        if (!isStripeConfigured()) {
            return NextResponse.json(
                { error: 'Betalingssystem er ikke konfigurert' },
                { status: 503 }
            );
        }

        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Du må være innlogget for å abonnere' },
                { status: 401 }
            );
        }

        const tenantId = session.tenantId;
        if (!tenantId) {
            return NextResponse.json(
                { error: 'Mangler tenant-tilknytning. Kontakt support.' },
                { status: 400 }
            );
        }

        const { priceId, successUrl, cancelUrl, quantity = 1 } = await request.json();

        // Create or retrieve Stripe customer
        const customers = await stripe.customers.list({
            email: session.user.email,
            limit: 1,
        });

        let customerId: string;
        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email: session.user.email,
                name: session.user.name || undefined,
                metadata: {
                    tenantId,
                },
            });
            customerId = customer.id;
        }

        // Create checkout session
        // IMPORTANT: client_reference_id is used for tenant mapping in webhooks
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            client_reference_id: tenantId, // Critical for tenant mapping
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId || PRICE_IDS.BASIC_MONTHLY,
                    quantity: Math.max(1, quantity), // Per-seat, min 1
                },
            ],
            success_url: successUrl || `${request.nextUrl.origin}/dashboard/subscription?success=true`,
            cancel_url: cancelUrl || `${request.nextUrl.origin}/dashboard/subscription?canceled=true`,
            subscription_data: {
                metadata: {
                    tenantId,
                    userEmail: session.user.email,
                },
            },
            // Allow customers to adjust quantity in checkout if seats > 1
            allow_promotion_codes: true,
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
