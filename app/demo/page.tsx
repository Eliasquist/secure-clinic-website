'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ANATOMY_ZONES } from './anatomy';

// --- Inline Icons ---
const SignatureIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3l5 5L8 21H3v-5L16 3z" />
        <path d="M21 21H3" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const SyringeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18" />
        <path d="M21 3L18 6" />
        <path d="M18 6L21 9" />
        <path d="M3 21L6 18" />
        <path d="M9 15L12 12" />
        <path d="M6 18L9 21" />
    </svg>
);

const InvoiceIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
);

// --- Replica Components ---

// FaceMap Replica
const FaceMapReplica = ({ activeZone, onZoneClick }: { activeZone: string | null; onZoneClick: (zoneId: string) => void }) => {
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);

    const opacityForZone = (zoneId: string) => {
        if (activeZone === zoneId) return 0.6;
        return hoveredZone === zoneId ? 0.4 : 0.2;
    };

    const colorForZone = (type: string) => {
        return type === 'MUSCLE' ? '#ef4444' : '#3b82f6';
    };

    return (
        <div className="relative w-full max-w-[300px] mx-auto">
            <svg
                viewBox="0 0 100 160"
                className="da-facemap-svg"
            >
                {/* Base Face */}
                <path
                    d="M50 10 C 20 10 5 40 5 70 C 5 120 30 150 50 150 C 70 150 95 120 95 70 C 95 40 80 10 50 10 Z"
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth="0.5"
                />

                {/* Anatomy Zones */}
                {ANATOMY_ZONES.map(zone => (
                    <path
                        key={zone.id}
                        d={zone.path}
                        fill={colorForZone(zone.type)}
                        fillOpacity={opacityForZone(zone.id)}
                        stroke={colorForZone(zone.type)}
                        strokeWidth="0.2"
                        className="da-facemap-zone"
                        onMouseEnter={() => setHoveredZone(zone.id)}
                        onMouseLeave={() => setHoveredZone(null)}
                        onClick={() => onZoneClick(zone.id)}
                    >
                        <title>{zone.name}</title>
                    </path>
                ))}

                {/* Default Points (Demo) */}
                <circle cx="50" cy="60" r="2" fill="#ef4444" className="da-facemap-point" />
                <circle cx="42" cy="65" r="2" fill="#ef4444" className="da-facemap-point" />
                <circle cx="58" cy="65" r="2" fill="#ef4444" className="da-facemap-point" />
            </svg>
            <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded text-[10px] text-gray-500 shadow border border-gray-200 pointer-events-none">
                {hoveredZone ? ANATOMY_ZONES.find(z => z.id === hoveredZone)?.name : 'Klikk på en sone'}
            </div>
        </div>
    );
};

// Journal Replica
const JournalReplica = () => {
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    return (
        <div className="da-journal-grid">
            {/* Left: Map */}
            <div className="da-journal-left">
                <div className="flex gap-2 mb-4 text-xs w-full justify-center">
                    <span className="px-2 py-1 rounded bg-gray-800 text-white">Alle</span>
                    <span className="px-2 py-1 rounded bg-red-100 text-red-800">Muskler</span>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">Volum</span>
                </div>
                <FaceMapReplica activeZone={selectedZone} onZoneClick={setSelectedZone} />
            </div>

            {/* Right: Details */}
            <div className="da-journal-right">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200">
                            Utkast under arbeid
                        </span>
                    </div>
                </div>

                <div className="da-input-group">
                    <label className="da-section-title block">1. Anamnese & Vurdering</label>
                    <textarea
                        className="da-textarea"
                        defaultValue="Pasienten ønsker å behandle 'sinnarynken' (glabella). Ingen kontraindikasjoner."
                    />
                </div>

                <div className="da-input-group">
                    <label className="da-section-title block">2. Behandling</label>
                    <table className="da-table">
                        <thead>
                            <tr>
                                <th>Produkt</th>
                                <th>Dose</th>
                                <th>Sone</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Botox</td>
                                <td>20 Units</td>
                                <td>Glabella</td>
                            </tr>
                            <tr>
                                <td>Botox</td>
                                <td>10 Units</td>
                                <td>Frontalis</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <button className="da-sign-btn">
                    <SignatureIcon /> Signer & Lås Journal
                </button>
            </div>
        </div>
    );
};

