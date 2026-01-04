import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import {
    getTenantAccessByCustomer,
    activateSubscription,
    updateSubscriptionStatus,
    accessChangeLogs,
    AccessChangeLog,
    AccessStatus
} from '@/lib/tenant-access';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper to map Stripe status to our AccessStatus
function mapStripeStatus(status: string): AccessStatus {
    switch (status) {
        case 'active': return 'ACTIVE';
        case 'trialing': return 'TRIALING';
        case 'past_due': return 'PAST_DUE';
        case 'unpaid': return 'PAST_DUE';
        case 'canceled': return 'CANCELED';
        case 'incomplete': return 'INACTIVE';
        case 'incomplete_expired': return 'INACTIVE';
        case 'paused': return 'INACTIVE';
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

    // IDEMPOTENCY check using Vercel KV
    const idempotencyKey = `stripe:event:${event.id}`;
    try {
        // NX: true (only set if not exists), EX: 86400 (expire in 24h)
        const isNew = await kv.set(idempotencyKey, '1', { nx: true, ex: 86400 });

        if (!isNew) {
            console.log(`⏭️ Skipping already processed event: ${event.id}`);
            return NextResponse.json({ received: true, skipped: true });
        }
    } catch (error) {
        console.warn('⚠️ KV idempotency check failed (falling back to process-always):', error);
        // Note: In strict prod, we might want to fail here. For MVP, we proceed but log valid warning.
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
                    console.error('❌ No tenantId in checkout session!');
                    // We throw error to ensure Stripe retries (and we don't mark as processed via 200)
                    // But wait, if we threw above, we already set the idempotency key?
                    // Ideally we should set idempotency AFTER success, or use a "processing" state.
                    // However, standard pattern: if we fail here, we should probably DELETE the key or let it remain processed?
                    // Actually, if we fail, Stripe retries. If we set key, next retry is skipped.
                    // FIX: Delete idempotency key if crucial processing fails.
                    await kv.del(idempotencyKey);
                    return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 });
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
                    oldStatus: 'TRIALING', // Assumption: coming from trial or new
                    newStatus: 'ACTIVE',
                    source: 'STRIPE',
                    metadata: { subscriptionId, quantity },
                };
                accessChangeLogs.push(changeLog);

                console.log(`✅ Subscription activated for tenant ${tenantId}`);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                const existing = await getTenantAccessByCustomer(customerId);
                if (!existing) {
                    // Usually harmless for 'created' if checkout hasn't finished, OR if we don't have mapping yet.
                    // For 'created', checkout.session.completed normally handles creation.
                    // We log warning but don't fail, to avoid retry loops on unmapped customers.
                    console.warn(`⚠️ Subscription update for unknown customer: ${customerId}`);
                    break;
                }

                const quantity = subscription.items?.data[0]?.quantity || existing.seatLimit;
                const activeUntil = new Date(subscription.current_period_end * 1000);
                const newStatus = mapStripeStatus(subscription.status);

                await updateSubscriptionStatus(existing.tenantId, newStatus, activeUntil, quantity);
                console.log(`✅ Subscription synced for tenant ${existing.tenantId}: ${newStatus}`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                const existing = await getTenantAccessByCustomer(customerId);
                if (existing) {
                    await updateSubscriptionStatus(existing.tenantId, 'CANCELED');
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
                        const activeUntil = new Date(subscription.current_period_end * 1000);
                        await updateSubscriptionStatus(existing.tenantId, 'ACTIVE', activeUntil);
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

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('❌ Webhook handler error:', error);

        // Critical: If processing failed, we want Stripe to retry.
        // We MUST delete the idempotency key so the retry isn't skipped.
        await kv.del(idempotencyKey);

        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
