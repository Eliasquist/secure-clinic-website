import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { subscriptionsByTenant } from '@/lib/subscription-store';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ subscription: null });
        }

        const tenantId = session.tenantId;
        if (!tenantId) {
            return NextResponse.json({ subscription: null });
        }

        // ============================================
        // SOURCE OF TRUTH: Local entitlements store
        // This is faster and more reliable than Stripe API
        // ============================================
        const localSub = subscriptionsByTenant.get(tenantId);

        if (localSub) {
            return NextResponse.json({
                subscription: {
                    status: localSub.status,
                    plan: localSub.planId || 'Professional',
                    currentPeriodEnd: localSub.currentPeriodEnd.toISOString(),
                    seats: localSub.seatLimit,
                    seatsUsed: localSub.seatUsed,
                },
            });
        }

        // ============================================
        // FALLBACK: Check Stripe directly
        // Only used if webhook hasn't populated local store yet
        // ============================================
        if (!isStripeConfigured()) {
            return NextResponse.json({ subscription: null });
        }

        // Find customer by email
        const customers = await stripe.customers.list({
            email: session.user.email,
            limit: 1,
        });

        if (customers.data.length === 0) {
            return NextResponse.json({ subscription: null });
        }

        const customerId = customers.data[0].id;

        // Get active subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            // Check for other statuses (trialing, past_due)
            const allSubscriptions = await stripe.subscriptions.list({
                customer: customerId,
                limit: 1,
            });

            if (allSubscriptions.data.length > 0) {
                const sub = allSubscriptions.data[0] as any;
                return NextResponse.json({
                    subscription: {
                        status: sub.status,
                        plan: sub.items?.data[0]?.price?.nickname || 'Professional',
                        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
                        seats: sub.items?.data[0]?.quantity || 1,
                        seatsUsed: 1,
                    },
                });
            }

            return NextResponse.json({ subscription: null });
        }

        const subscription = subscriptions.data[0] as any;

        return NextResponse.json({
            subscription: {
                status: subscription.status,
                plan: subscription.items?.data[0]?.price?.nickname || 'Professional',
                currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
                seats: subscription.items?.data[0]?.quantity || 1,
                seatsUsed: 1,
            },
        });
    } catch (error) {
        console.error('Subscription status error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription status' },
            { status: 500 }
        );
    }
}
