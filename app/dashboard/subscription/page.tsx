"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface SubscriptionData {
  status: string;
  source: string;
  mode: string | null;
  entitled: boolean;
  reason?: string;
  plan: string;
  seats: number;
  seatsUsed: number;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  activeUntil: string | null;
}

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    fetch("/api/subscription/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.subscription) {
          setSubscription(data.subscription);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubscribe = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Kunne ikke starte betaling");
        setCheckoutLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutLoading(false);
    }
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!subscription?.currentPeriodEnd) return null;
    const end = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysRemaining = getDaysRemaining();
  const isTrial = subscription?.mode === 'TRIALING';
  const isActive = subscription?.entitled;

  return (
    <div className="subscription-page">
      <h1>Abonnement</h1>

      {success && (
        <div className="alert success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Takk for din bestilling! Abonnementet ditt er nå aktivt.</span>
        </div>
      )}

      {canceled && (
        <div className="alert warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>Betalingen ble avbrutt. Du kan prøve igjen når som helst.</span>
        </div>
      )}

      {loading ? (
        <div className="loading">Laster...</div>
      ) : subscription && isActive ? (
        <div className={`subscription-card ${isTrial ? 'trial' : 'active'}`}>
          <div className={`status-badge ${isTrial ? 'trial' : 'active'}`}>
            <span className="dot"></span>
            {isTrial ? 'Prøveperiode' : 'Aktivt'}
          </div>

          <h2>{isTrial ? 'Prøveperiode' : 'Secure Clinic Professional'}</h2>

          {isTrial && daysRemaining !== null && (
            <div className="trial-countdown">
              <div className="countdown-number">{daysRemaining}</div>
              <div className="countdown-label">dager igjen</div>
            </div>
          )}

          <div className="details">
            <div className="detail-row">
              <span className="label">Status</span>
              <span className="value">{isTrial ? 'Prøveperiode' : 'Aktivt abonnement'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Seter</span>
              <span className="value">{subscription.seats} bruker(e)</span>
            </div>
            <div className="detail-row">
              <span className="label">{isTrial ? 'Utløper' : 'Neste fakturering'}</span>
              <span className="value">
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString("nb-NO")
                  : '-'}
              </span>
            </div>
          </div>

          <div className="actions">
            {isTrial ? (
              <>
                <a href="mailto:hei@secureclinic.no" className="btn btn-secondary">
                  Kontakt oss
                </a>
                <a href="/dashboard/downloads" className="btn btn-primary">
                  Last ned appen
                </a>
              </>
            ) : (
              <>
                <button className="btn btn-secondary">Administrer abonnement</button>
                <a href="/dashboard/downloads" className="btn btn-primary">
                  Last ned appen
                </a>
              </>
            )}
          </div>

          {isTrial && (
            <div className="trial-upgrade">
              <p>Liker du Secure Clinic? Oppgrader til fullt abonnement for å beholde tilgangen.</p>
              <a href="mailto:hei@secureclinic.no?subject=Oppgradering fra prøveperiode" className="btn btn-primary btn-full">
                Kontakt oss for å aktivere
              </a>
            </div>
          )}
        </div>
      ) : subscription && !isActive ? (
        <div className="subscription-card expired">
          <div className="status-badge expired">
            <span className="dot"></span>
            {subscription.reason === 'TRIAL_EXPIRED' ? 'Prøveperiode utløpt' : 'Inaktivt'}
          </div>
          <h2>Tilgangen din har utløpt</h2>
          <p>
            {subscription.reason === 'TRIAL_EXPIRED'
              ? 'Prøveperioden din har utløpt. Kontakt oss for å aktivere et abonnement.'
              : 'Du har ikke lenger tilgang til Secure Clinic. Kontakt oss for å gjenopprette tilgangen.'}
          </p>
          <a href="mailto:hei@secureclinic.no?subject=Reaktivering av tilgang" className="btn btn-primary btn-full">
            Kontakt oss
          </a>
        </div>
      ) : (
        <div className="subscription-card inactive">
          <h2>Ingen aktivt abonnement</h2>
          <p>
            Kontakt oss for å få tilgang til Secure Clinic Journal
            desktop-applikasjonen og alle premium-funksjoner.
          </p>
          <div className="pricing">
            <div className="price">
              <span className="amount">Kontakt oss</span>
            </div>
            <ul className="features">
              <li>✓ Desktop-applikasjon for Windows og macOS</li>
              <li>✓ Inkluderer brukerseter</li>
              <li>✓ Automatiske oppdateringer</li>
              <li>✓ Prioritert support</li>
              <li>✓ GDPR-compliance inkludert</li>
            </ul>
          </div>
          <a href="mailto:hei@secureclinic.no?subject=Interesse for Secure Clinic" className="btn btn-primary btn-large">
            Ta kontakt
          </a>
        </div>
      )}

      <style jsx>{`
        .subscription-page {
          color: #002b49;
          max-width: 600px;
        }

        h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #002b49;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }

        .alert.success {
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #16a34a;
        }

        .alert.warning {
          background: rgba(234, 179, 8, 0.08);
          border: 1px solid rgba(234, 179, 8, 0.2);
          color: #ca8a04;
        }

        .loading {
          color: #64748b;
        }

        .subscription-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .subscription-card.active {
          border-color: rgba(34, 197, 94, 0.4);
        }

        .subscription-card.trial {
          border-color: rgba(19, 173, 196, 0.4);
        }

        .subscription-card.expired {
          border-color: rgba(239, 68, 68, 0.4);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .status-badge.active {
          background: rgba(34, 197, 94, 0.15);
          color: #16a34a;
        }

        .status-badge.trial {
          background: rgba(19, 173, 196, 0.15);
          color: #0e7490;
        }

        .status-badge.expired {
          background: rgba(239, 68, 68, 0.15);
          color: #dc2626;
        }

        .status-badge .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #002b49;
        }

        .trial-countdown {
          text-align: center;
          padding: 2rem;
          background: rgba(19, 173, 196, 0.08);
          border-radius: 16px;
          margin-bottom: 2rem;
        }

        .countdown-number {
          font-size: 3.5rem;
          font-weight: 700;
          color: #13adc4;
        }

        .countdown-label {
          color: #64748b;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .details {
          margin-bottom: 2rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .label {
          color: #64748b;
          font-weight: 500;
        }

        .value {
          font-weight: 600;
          color: #002b49;
        }

        .actions {
          display: flex;
          gap: 1rem;
        }

        .btn {
          padding: 0.875rem 1.75rem;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .btn-primary {
          background: #13adc4;
          color: white;
        }

        .btn-primary:hover {
          background: #0f8fa3;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(19, 173, 196, 0.3);
        }

        .btn-secondary {
          background: white;
          color: #64748b;
          border: 1.5px solid #e2e8f0;
        }

        .btn-secondary:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .btn-large, .btn-full {
          width: 100%;
          padding: 1.125rem;
          font-size: 1.1rem;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .trial-upgrade {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #f1f5f9;
        }

        .trial-upgrade p {
          color: #64748b;
          margin-bottom: 1.25rem;
          text-align: center;
          font-size: 1rem;
        }

        .subscription-card.inactive p,
        .subscription-card.expired p {
          color: #64748b;
          margin-bottom: 2rem;
          font-size: 1.05rem;
          line-height: 1.6;
        }

        .pricing {
          background: #f8fafc;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid #e2e8f0;
        }

        .price {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .amount {
          font-size: 1.75rem;
          font-weight: 700;
          color: #13adc4;
        }

        .features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .features li {
          padding: 0.75rem 0;
          color: #475569;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
