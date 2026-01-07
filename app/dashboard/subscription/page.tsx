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
  const [showContactModal, setShowContactModal] = useState(false);

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
  const isActive = subscription?.entitled && !isTrial;
  const isInactive = !subscription?.entitled;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Abonnement
        </h1>
        <p className="text-lg text-gray-600">
          Administrer ditt abonnement og tilgang
        </p>
      </div>

      {/* Success/Canceled Alerts */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Takk for din bestilling! Abonnementet ditt er nå aktivt.</span>
        </div>
      )}

      {canceled && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3 text-orange-800">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>Betalingen ble avbrutt. Du kan prøve igjen når som helst.</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* INACTIVE STATE */}
          {isInactive && (
            <div className="max-w-3xl">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Ingen aktivt abonnement
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      For å få tilgang til desktop-appen, oppdateringer og support må du aktivere et abonnement.
                      Ta kontakt med oss for å diskutere dine behov.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Hva får du med abonnement?</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Tilgang til desktop-appen (Windows \u0026 macOS)
                    </li>
                    <li className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Automatiske oppdateringer og nye funksjoner
                    </li>
                    <li className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Prioritert support
                    </li>
                    <li className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      GDPR-compliance pakke inkludert
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Kontakt oss
                  </button>
                  <a
                    href="/#funksjoner"
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Se hva som er inkludert
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TRIALING STATE */}
          {isTrial && (
            <div className="max-w-3xl">
              <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm mb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Prøveperiode aktiv
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Du har full tilgang mens prøveperioden varer. Kontakt oss for å forlenge eller aktivere abonnement.
                    </p>
                  </div>
                </div>

                {daysRemaining !== null && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-blue-600 font-medium mb-1">Dager igjen</div>
                        <div className="text-3xl font-bold text-blue-900">{daysRemaining}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-blue-600 font-medium mb-1">Utløper</div>
                        <div className="text-sm text-blue-900">
                          {new Date(subscription!.currentPeriodEnd!).toLocaleDateString('no-NO', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    {daysRemaining <= 7 && (
                      <div className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3">
                        ⚠️ Prøveperioden utløper snart. Kontakt oss for å sikre uavbrutt tilgang.
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Lisenser</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {subscription?.seatsUsed || 0} / {subscription?.seats || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Plan</div>
                    <div className="text-lg font-semibold text-gray-900">{subscription?.plan || 'Trial'}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Forleng / Aktiver abonnement
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE STATE */}
          {isActive && (
            <div className="max-w-3xl">
              <div className="bg-white border border-green-200 rounded-2xl p-8 shadow-sm mb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Abonnement aktivt
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Ditt abonnement er aktivt og du har full tilgang til alle funksjoner.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Plan</div>
                    <div className="text-lg font-semibold text-gray-900">{subscription?.plan || 'Standard'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Lisenser</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {subscription?.seatsUsed || 0} / {subscription?.seats || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Forny</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {subscription?.currentPeriodEnd
                        ? new Date(subscription.currentPeriodEnd).toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Administrer abonnement
                  </button>
                  <a
                    href="/dashboard/downloads"
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Last ned app
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="max-w-3xl mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ofte stilte spørsmål</h3>
            <div className="space-y-4">
              <details className="bg-white border border-gray-200 rounded-xl p-6 group">
                <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  <span>Hva er en behandlerlisens?</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform group-open:rotate-180 transition-transform">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                  En behandlerlisens gir én person (lege, sykepleier, terapeut) tilgang til å bruke desktop-appen.
                  Du kan ha flere brukere på samme klinikk, og betaler kun for de som journalfører.
                </p>
              </details>

              <details className="bg-white border border-gray-200 rounded-xl p-6 group">
                <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  <span>Hvordan fungerer prøveperioden?</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform group-open:rotate-180 transition-transform">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                  Prøveperioden gir deg full tilgang til alle funksjoner i en begrenset periode.
                  Du får beskjed før den utløper, og kan enkelt forlenge eller aktivere et abonnement.
                </p>
              </details>

              <details className="bg-white border border-gray-200 rounded-xl p-6 group">
                <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  <span>Kan sekretærer få tilgang?</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform group-open:rotate-180 transition-transform">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                  Ja! Sekretærer og resepsjonspersonell kan få begrenset tilgang (booking, fakturering)
                  uten å telle som en behandlerlisens. Kontakt oss for å sette opp roller.
                </p>
              </details>
            </div>
          </div>
        </>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Kontakt oss
            </h3>
            <p className="text-gray-600 mb-6">
              Send oss en e-post så tar vi kontakt for å diskutere dine behov.
            </p>
            <div className="space-y-4">
              <a
                href="mailto:hei@secureclinic.no?subject=Abonnement%20-%20Interesse&body=Hei,%0D%0A%0D%0AJeg%20vil%20gjerne%20vite%20mer%20om%20abonnement."
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Send e-post til hei@secureclinic.no
              </a>
              <button
                onClick={() => setShowContactModal(false)}
                className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
