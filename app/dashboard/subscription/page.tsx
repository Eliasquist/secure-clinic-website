"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface SubscriptionData {
    status: string;
    plan: string;
    currentPeriodEnd: string;
    seats: number;
}

export default function SubscriptionPage() {
    const searchParams = useSearchParams();
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    useEffect(() => {
        // Fetch subscription status
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
            }
        } catch (error) {
            console.error("Checkout error:", error);
            setCheckoutLoading(false);
        }
    };

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
            ) : subscription ? (
                <div className="subscription-card active">
                    <div className="status-badge active">
                        <span className="dot"></span>
                        Aktivt
                    </div>
                    <h2>Secure Clinic Professional</h2>
                    <div className="details">
                        <div className="detail-row">
                            <span className="label">Status</span>
                            <span className="value">{subscription.status}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Seter</span>
                            <span className="value">{subscription.seats} bruker(e)</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Neste fakturering</span>
                            <span className="value">
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString("nb-NO")}
                            </span>
                        </div>
                    </div>
                    <div className="actions">
                        <button className="btn btn-secondary">Administrer abonnement</button>
                        <a href="/dashboard/downloads" className="btn btn-primary">
                            Last ned appen
                        </a>
                    </div>
                </div>
            ) : (
                <div className="subscription-card inactive">
                    <h2>Ingen aktivt abonnement</h2>
                    <p>
                        Aktiver et abonnement for å få tilgang til Secure Clinic Journal
                        desktop-applikasjonen og alle premium-funksjoner.
                    </p>
                    <div className="pricing">
                        <div className="price">
                            <span className="amount">599</span>
                            <span className="currency">NOK/mnd</span>
                        </div>
                        <ul className="features">
                            <li>✓ Desktop-applikasjon for Windows og macOS</li>
                            <li>✓ Inkluderer 1 brukersete</li>
                            <li>✓ Automatiske oppdateringer</li>
                            <li>✓ Prioritert support</li>
                            <li>✓ GDPR-compliance inkludert</li>
                        </ul>
                    </div>
                    <button
                        onClick={handleSubscribe}
                        disabled={checkoutLoading}
                        className="btn btn-primary btn-large"
                    >
                        {checkoutLoading ? "Laster..." : "Start abonnement"}
                    </button>
                </div>
            )}

            <style jsx>{`
        .subscription-page {
          color: white;
          max-width: 600px;
        }

        h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .alert.success {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        .alert.warning {
          background: rgba(234, 179, 8, 0.15);
          border: 1px solid rgba(234, 179, 8, 0.3);
          color: #eab308;
        }

        .loading {
          color: #94a3b8;
        }

        .subscription-card {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 2rem;
        }

        .subscription-card.active {
          border-color: rgba(59, 130, 246, 0.3);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .status-badge.active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .status-badge .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .details {
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .label {
          color: #94a3b8;
        }

        .value {
          font-weight: 500;
        }

        .actions {
          display: flex;
          gap: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          background: rgba(148, 163, 184, 0.1);
          color: white;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .btn-large {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .subscription-card.inactive p {
          color: #94a3b8;
          margin-bottom: 1.5rem;
        }

        .pricing {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .price {
          text-align: center;
          margin-bottom: 1rem;
        }

        .amount {
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .currency {
          color: #94a3b8;
          margin-left: 0.5rem;
        }

        .features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .features li {
          padding: 0.5rem 0;
          color: #cbd5e1;
        }
      `}</style>
        </div>
    );
}
