"use client";

import { useSession } from "next-auth/react";
import OverviewCard from "./components/OverviewCard";
import ModuleCard from "./components/ModuleCard";

export default function DashboardPage() {
  const { data: session } = useSession();

  // @ts-ignore - session may have extended properties
  const subscription = session?.subscription || { status: 'INACTIVE', entitled: false };

  // Compute access status for overview card
  const getAccessData = () => {
    if (!subscription.entitled) {
      return {
        status: 'Ingen tilgang',
        statusType: 'inactive' as const,
        description: 'Aktiver abonnement for å få tilgang til alle funksjoner',
        ctaLabel: 'Se abonnement',
        ctaHref: '/dashboard/subscription'
      };
    }

    if (subscription.mode === 'TRIALING') {
      const daysRemaining = subscription.currentPeriodEnd
        ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : undefined;

      return {
        status: 'Prøveperiode aktiv',
        statusType: 'trial' as const,
        description: daysRemaining ? `${daysRemaining} dager igjen av prøveperioden` : 'Prøveperiode aktiv',
        ctaLabel: 'Administrer abonnement',
        ctaHref: '/dashboard/subscription',
        metadata: daysRemaining ? [
          { label: 'Dager igjen', value: daysRemaining.toString() }
        ] : undefined
      };
    }

    return {
      status: 'Aktiv',
      statusType: 'active' as const,
      description: 'Ditt abonnement er aktivt',
      ctaLabel: 'Administrer abonnement',
      ctaHref: '/dashboard/subscription'
    };
  };

  const accessData = getAccessData();

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Velkommen til din klinikkportal
        </h1>
        <p className="text-lg text-gray-600">
          Oversikt og hurtigtilgang til alt du trenger
        </p>
      </div>

      {/* Overview Section */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Oversikt
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Access Card */}
          <OverviewCard
            title="Tilgang"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            status={accessData.status}
            statusType={accessData.statusType}
            description={accessData.description}
            ctaLabel={accessData.ctaLabel}
            ctaHref={accessData.ctaHref}
            metadata={accessData.metadata}
          />

          {/* App Card */}
          <OverviewCard
            title="Desktop App"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            }
            status={subscription.entitled ? "Tilgjengelig" : "Krever tilgang"}
            statusType={subscription.entitled ? "active" : "inactive"}
            description="Last ned Secure Clinic Journal for Windows eller macOS"
            ctaLabel="Gå til nedlastinger"
            ctaHref="/dashboard/downloads"
            ctaDisabled={!subscription.entitled}
            metadata={subscription.entitled ? [
              { label: 'Plattform', value: 'Windows / macOS' }
            ] : undefined}
          />

          {/* GDPR Export Card */}
          <OverviewCard
            title="GDPR Eksport"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
            status="Tilgjengelig"
            statusType="info"
            description="Eksporter pasientdata i henhold til personvernforordningen"
            ctaLabel="Start eksport"
            ctaHref="/dashboard/exports"
          />
        </div>
      </section>

      {/* Modules Section */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Moduler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModuleCard
            title="Pasienter"
            description="Administrer pasientinformasjon, kontaktdetaljer og behandlingshistorikk"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            href="/dashboard/patients"
            status="coming-soon"
            gradient="linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)"
          />

          <ModuleCard
            title="Konsultasjoner"
            description="Journalfør behandlinger med injeksjonskart og bildedokumentasjon"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
            href="/dashboard/consultations"
            status="coming-soon"
            gradient="linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)"
          />

          <ModuleCard
            title="Fakturering"
            description="Automatisk fakturering basert på journalføring og behandlinger"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            }
            href="/dashboard/billing"
            status="coming-soon"
            gradient="linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
          />

          <ModuleCard
            title="Dataeksport"
            description="Last ned pasientdata og eksporter i tråd med GDPR-krav"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
            href="/dashboard/exports"
            status="active"
            gradient="linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)"
          />
        </div>
      </section>
    </div>
  );
}
