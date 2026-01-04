import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import {
    getTenantAccessByCustomer,
    activateSubscription,
    updateSubscriptionStatus,
    accessChangeLogs,
    AccessChangeLog,
} from '@/lib/tenant-access';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Idempotency: Track processed event IDs (in-memory, use Redis in production)
const processedEvents = new Set<string>();

// Event log for audit
interface StripeEventLog {
    eventId: string;
    eventType: string;
    stripeCustomerId: string;
    tenantId: string;
    timestamp: Date;
    processed: boolean;
    error?: string;
}
const stripeEventLogs: StripeEventLog[] = [];

export async function POST(request: NextRequest) {
    if (!isStripeConfigured()) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event;

    // STEP 1: Verify Stripe signature
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // STEP 2: Idempotency check
    if (processedEvents.has(event.id)) {
        console.log(`⏭️ Skipping already processed event: ${event.id}`);
        return NextResponse.json({ received: true, skipped: true });
    }

    console.log(`📥 Received webhook: ${event.type} (${event.id})`);

    // STEP 3: Process the event
    const logEntry: StripeEventLog = {
        eventId: event.id,
        eventType: event.type,
        stripeCustomerId: '',
        tenantId: '',
        timestamp: new Date(),
        processed: false,
    };

    try {
        switch (event.type) {
            // Checkout completed - activate subscription
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const subscriptionId = session.subscription as string;
                const customerId = session.customer as string;
                const tenantId = session.metadata?.tenantId || session.client_reference_id || '';

                logEntry.stripeCustomerId = customerId;
                logEntry.tenantId = tenantId;

                if (!tenantId) {
                    console.error('❌ No tenantId in checkout session!');
                    logEntry.error = 'Missing tenantId';
                    break;
                }

                // Fetch subscription details
                const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
                const quantity = subscription.items?.data[0]?.quantity || 1;
                const activeUntil = new Date(subscription.current_period_end * 1000);

                // Activate subscription (converts trial to paid)
                await activateSubscription(tenantId, customerId, subscriptionId, activeUntil, quantity);

                // Log the change
                const changeLog: AccessChangeLog = {
                    timestamp: new Date(),
                    tenantId,
                    action: 'ACTIVATE',
                    oldStatus: 'TRIALING',
                    newStatus: 'ACTIVE',
                    source: 'STRIPE',
                    metadata: { subscriptionId, quantity },
                };
                accessChangeLogs.push(changeLog);

                logEntry.processed = true;
                console.log(`✅ Subscription activated for tenant ${tenantId}`);
                break;
            }

            // Subscription updated - sync status
            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                logEntry.stripeCustomerId = customerId;

                const existing = await getTenantAccessByCustomer(customerId);
                if (!existing) {
                    console.warn(`⚠️ Update for unknown customer: ${customerId}`);
                    logEntry.error = 'Customer not found';
                    break;
                }

                logEntry.tenantId = existing.tenantId;

                const quantity = subscription.items?.data[0]?.quantity || existing.seatLimit;
                const activeUntil = new Date(subscription.current_period_end * 1000);

                // Map Stripe status to our status
                let newStatus = existing.status;
                if (subscription.status === 'active') newStatus = 'ACTIVE';
                else if (subscription.status === 'past_due') newStatus = 'PAST_DUE';
                else if (subscription.status === 'canceled') newStatus = 'CANCELED';
                else if (subscription.status === 'incomplete') newStatus = 'INACTIVE';

                await updateSubscriptionStatus(existing.tenantId, newStatus, activeUntil, quantity);

                logEntry.processed = true;
                console.log(`✅ Subscription updated for tenant ${existing.tenantId}: ${newStatus}`);
                break;
            }

            // Subscription deleted
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                logEntry.stripeCustomerId = customerId;

                const existing = await getTenantAccessByCustomer(customerId);
                if (existing) {
                    await updateSubscriptionStatus(existing.tenantId, 'CANCELED');
                    logEntry.tenantId = existing.tenantId;
                    logEntry.processed = true;
                    console.log(`❌ Subscription canceled for tenant ${existing.tenantId}`);
                }
                break;
            }

            // Invoice paid - renew
            case 'invoice.paid': {
                const invoice = event.data.object as any;
                const customerId = invoice.customer as string;
                const subscriptionId = invoice.subscription as string;

                logEntry.stripeCustomerId = customerId;

                if (subscriptionId) {
                    const existing = await getTenantAccessByCustomer(customerId);
                    if (existing) {
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
                        const activeUntil = new Date(subscription.current_period_end * 1000);
                        await updateSubscriptionStatus(existing.tenantId, 'ACTIVE', activeUntil);
                        logEntry.tenantId = existing.tenantId;
                        logEntry.processed = true;
                        console.log(`✅ Invoice paid, renewed tenant ${existing.tenantId}`);
                    }
                }
                break;
            }

            // Payment failed
            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                const customerId = invoice.customer as string;

                logEntry.stripeCustomerId = customerId;

                const existing = await getTenantAccessByCustomer(customerId);
                if (existing) {
                    await updateSubscriptionStatus(existing.tenantId, 'PAST_DUE');
                    logEntry.tenantId = existing.tenantId;
                    logEntry.processed = true;
                    console.log(`⚠️ Payment failed for tenant ${existing.tenantId}`);
                }
                break;
            }

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        processedEvents.add(event.id);
        stripeEventLogs.push(logEntry);

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('❌ Webhook handler error:', error);
        logEntry.error = error instanceof Error ? error.message : 'Unknown error';
        stripeEventLogs.push(logEntry);

        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

export { stripeEventLogs };
