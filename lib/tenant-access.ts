import { kv } from '@vercel/kv';

// ============================================
// TENANT ACCESS: Entitlement model
// Single source of truth for tenant access rights
// ============================================

export type AccessStatus = 'TRIALING' | 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED';
export type AccessSource = 'MANUAL' | 'STRIPE';

export interface TenantAccess {
    id: string;
    tenantId: string;

    status: AccessStatus;
    source: AccessSource;

    seatLimit: number;
    seatsUsed: number;

    trialEndsAt: Date | null;      // Only if status=TRIALING
    activeUntil: Date | null;      // Stripe current_period_end or manual paid-until

    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;

    createdAt: Date;
    updatedAt: Date;
}

export interface EntitlementResult {
    entitled: boolean;
    mode?: 'TRIALING' | 'ACTIVE';
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

    // TRIALING status
    if (access.status === 'TRIALING') {
        if (access.trialEndsAt && new Date(access.trialEndsAt) > now) {
            return {
                entitled: true,
                mode: 'TRIALING',
                until: new Date(access.trialEndsAt),
                seats: access.seatLimit,
            };
        }
        return { entitled: false, reason: 'TRIAL_EXPIRED' };
    }

    // ACTIVE status (paid subscription)
    if (access.status === 'ACTIVE') {
        if (access.activeUntil && new Date(access.activeUntil) > now) {
            return {
                entitled: true,
                mode: 'ACTIVE',
                until: new Date(access.activeUntil),
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
// STORAGE: Vercel KV (Redis) + In-memory fallback
// Key format: tenant:access:<tenantId>
// ============================================
const memoryStore = new Map<string, TenantAccess>();

function getKey(tenantId: string) {
    return `tenant:access:${tenantId}`;
}

// Helper to handle Date serialization/deserialization
function deserialize(data: any): TenantAccess | null {
    if (!data) return null;
    return {
        ...data,
        trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
        activeUntil: data.activeUntil ? new Date(data.activeUntil) : null,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
    };
}

export async function getTenantAccess(tenantId: string): Promise<TenantAccess | null> {
    try {
        // Try KV first
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            const data = await kv.get<TenantAccess>(getKey(tenantId));
            if (data) return deserialize(data);
        }
    } catch (error) {
        console.warn('KV get failed, falling back to memory', error);
    }

    // Fallback to memory
    const access = memoryStore.get(tenantId);
    return access ? deserialize(access) : null;
}

export async function setTenantAccess(access: TenantAccess): Promise<void> {
    access.updatedAt = new Date();

    // Update memory
    memoryStore.set(access.tenantId, access);

    // Update KV
    try {
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            await kv.set(getKey(access.tenantId), access);
        }
    } catch (error) {
        console.warn('KV set failed', error);
    }
}

// ============================================
// HELPER: Grant trial to tenant
// ============================================
export async function grantTrial(
    tenantId: string,
    days: number = 14,
    seatLimit: number = 1
): Promise<TenantAccess> {
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const existing = await getTenantAccess(tenantId);

    const access: TenantAccess = {
        id: existing?.id || crypto.randomUUID(),
        tenantId,
        status: 'TRIALING',
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

    await setTenantAccess(access);
    console.log(`✅ Granted ${days}-day trial to tenant ${tenantId} until ${trialEndsAt.toISOString()}`);

    return access;
}

// ============================================
// HELPER: Activate subscription (from Stripe)
// ============================================
export async function activateSubscription(
    tenantId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    activeUntil: Date,
    seatLimit: number
): Promise<TenantAccess> {
    const now = new Date();
    const existing = await getTenantAccess(tenantId);

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

    await setTenantAccess(access);
    console.log(`✅ Activated subscription for tenant ${tenantId} until ${activeUntil.toISOString()}`);

    return access;
}

// ============================================
// HELPER: Update subscription status
// ============================================
export async function updateSubscriptionStatus(
    tenantId: string,
    status: AccessStatus,
    activeUntil?: Date,
    seatLimit?: number
): Promise<TenantAccess | null> {
    const existing = await getTenantAccess(tenantId);
    if (!existing) return null;

    existing.status = status;
    if (activeUntil !== undefined) existing.activeUntil = activeUntil;
    if (seatLimit !== undefined) existing.seatLimit = seatLimit;
    existing.updatedAt = new Date();

    await setTenantAccess(existing);
    console.log(`🔄 Updated tenant ${tenantId} status to ${status}`);

    return existing;
}

// ============================================
// HELPER: Get access by Stripe customer ID
// Note: This is expensive with KV (scan), so we rely on memory/lookup for now.
// For production scale, use a secondary index/key in KV.
// ============================================
export async function getTenantAccessByCustomer(customerId: string): Promise<TenantAccess | null> {
    // Try memory first (fastest)
    for (const access of memoryStore.values()) {
        if (access.stripeCustomerId === customerId) return access;
    }

    // KV scan not implemented for MVP - assumes memory cache is warm or 
    // we would need a secondary index: `stripe:customer:${customerId} -> tenantId`
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
