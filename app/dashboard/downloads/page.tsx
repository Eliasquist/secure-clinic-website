"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function DownloadsPage() {
  const { data: session } = useSession();
  const [copiedChecksum, setCopiedChecksum] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState(false);

  // @ts-ignore
  const subscription = session?.subscription || { entitled: false };
  const hasAccess = subscription.entitled;

  // Mock release data (would come from API)
  const latestVersion = "1.2.0";
  const releaseDate = "2026-01-05";
  const checksums = {
    windows: "a7f3c2b1d4e5f6a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    macos: "b8g4d3c2e5f6g7h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3"
  };

  const copyChecksum = (platform: string) => {
    const checksum = checksums[platform as keyof typeof checksums];
    navigator.clipboard.writeText(checksum);
    setCopiedChecksum(platform);
    setTimeout(() => setCopiedChecksum(null), 2000);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Nedlastinger
        </h1>
        <p className="text-lg text-gray-600">
          Last ned Secure Clinic Journal for Windows eller macOS
        </p>
      </div>

      {/* Access Gate */}
      {!hasAccess ? (
        <div className="max-w-3xl">
          {/* Locked State with Preview */}
          <div className="relative">
            {/* Blur overlay */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
              <div className="text-center max-w-md p-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Aktivt abonnement kreves
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  For å laste ned Secure Clinic Journal må du ha et aktivt abonnement eller prøveperiode.
                </p>
                <a
                  href="/dashboard/subscription"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Se abonnement
                </a>
              </div>
            </div>

            {/* Preview (blurred) */}
            <div className="opacity-40 pointer-events-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Windows Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Windows</h3>
                      <p className="text-sm text-gray-500">MSI Installer</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Versjon</span>
                      <span className="font-medium">{latestVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Størrelse</span>
                      <span className="font-medium">127 MB</span>
                    </div>
                  </div>
                  <button disabled className="w-full px-4 py-2.5 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed">
                    Last ned
                  </button>
                </div>

                {/* macOS Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">macOS</h3>
                      <p className="text-sm text-gray-500">DMG Image</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Versjon</span>
                      <span className="font-medium">{latestVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Størrelse</span>
                      <span className="font-medium">142 MB</span>
                    </div>
                  </div>
                  <button disabled className="w-full px-4 py-2.5 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed">
                    Last ned
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Access */
        <div className="max-w-4xl">
          {/* Download Cards */}
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Siste versjon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Windows Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Secure Clinic for Windows</h3>
                    <p className="text-sm text-gray-500">MSI Installer</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Versjon</span>
                    <span className="font-medium">{latestVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Utgitt</span>
                    <span className="font-medium">{new Date(releaseDate).toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Størrelse</span>
                    <span className="font-medium">127 MB</span>
                  </div>
                </div>
                <a
                  href="#"
                  className="block w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  Last ned for Windows
                </a>
              </div>

              {/* macOS Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Secure Clinic for macOS</h3>
                    <p className="text-sm text-gray-500">DMG Image</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Versjon</span>
                    <span className="font-medium">{latestVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Utgitt</span>
                    <span className="font-medium">{new Date(releaseDate).toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Størrelse</span>
                    <span className="font-medium">142 MB</span>
                  </div>
                </div>
                <a
                  href="#"
                  className="block w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-center"
                >
                  Last ned for macOS
                </a>
              </div>
            </div>
          </section>

          {/* Release Notes */}
          <section className="mb-12">
            <button
              onClick={() => setExpandedNotes(!expandedNotes)}
              className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-left flex items-center justify-between group"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Hva er nytt i versjon {latestVersion}</h2>
                <p className="text-sm text-gray-500">Utgitt {new Date(releaseDate).toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`text-gray-400 group-hover:text-gray-600 transition-transform ${expandedNotes ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expandedNotes && (
              <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">✨ Nye funksjoner</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Forbedret injeksjonskart med nye anatomiske soner</li>
                      <li>• Støtte for batch-sporing av produkter</li>
                      <li>• Automatisk fakturautkast etter signering</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">🔧 Endringer</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Bedre ytelse ved lasting av pasientlister</li>
                      <li>• Oppdatert design på hovedskjermen</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">🐛 Bugfixes</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Fikset problem med PDF-eksport på macOS</li>
                      <li>• Rettet dato-formatering i rapporter</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Security / Checksums */}
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Sikkerhet
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">SHA-256 Checksums</h3>
              <p className="text-sm text-gray-600 mb-4">
                Verifiser integriteten til nedlastet fil ved å sammenligne checksum:
              </p>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Windows MSI</span>
                    <button
                      onClick={() => copyChecksum('windows')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {copiedChecksum === 'windows' ? '✓ Kopiert!' : 'Kopier'}
                    </button>
                  </div>
                  <code className="text-xs text-gray-600 break-all font-mono">{checksums.windows}</code>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">macOS DMG</span>
                    <button
                      onClick={() => copyChecksum('macos')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {copiedChecksum === 'macos' ? '✓ Kopiert!' : 'Kopier'}
                    </button>
                  </div>
                  <code className="text-xs text-gray-600 break-all font-mono">{checksums.macos}</code>
                </div>
              </div>
            </div>
          </section>

          {/* System Requirements */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Systemkrav og installasjon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Windows</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Windows 10 eller nyere (64-bit)</li>
                  <li>• 4 GB RAM (8 GB anbefalt)</li>
                  <li>• 500 MB ledig diskplass</li>
                  <li>• Administrator-rettigheter for installasjon</li>
                  <li>• Internett-tilkobling for aktivering</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">macOS</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• macOS 12 (Monterey) eller nyere</li>
                  <li>• Apple Silicon eller Intel-prosessor</li>
                  <li>• 4 GB RAM (8 GB anbefalt)</li>
                  <li>• 500 MB ledig diskplass</li>
                  <li>• Internett-tilkobling for aktivering</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
