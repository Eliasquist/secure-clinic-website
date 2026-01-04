// ============================================
// SUBSCRIPTION STORE: Tenant-scoped entitlements
// In production, this should be a database table + Redis cache
// ============================================

export interface TenantSubscription {
    tenantId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
    planId: string;
    seatLimit: number;
    seatUsed: number;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Indexed by tenantId for fast lookup
export const subscriptionsByTenant = new Map<string, TenantSubscription>();

// Also index by stripeCustomerId for webhook lookups
export const subscriptionsByCustomer = new Map<string, TenantSubscription>();

// Helper to update subscription (maintains both indexes)
export function upsertSubscription(sub: TenantSubscription) {
    sub.updatedAt = new Date();
    subscriptionsByTenant.set(sub.tenantId, sub);
    subscriptionsByCustomer.set(sub.stripeCustomerId, sub);
}

// Get subscription by tenant ID
export function getSubscriptionByTenant(tenantId: string): TenantSubscription | undefined {
    return subscriptionsByTenant.get(tenantId);
}

// Get subscription by Stripe customer ID
export function getSubscriptionByCustomer(customerId: string): TenantSubscription | undefined {
    return subscriptionsByCustomer.get(customerId);
}

// Check if tenant has active subscription
export function hasActiveSubscription(tenantId: string): boolean {
    const sub = subscriptionsByTenant.get(tenantId);
    return sub?.status === 'active' || sub?.status === 'trialing';
}

// ============================================
// EVENT LOG: For audit and debugging
// In production, this should be a database table
// ============================================
export interface StripeEventLog {
    eventId: string;
    eventType: string;
    stripeCustomerId: string;
    tenantId: string;
    timestamp: Date;
    processed: boolean;
    error?: string;
}

export const eventLogs: StripeEventLog[] = [];

// Idempotency: Track processed event IDs
export const processedEvents = new Set<string>();

// ============================================
// DOWNLOAD AUDIT LOG
// ============================================
export interface DownloadLog {
    timestamp: Date;
    tenantId: string;
    userId: string;
    userEmail: string;
    platform: string;
    filename: string;
    ip: string;
    userAgent: string;
    success: boolean;
    error?: string;
}

export const downloadLogs: DownloadLog[] = [];