// Booking Replica
const BookingReplica = () => {
    return (
        <div className="da-booking-list">
            <div className="da-booking-item">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        AL
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">Anna Larsen</div>
                        <div className="text-sm text-gray-500">Botox (3 områder) • 45 min</div>
                        <div className="text-xs text-gray-400 mt-1">Koblet til pasientjournal ✓</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-medium text-gray-900">09:00</div>
                    <span className="da-booking-status da-status-confirmed">Bekreftet</span>
                </div>
            </div>

            <div className="da-booking-item">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                        EJ
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">Erik Johansen</div>
                        <div className="text-sm text-gray-500">Filler (Lepper 1ml) • 45 min</div>
                        <div className="text-xs text-gray-400 mt-1">Ny pasient</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-medium text-gray-900">10:30</div>
                    <span className="da-booking-status da-status-pending">Ventende</span>
                </div>
            </div>

            <div className="da-booking-item">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                        KO
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">Kari Olsen</div>
                        <div className="text-sm text-gray-500">Konsultasjon • 30 min</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-medium text-gray-900">14:00</div>
                    <span className="da-booking-status da-status-confirmed">Bekreftet</span>
                </div>
            </div>
        </div>
    );
};

// Invoice Replica
const InvoiceReplica = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-2xl font-bold text-gray-900">Faktura #2024-0042</h3>
                <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">UTKAST</span>
            </div>
            <div className="text-right">
                <div className="text-sm text-gray-500">Dato</div>
                <div className="font-medium">30.12.2024</div>
            </div>
        </div>

        <table className="da-table mb-8">
            <thead>
                <tr>
                    <th>Beskrivelse</th>
                    <th className="text-right">Beløp</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Botox (3 områder)</td>
                    <td className="text-right">4 500 kr</td>
                </tr>
                <tr>
                    <td>Konsultasjon</td>
                    <td className="text-right">800 kr</td>
                </tr>
                <tr className="border-t-2 border-gray-200 font-bold">
                    <td className="pt-4">Totalt å betale</td>
                    <td className="text-right pt-4">5 300 kr</td>
                </tr>
            </tbody>
        </table>

        <div className="flex justify-end gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                Rediger
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                Send til pasient
            </button>
        </div>
    </div>
);


