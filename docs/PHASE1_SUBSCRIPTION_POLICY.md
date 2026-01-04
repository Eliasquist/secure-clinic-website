# Phase 1 Policy: Subscription + Protected Downloads (MVP)

## 1) Scope og prinsipper

* Phase 1 leverer: **Subscription-status** + **beskyttede nedlastinger**.
* **Seat management (invites/assignments)** er **ikke** inkludert i Phase 1.
* Endring av antall seter i Phase 1 skjer **ikke** via Customer Portal. Eventuelle justeringer håndteres via kontakt eller intern admin.
* Stripe brukes i **test mode** inntil bankkonto/KYC er på plass.

## 2) Stripe prismodell (valgt for Phase 1)

**Per-seat med minimum 1 (quantity-based)**:

* Ett Stripe Price (månedlig): `SEAT_MONTHLY`
* `quantity >= 1` (min 1 seat)
* Antall seter = `subscription.items.data[0].quantity` (source of truth)
* (Valgfritt senere) Årlig price kan legges til uten å endre policy.

**Konsekvens i produktet:**

* "Plan" = samme plan for alle i MVP (ingen tiers).
* "Seats" = total purchased seats (min 1).

## 3) Trial (på forespørsel)

* Trial gis **manuelt** per tenant (ikke via Stripe) i Phase 1.
* Trial implementeres som DB-status:
  * `status = TRIALING`
  * `trialEndsAt = now + N days` (typisk 14/30)
* Trial gir samme tilgang som aktiv subscription frem til utløp.

**Ingen trial key i Phase 1.** Trial er tenant-bundet og håndheves server-side.

## 4) Datamodell (minimum)

`TenantAccess` (tenant-bundet):

| Field | Type | Description |
|-------|------|-------------|
| `tenantId` | string | Tenant identifier |
| `stripeCustomerId` | string? | Nullable i trial |
| `stripeSubscriptionId` | string? | Nullable i trial |
| `status` | enum | `ACTIVE`, `TRIALING`, `PAST_DUE`, `CANCELED` |
| `seatLimit` | int | Purchased seats (min 1) |
| `currentPeriodStart` | Date? | Nullable for trial |
| `currentPeriodEnd` | Date? | Nullable for trial |
| `trialEndsAt` | Date? | Only set for trial |
| `source` | enum | `MANUAL`, `STRIPE` |

**Kilde til sannhet:**

* Stripe = source of truth for betalte subscriptions.
* DB = source of truth for trial.

## 5) Access rules (server-side)

Definer én funksjon: `computeEntitlement(access): EntitlementResult`.

Tillat tilgang når:

* `status == ACTIVE` og `activeUntil > now`
* eller `status == TRIALING` og `trialEndsAt > now`

Avvis tilgang når:

* `status == CANCELED`
* `status == PAST_DUE` (Phase 1: ingen grace)
* ingen access-record finnes

HTTP responses:

* Ikke innlogget → `401`
* Innlogget, men ikke tilgang → `403`

## 6) Downloads policy

* Downloads ligger under **hoveddomene**: `/dashboard/downloads`
* Faktiske filer ligger i **private** Azure Blob container: `app-releases`
* Nedlasting skjer via API:
  * `POST /api/downloads/:platform`
  * Verifiser auth + `computeEntitlement()`
  * Generer **SAS-signed URL** med TTL 2–5 minutter
  * Returner signed URL
* Logg:
  * `tenantId`, `userId`, `platform`, `filename`, timestamp, IP, user agent

## 7) Releases / manifest policy (Phase 1)

* `/api/releases/latest` returnerer:
  * `latestVersion`
  * lenker til assets via `/api/downloads/:platform`
  * checksums

**Merk:** Desktop auto-updater "license gating" kommer i Phase 3.
I Phase 1 er kun portal downloads subscription-gated.

## 8) Stripe webhook policy (test mode nå, live senere)

###4.  **Webhook Policy**:
    *   **Endpoint**: `POST /api/stripe/webhook`
    *   **Security**: Verify Stripe Signature (`stripe-signature` header).
    *   **Idempotency (Two-Phase)**:
        *   1. Set key `stripe:event:{id}` to "processing" (TTL 10m, NX=true).
        *   2. Process event.
        *   3. If success: Set key to "done" (TTL 30 days).
        *   4. If error/crash: Delete key (allow Stripe retry).
    *   **Handlers**:
        *   `checkout.session.completed` -> `activateSubscription`
        *   `customer.subscription.created` -> Sync mapping if exists
        *   `customer.subscription.updated` -> `updateSubscriptionStatus` (Explicit Mapping)
        *   `customer.subscription.deleted` -> `CANCELED`
        *   `invoice.paid` -> `ACTIVE`
        *   `invoice.payment_failed` -> `PAST_DUE`
    *   **Status Mapping**:
        *   `active` -> `ACTIVE`
        *   `trialing` -> `TRIALING`
        *   `past_due`/`unpaid` -> `PAST_DUE`
        *   `canceled` -> `CANCELED`
        *   Others -> `INACTIVE`

### Mapping til DB-status

* subscription created/updated:
  * Stripe `active` → `ACTIVE`
  * Stripe `trialing` → `TRIALING`
  * Stripe `past_due` / `unpaid` → `PAST_DUE`
  * Stripe `canceled` → `CANCELED`
* seats: `seatLimit = item.quantity` (min 1)
* period: `activeUntil` fra Stripe `current_period_end`

## 9) Customer Portal (Phase 1)

Aktiver portal for:

* betalingsmetode
* faktura/kvitteringer
* kansellering

Deaktiver i Phase 1:

* endring av quantity/seats

## 10) Testkriterier (Definition of Done)

### Automatiserte tester

1. Downloads auth:
   * Ikke innlogget → 401
   * Innlogget uten subscription → 403
   * Innlogget med `ACTIVE` → 200 + signed URL
   * Innlogget med `TRIALING` og `trialEndsAt > now` → 200
   * `TRIALING` men utløpt → 403

2. Webhook:
   * `customer.subscription.created` oppretter/oppdaterer access i store
   * `customer.subscription.updated` endrer status + seats
   * Idempotens: samme event to ganger gir én endring

### Manuelle tester (Stripe test mode)

* Checkout med testkort → subscription blir `ACTIVE` i UI
* `/dashboard/downloads` skjules/viser korrekt basert på status

## 11) Operasjonelle retningslinjer

* Kjør **test mode** i staging.
* Ikke aktiver live payments før bankkonto/KYC er ferdig.
* Pilotkunder onboardes via **manual trial** (tenant-bundet).

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| TenantAccess model | ✅ | `lib/tenant-access.ts` |
| computeEntitlement() | ✅ | Fail-closed gating |
| Grant trial endpoint | ✅ | `POST /api/admin/grant-trial` |
| Download API | ✅ | With whitelist + rate limiting |
| Webhook handler | ✅ | Idempotent + event logging |
| Subscription page | ✅ | Trial countdown display |
| Stripe test mode | ⏳ | Ready when env vars configured |
