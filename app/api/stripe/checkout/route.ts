import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe, PRICE_IDS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'You must be logged in to subscribe' },
                { status: 401 }
            );
        }

        const { priceId, successUrl, cancelUrl } = await request.json();

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
                    tenantId: session.tenantId || '',
                },
            });
            customerId = customer.id;
        }

        // Create checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId || PRICE_IDS.BASIC_MONTHLY,
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${request.nextUrl.origin}/dashboard/subscription?success=true`,
            cancel_url: cancelUrl || `${request.nextUrl.origin}/dashboard/subscription?canceled=true`,
            subscription_data: {
                metadata: {
                    tenantId: session.tenantId || '',
                    userEmail: session.user.email,
                },
            },
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
