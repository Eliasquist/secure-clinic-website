import Stripe from 'stripe';

// Initialize Stripe client only when secret key is available
// During build time, this may not be set
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2025-12-15.clover',
        typescript: true,
    })
    : (null as unknown as Stripe);

// Helper to check if Stripe is configured
export function isStripeConfigured(): boolean {
    return !!process.env.STRIPE_SECRET_KEY;
}

// Price IDs - these should be created in Stripe Dashboard
export const PRICE_IDS = {
    // Monthly subscription with 1 seat included
    BASIC_MONTHLY: process.env.STRIPE_PRICE_BASIC_MONTHLY || 'price_xxx',
    // Per-seat add-on
    SEAT_MONTHLY: process.env.STRIPE_PRICE_SEAT_MONTHLY || 'price_xxx',
} as const;
