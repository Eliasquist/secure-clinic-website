import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import {
    TenantSubscription,
    upsertSubscription,
    getSubscriptionByCustomer,
    processedEvents,
    eventLogs,
    StripeEventLog,
} from '@/lib/subscription-store';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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

    // ============================================
    // STEP 1: Verify Stripe signature
    // ============================================
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // ============================================
    // STEP 2: Idempotency check - skip if already processed
    // ============================================
    if (processedEvents.has(event.id)) {
        console.log(`⏭️ Skipping already processed event: ${event.id}`);
        return NextResponse.json({ received: true, skipped: true });
    }

    console.log(`📥 Received webhook: ${event.type} (${event.id})`);

    // ============================================
    // STEP 3: Process the event
    // ============================================
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
            // ----------------------------------------
            // Primary event: Checkout completed
            // Creates initial tenant → customer mapping
            // ----------------------------------------
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const subscriptionId = session.subscription as string;
                const customerId = session.customer as string;
                // CRITICAL: tenantId comes from checkout metadata or client_reference_id
                const tenantId = session.metadata?.tenantId || session.client_reference_id || '';

                logEntry.stripeCustomerId = customerId;
                logEntry.tenantId = tenantId;

                if (!tenantId) {
                    console.error('❌ No tenantId in checkout session metadata!');
                    logEntry.error = 'Missing tenantId in metadata';
                    break;
                }

                // Fetch full subscription details
                const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
                const priceId = subscription.items?.data[0]?.price?.id || '';
                const quantity = subscription.items?.data[0]?.quantity || 1;

                const sub: TenantSubscription = {
                    tenantId,
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscriptionId,
                    status: subscription.status,
                    planId: priceId,
                    seatLimit: quantity,
                    seatUsed: 1, // Owner counts as 1
                    currentPeriodStart: new Date(subscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                upsertSubscription(sub);
                logEntry.processed = true;
                console.log(`✅ Subscription created for tenant ${tenantId}`);
                break;
            }

            // ----------------------------------------
            // Subscription updated (status, seats, period)
            // This is the SOURCE OF TRUTH for entitlements
            // ----------------------------------------
            case 'customer.subscription.updated':
            case 'customer.subscription.created': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                logEntry.stripeCustomerId = customerId;

                // Find existing subscription by customer
                const existing = getSubscriptionByCustomer(customerId);
                if (!existing) {
                    console.warn(`⚠️ Subscription update for unknown customer: ${customerId}`);
                    logEntry.error = 'Customer not found in local store';
                    break;
                }

                logEntry.tenantId = existing.tenantId;

                // Update entitlements
                existing.status = subscription.status;
                existing.seatLimit = subscription.items?.data[0]?.quantity || existing.seatLimit;
                existing.currentPeriodStart = new Date(subscription.current_period_start * 1000);
                existing.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
                existing.planId = subscription.items?.data[0]?.price?.id || existing.planId;

                upsertSubscription(existing);
                logEntry.processed = true;
                console.log(`✅ Subscription updated for tenant ${existing.tenantId}: ${subscription.status}`);
                break;
            }

            // ----------------------------------------
            // Subscription deleted/canceled
            // ----------------------------------------
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                logEntry.stripeCustomerId = customerId;

                const existing = getSubscriptionByCustomer(customerId);
                if (existing) {
                    existing.status = 'canceled';
                    upsertSubscription(existing);
                    logEntry.tenantId = existing.tenantId;
                    logEntry.processed = true;
                    console.log(`❌ Subscription canceled for tenant ${existing.tenantId}`);
                }
                break;
            }

            // ----------------------------------------
            // Invoice events for payment status
            // ----------------------------------------
            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                const customerId = invoice.customer as string;

                logEntry.stripeCustomerId = customerId;

                const existing = getSubscriptionByCustomer(customerId);
                if (existing && existing.status === 'active') {
                    existing.status = 'past_due';
                    upsertSubscription(existing);
                    logEntry.tenantId = existing.tenantId;
                    logEntry.processed = true;
                    console.log(`⚠️ Payment failed, tenant ${existing.tenantId} is now past_due`);
                }
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as any;
                const customerId = invoice.customer as string;

                logEntry.stripeCustomerId = customerId;

                const existing = getSubscriptionByCustomer(customerId);
                if (existing && existing.status === 'past_due') {
                    existing.status = 'active';
                    upsertSubscription(existing);
                    logEntry.tenantId = existing.tenantId;
                    logEntry.processed = true;
                    console.log(`✅ Payment succeeded, tenant ${existing.tenantId} restored to active`);
                }
                break;
            }

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        // Mark as processed for idempotency
        processedEvents.add(event.id);
        eventLogs.push(logEntry);

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('❌ Webhook handler error:', error);
        logEntry.error = error instanceof Error ? error.message : 'Unknown error';
        eventLogs.push(logEntry);

        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}
