// ============================================
// TENANT ACCESS: Entitlement model
// Single source of truth for tenant access rights
// ============================================

export type AccessStatus = 'TRIAL' | 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED';
export type AccessSource = 'MANUAL' | 'STRIPE';

export interface TenantAccess {
    id: string;
    tenantId: string;

    status: AccessStatus;
    source: AccessSource;

    seatLimit: number;
    seatsUsed: number;

    trialEndsAt: Date | null;      // Only if status=TRIAL
    activeUntil: Date | null;      // Stripe current_period_end or manual paid-until

    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;

    createdAt: Date;
    updatedAt: Date;
}

export interface EntitlementResult {
    entitled: boolean;
    mode?: 'TRIAL' | 'ACTIVE';
    reason?: string;
    until?: Date;
    seats?: number;
}

// ============================================
// GATING FUNCTION: Use this everywhere
// Fail closed - if data is missing, deny access
// ============================================
export function computeEntitlement(access: TenantAccess | null): EntitlementResult {
    if (!access) {
        return { entitled: false, reason: 'NO_ACCESS' };
    }

    const now = new Date();

    // TRIAL status
    if (access.status === 'TRIAL') {
        if (access.trialEndsAt && access.trialEndsAt > now) {
            return {
                entitled: true,
                mode: 'TRIAL',
                until: access.trialEndsAt,
                seats: access.seatLimit,
            };
        }
        return { entitled: false, reason: 'TRIAL_EXPIRED' };
    }

    // ACTIVE status (paid subscription)
    if (access.status === 'ACTIVE') {
        if (access.activeUntil && access.activeUntil > now) {
            return {
                entitled: true,
                mode: 'ACTIVE',
                until: access.activeUntil,
                seats: access.seatLimit,
            };
        }
        // ACTIVE without activeUntil should not happen -> fail closed
        return { entitled: false, reason: 'ACTIVE_BUT_EXPIRED' };
    }

    // Other statuses
    if (access.status === 'PAST_DUE') {
        return { entitled: false, reason: 'PAST_DUE' };
    }

    if (access.status === 'CANCELED') {
        return { entitled: false, reason: 'CANCELED' };
    }

    return { entitled: false, reason: 'INACTIVE' };
}

// ============================================
// STORAGE: In-memory for MVP, replace with Vercel KV
// ============================================
const tenantAccessStore = new Map<string, TenantAccess>();

export function getTenantAccess(tenantId: string): TenantAccess | null {
    const access = tenantAccessStore.get(tenantId);
    if (!access) return null;

    // Deserialize dates if stored as strings
    return {
        ...access,
        trialEndsAt: access.trialEndsAt ? new Date(access.trialEndsAt) : null,
        activeUntil: access.activeUntil ? new Date(access.activeUntil) : null,
        createdAt: new Date(access.createdAt),
        updatedAt: new Date(access.updatedAt),
    };
}

export function setTenantAccess(access: TenantAccess): void {
    access.updatedAt = new Date();
    tenantAccessStore.set(access.tenantId, access);
}

// ============================================
// HELPER: Grant trial to tenant
// ============================================
export function grantTrial(
    tenantId: string,
    days: number = 14,
    seatLimit: number = 1
): TenantAccess {
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const existing = getTenantAccess(tenantId);

    const access: TenantAccess = {
        id: existing?.id || crypto.randomUUID(),
        tenantId,
        status: 'TRIAL',
        source: 'MANUAL',
        seatLimit,
        seatsUsed: existing?.seatsUsed || 0,
        trialEndsAt,
        activeUntil: null,
        stripeCustomerId: existing?.stripeCustomerId || null,
        stripeSubscriptionId: existing?.stripeSubscriptionId || null,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    };

    setTenantAccess(access);
    console.log(`✅ Granted ${days}-day trial to tenant ${tenantId} until ${trialEndsAt.toISOString()}`);

    return access;
}

// ============================================
// HELPER: Activate subscription (from Stripe)
// ============================================
export function activateSubscription(
    tenantId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    activeUntil: Date,
    seatLimit: number
): TenantAccess {
    const now = new Date();
    const existing = getTenantAccess(tenantId);

    const access: TenantAccess = {
        id: existing?.id || crypto.randomUUID(),
        tenantId,
        status: 'ACTIVE',
        source: 'STRIPE',
        seatLimit,
        seatsUsed: existing?.seatsUsed || 0,
        trialEndsAt: null, // Clear trial when activated
        activeUntil,
        stripeCustomerId,
        stripeSubscriptionId,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    };

    setTenantAccess(access);
    console.log(`✅ Activated subscription for tenant ${tenantId} until ${activeUntil.toISOString()}`);

    return access;
}

// ============================================
// HELPER: Update subscription status
// ============================================
export function updateSubscriptionStatus(
    tenantId: string,
    status: AccessStatus,
    activeUntil?: Date,
    seatLimit?: number
): TenantAccess | null {
    const existing = getTenantAccess(tenantId);
    if (!existing) return null;

    existing.status = status;
    if (activeUntil !== undefined) existing.activeUntil = activeUntil;
    if (seatLimit !== undefined) existing.seatLimit = seatLimit;
    existing.updatedAt = new Date();

    setTenantAccess(existing);
    console.log(`🔄 Updated tenant ${tenantId} status to ${status}`);

    return existing;
}

// ============================================
// HELPER: Get access by Stripe customer ID
// ============================================
export function getTenantAccessByCustomer(customerId: string): TenantAccess | null {
    for (const access of tenantAccessStore.values()) {
        if (access.stripeCustomerId === customerId) {
            return access;
        }
    }
    return null;
}

// ============================================
// AUDIT LOG
// ============================================
export interface AccessChangeLog {
    timestamp: Date;
    tenantId: string;
    action: 'GRANT_TRIAL' | 'ACTIVATE' | 'UPDATE_STATUS' | 'CANCEL';
    oldStatus: AccessStatus | null;
    newStatus: AccessStatus;
    source: AccessSource;
    actorEmail?: string;
    metadata?: Record<string, unknown>;
}

export const accessChangeLogs: AccessChangeLog[] = [];

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