export default function DemoPage() {
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            id: 'booking',
            title: 'Bookinger',
            description: 'Full oversikt over timeboken din. Synkronisert i sanntid.',
            icon: <CalendarIcon />,
            component: <BookingReplica />
        },
        {
            id: 'journal',
            title: 'Journal & Injeksjonskart',
            description: 'Dokumenter behandlinger visuelt. Klikk rett i ansiktet for å logge injeksjoner.',
            icon: <SyringeIcon />,
            component: <JournalReplica />
        },
        {
            id: 'invoice',
            title: 'Faktura',
            description: 'Lag fakturaer automatisk basert på journalføringen.',
            icon: <InvoiceIcon />,
            component: <InvoiceReplica />
        },
    ];

    return (
        <div className="demo-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <Link href="/" className="navbar-logo">
                        <Image src="/logo.png" alt="Secure Clinic" width={44} height={44} />
                        <span>Secure Clinic</span>
                    </Link>
                    <ul className="navbar-links">
                        <li><Link href="/#funksjoner">Funksjoner</Link></li>
                        <li><Link href="/startpakke">Startpakke</Link></li>
                        <li><Link href="/#sikkerhet">Sikkerhet</Link></li>
                        <li><Link href="/#kontakt">Kontakt</Link></li>
                    </ul>
                    <div className="navbar-cta">
                        <Link href="/" className="btn btn-secondary">Til forsiden</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="demo-hero">
                <div className="container">
                    <div className="demo-hero-content">
                        <div className="demo-badge">
                            <span className="dot"></span>
                            Live Demo
                        </div>
                        <h1>
                            Opplev <span className="gradient-text">Secure Clinic</span>
                        </h1>
                        <p>
                            Utforsk hvordan desktop-appen og booking-systemet jobber sammen
                            for en sømløs klinikkhverdag.
                        </p>
                    </div>
                </div>
            </section>

            {/* Live Booking Demo */}
            <section className="demo-section">
                <div className="container">
                    <div className="demo-section-header">
                        <span className="section-badge">🎯 For pasienten</span>
                        <h2>Online Booking</h2>
                        <p>
                            Dette er hva pasienten ser. Prøv å booke en time!
                        </p>
                    </div>

                    <div className="demo-booking-preview">
                        <div className="demo-device laptop">
                            <div className="device-frame">
                                <div className="device-screen">
                                    <iframe
                                        src="/book/oslo-clinic"
                                        title="Booking Demo"
                                        className="demo-iframe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="demo-booking-info">
                            <h3>Slik fungerer det</h3>
                            <div className="process-steps space-y-6 mt-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Pasient booker time</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Velger behandling og tidspunkt i din tilpassede online booking.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Automatisk bekreftelse</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Pasient får SMS. Avtalen synkroniseres til din kalender i sanntid.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Klar til behandling</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Journalen opprettes automatisk og du er klar til å ta imot pasienten.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <Link href="/integrasjon" className="group flex items-center gap-3 text-xs font-medium text-gray-500 hover:text-brand-700 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-50">
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                    </div>
                                    <div>
                                        <span className="block text-gray-900">Teknisk Integrasjon</span>
                                        <span className="text-gray-400 font-normal">Se hvordan du legger det på din nettside &rarr;</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Desktop App Replica Section */}
            <section className="demo-section demo-app-section" style={{ background: '#fff' }}>
                <div className="container">
                    <div className="demo-section-header">
                        <span className="section-badge">🖥️ For behandleren</span>
                        <h2>Secure Clinic Desktop</h2>
                        <p>
                            Slik ser arbeidsverktøyet ditt ut. Dette er en eksakt kopi av applikasjonen.
                        </p>
                    </div>

                    <div className="desktop-app-replica shadow-2xl border border-gray-200">
                        {/* Sidebar */}
                        <div className="da-sidebar">
                            <div className="mb-6 px-2 font-bold text-gray-900 flex items-center gap-2">
                                <Image src="/logo.png" width={24} height={24} alt="Logo" />
                                Secure Clinic
                            </div>

                            {features.map((feature, index) => (
                                <div
                                    key={feature.id}
                                    className={`da-sidebar-item ${activeFeature === index ? 'active' : ''}`}
                                    onClick={() => setActiveFeature(index)}
                                >
                                    <span>{feature.icon}</span>
                                    {feature.title}
                                </div>
                            ))}

                            <div className="mt-auto pt-4 border-t border-gray-100">
                                <div className="da-sidebar-item text-red-600 hover:bg-red-50">
                                    <span>🚪</span> Logg ut
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="da-main">
                            {/* Header */}
                            <div className="da-header">
                                <h2>{features[activeFeature].title}</h2>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                        DL
                                    </div>
                                </div>
                            </div>

                            {/* Content View */}
                            <div className="da-content bg-gray-50">
                                {features[activeFeature].component}
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/#kontakt" className="btn btn-primary">
                            Bestill Demo for å se mer
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-bottom">
                        <p>© 2025 Secure Clinic Journal. Laget med 💚 i Norge.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
