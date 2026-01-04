import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ subscription: null }, { status: 200 });
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
            // Check for other statuses
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
                        seats: 1,
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
                seats: 1,
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
