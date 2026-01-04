import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Subscription storage - In production, this would be a database
// For now, we'll use Vercel KV or a simple in-memory store
const subscriptions = new Map<string, {
    customerId: string;
    subscriptionId: string;
    status: string;
    currentPeriodEnd: Date;
    tenantId: string;
}>();

export async function POST(request: NextRequest) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const subscriptionId = session.subscription as string;
                const customerId = session.customer as string;
                const tenantId = session.metadata?.tenantId || '';

                // Fetch subscription details
                const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

                // Store subscription info
                subscriptions.set(customerId, {
                    customerId,
                    subscriptionId,
                    status: subscription.status,
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    tenantId,
                });

                console.log(`✅ Subscription activated for customer ${customerId}`);
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as any;
                const customerId = invoice.customer as string;
                const subscriptionId = invoice.subscription as string;

                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
                    const existing = subscriptions.get(customerId);

                    if (existing) {
                        existing.status = subscription.status;
                        existing.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
                        subscriptions.set(customerId, existing);
                    }

                    console.log(`✅ Invoice paid, subscription renewed for ${customerId}`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                const existing = subscriptions.get(customerId);
                if (existing) {
                    existing.status = 'canceled';
                    subscriptions.set(customerId, existing);
                }

                console.log(`❌ Subscription canceled for ${customerId}`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                const existing = subscriptions.get(customerId);
                if (existing) {
                    existing.status = subscription.status;
                    existing.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
                    subscriptions.set(customerId, existing);
                }

                console.log(`🔄 Subscription updated for ${customerId}: ${subscription.status}`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

// Export for checking subscription status
export { subscriptions };
