import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import {
    getTenantAccessByCustomer,
    activateSubscription,
    updateSubscriptionStatus,
    accessChangeLogs,
    logAccessChange,
    AccessChangeLog,
    AccessStatus,
    isKvConfigured
} from '@/lib/tenant-access';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper to map Stripe status to our AccessStatus (Explicit Mapping)
function mapStripeStatus(status: string): AccessStatus {
    switch (status) {
        case 'active': return 'ACTIVE';
        case 'trialing': return 'TRIALING';
        case 'past_due': return 'PAST_DUE';
        case 'unpaid': return 'PAST_DUE';
        case 'paused': return 'PAST_DUE'; // Treat paused as past_due to block new downloads
        case 'canceled': return 'CANCELED';
        case 'incomplete': return 'INACTIVE';
        case 'incomplete_expired': return 'INACTIVE';
        default: return 'INACTIVE';
    }
}

export async function POST(request: NextRequest) {
    if (!isStripeConfigured()) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // IDEMPOTENCY: Two-Phase Commit Pattern
    const idempotencyKey = `stripe:event:${event.id}`;

    // Fail-Closed check for KV in production
    if (process.env.NODE_ENV === 'production' && !isKvConfigured()) {
        console.error('CRITICAL: KV not configured in production. Cannot handle webhook idempotency.');
        return NextResponse.json({ error: 'System Configuration Error' }, { status: 503 });
    }

    try {
        if (isKvConfigured()) {
            // NX: true (only set if not exists), EX: 600 (10 min processing timeout)
            // If key exists (processing or done), we skip.
            // If "processing" expires (crash), we can retry safely after 10m.
            const result = await kv.set(idempotencyKey, 'processing', { nx: true, ex: 600 });
            // kv.set with NX returns 'OK' on success, null if key already exists
            const isNew = result === 'OK';

            if (!isNew) {
                console.log(`⏭️ Skipping already processed/processing event: ${event.id}`);
                return NextResponse.json({ received: true, skipped: true });
            }
        }
    } catch (error) {
        // If KV fails in prod, we must 500 so Stripe retries later when KV might be up
        console.error('❌ KV error during idempotency check:', error);
        return NextResponse.json({ error: 'Idempotency check failed' }, { status: 503 });
    }

    console.log(`📥 Received webhook: ${event.type} (${event.id})`);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const subscriptionId = session.subscription as string;
                const customerId = session.customer as string;
                const tenantId = session.metadata?.tenantId || session.client_reference_id || '';

                if (!tenantId) {
                    console.error('❌ No tenantId in checkout session! Throwing to retry.');
                    // Throw error to trigger catch block -> delete key -> return 500 -> Stripe retry
                    throw new Error('Missing tenantId in checkout session');
                }

                const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
                const quantity = subscription.items?.data[0]?.quantity || 1;
                const activeUntil = new Date(subscription.current_period_end * 1000);

                await activateSubscription(tenantId, customerId, subscriptionId, activeUntil, quantity);

                // Audit log
                const changeLog: AccessChangeLog = {
                    timestamp: new Date(),
                    tenantId,
                    action: 'ACTIVATE',
                    oldStatus: 'TRIALING',
                    newStatus: 'ACTIVE',
                    source: 'STRIPE',
                    metadata: { subscriptionId, quantity },
                };
                logAccessChange(changeLog);

                console.log(`✅ Subscription activated for tenant ${tenantId}`);
                break;
            }

            case 'customer.subscription.created': {
                // Only map if we already know the customer (race condition handling)
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                const existing = await getTenantAccessByCustomer(customerId);
                if (existing) {
                    const quantity = subscription.items?.data[0]?.quantity || existing.seatLimit;
                    const activeUntil = new Date(subscription.current_period_end * 1000);
                    const newStatus = mapStripeStatus(subscription.status);
                    await updateSubscriptionStatus(existing.tenantId, newStatus, activeUntil, quantity);

                    logAccessChange({
                        timestamp: new Date(),
                        tenantId: existing.tenantId,
                        action: 'UPDATE_STATUS',
                        oldStatus: existing.status,
                        newStatus,
                        source: 'STRIPE',
                        metadata: { reason: 'subscription.created sync' }
                    });

                    console.log(`✅ Subscription synced for tenant ${existing.tenantId}: ${newStatus}`);
                } else {
                    console.log(`ℹ️ Unmapped customer created: ${customerId} (waiting for checkout completion)`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                const existing = await getTenantAccessByCustomer(customerId);
                if (!existing) {
                    console.warn(`⚠️ Subscription update for unknown customer: ${customerId}`);
                    // We don't throw here, as it might be a zombie event or test data
                    break;
                }

                const quantity = subscription.items?.data[0]?.quantity || existing.seatLimit;
                const activeUntil = new Date(subscription.current_period_end * 1000);
                const newStatus = mapStripeStatus(subscription.status);

                await updateSubscriptionStatus(existing.tenantId, newStatus, activeUntil, quantity);

                logAccessChange({
                    timestamp: new Date(),
                    tenantId: existing.tenantId,
                    action: 'UPDATE_STATUS',
                    oldStatus: existing.status,
                    newStatus,
                    source: 'STRIPE',
                    metadata: { reason: 'subscription.updated' }
                });

                console.log(`✅ Subscription updated for tenant ${existing.tenantId}: ${newStatus}`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                const existing = await getTenantAccessByCustomer(customerId);
                if (existing) {
                    await updateSubscriptionStatus(existing.tenantId, 'CANCELED');

                    logAccessChange({
                        timestamp: new Date(),
                        tenantId: existing.tenantId,
                        action: 'CANCEL',
                        oldStatus: existing.status,
                        newStatus: 'CANCELED',
                        source: 'STRIPE',
                        metadata: { reason: 'subscription.deleted' }
                    });

                    console.log(`❌ Subscription canceled for tenant ${existing.tenantId}`);
                }
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as any;
                const customerId = invoice.customer as string;
                const subscriptionId = invoice.subscription as string;

                if (subscriptionId) {
                    const existing = await getTenantAccessByCustomer(customerId);
                    if (existing) {
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
                        const quantity = subscription.items?.data[0]?.quantity || existing.seatLimit;
                        const activeUntil = new Date(subscription.current_period_end * 1000);

                        await updateSubscriptionStatus(existing.tenantId, 'ACTIVE', activeUntil, quantity);
                        console.log(`✅ Invoice paid, renewed tenant ${existing.tenantId}`);
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                const customerId = invoice.customer as string;
                const existing = await getTenantAccessByCustomer(customerId);

                if (existing) {
                    await updateSubscriptionStatus(existing.tenantId, 'PAST_DUE');
                    console.log(`⚠️ Payment failed for tenant ${existing.tenantId}`);
                }
                break;
            }

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        // 2. Mark as DONE (Long TTL)
        // If we reach here, processing succeeded. Update key to 'done' valid for 30 days.
        try {
            if (isKvConfigured()) {
                await kv.set(idempotencyKey, 'done', { ex: 60 * 60 * 24 * 30 }); // 30 days
            }
        } catch (kvError) {
            console.error('⚠️ Failed to mark event as done in KV (processing succeeded). Extending expiry.', kvError);
            // Fallback: Extend 'processing' timeout if we can't write 'done'
            try {
                if (isKvConfigured()) await kv.expire(idempotencyKey, 60 * 60 * 24 * 30);
            } catch (e) { /* ignore secondary fail */ }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('❌ Webhook handler error:', error);

        // Critical: Delete idempotency key so Stripe retry is allowed.
        try {
            if (isKvConfigured()) await kv.del(idempotencyKey);
            console.log('🗑️ Deleted idempotency key to allow retry');
        } catch (delError) {
            console.error('☠️ Failed to delete idempotency key during error handling', delError);
        }

        // Return 500 to trigger Stripe retry
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
