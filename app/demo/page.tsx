'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ANATOMY_ZONES } from './anatomy';
import { BookingsPageReplica } from './components/desktop-replica/bookings/BookingsPageReplica';
import { mockBookings } from './mock-booking-data';


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
    const [viewMode, setViewMode] = useState<'ALL' | 'MUSCLE' | 'VOLUME'>('ALL');
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);

    const opacityForZone = (id: string, type: string) => {
        if (viewMode === 'ALL') return hoveredZone === id ? 0.4 : 0.1;
        if (viewMode !== type) return 0.05;
        return hoveredZone === id ? 0.5 : 0.2;
    };

    const colorForZone = (type: string) => {
        return type === 'MUSCLE' ? '#ef4444' : '#3b82f6';
    };

    return (
        <div className="relative w-full">
            <div className="flex justify-center gap-2 mb-2 text-xs">
                <button
                    onClick={() => setViewMode('ALL')}
                    className={`px-2 py-1 rounded ${viewMode === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
                >Alle</button>
                <button
                    onClick={() => setViewMode('MUSCLE')}
                    className={`px-2 py-1 rounded ${viewMode === 'MUSCLE' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'}`}
                >Muskler (Botox)</button>
                <button
                    onClick={() => setViewMode('VOLUME')}
                    className={`px-2 py-1 rounded ${viewMode === 'VOLUME' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                >Volum (Filler)</button>
            </div>

            <div className="relative aspect-[3/4] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <svg viewBox="0 0 100 160" className="w-full h-full cursor-pointer">
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
                            fillOpacity={opacityForZone(zone.id, zone.type)}
                            stroke={colorForZone(zone.type)}
                            strokeWidth="0.2"
                            className="transition-all duration-200 hover:stroke-width-2"
                            onMouseEnter={() => setHoveredZone(zone.id)}
                            onMouseLeave={() => setHoveredZone(null)}
                            onClick={() => onZoneClick(zone.id)}
                        >
                            <title>{zone.name}</title>
                        </path>
                    ))}
                    {/* Demo Points */}
                    <circle cx="50" cy="60" r="2" fill="#ef4444" stroke="white" strokeWidth="0.5" />
                    <circle cx="42" cy="65" r="2" fill="#ef4444" stroke="white" strokeWidth="0.5" />
                    <circle cx="58" cy="65" r="2" fill="#ef4444" stroke="white" strokeWidth="0.5" />
                </svg>

                <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded text-[10px] text-gray-500 pointer-events-none shadow border">
                    {hoveredZone ? (
                        <span className="font-semibold text-gray-900">{ANATOMY_ZONES.find(z => z.id === hoveredZone)?.name}</span>
                    ) : 'Klikk på en sone'}
                </div>
            </div>
        </div>
    );
};

const JournalReplica = () => {
    const [selectedZone, setSelectedZone] = useState<string | null>(null);
    const [status, setStatus] = useState<'DRAFT' | 'SIGNING' | 'SIGNED'>('DRAFT');
    const [signedAt, setSignedAt] = useState<Date | null>(null);

    const handleSign = () => {
        setStatus('SIGNING');
        // Simulate server-side cryptographic operation
        setTimeout(() => {
            setStatus('SIGNED');
            setSignedAt(new Date());
        }, 1500);
    };

    return (
        <div className="da-journal-grid flex gap-6 h-[600px]">
            {/* Left: Map */}
            <div className="w-1/2 bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center relative border border-gray-200">
                <div className="w-full max-w-[300px]">
                    <FaceMapReplica activeZone={selectedZone} onZoneClick={setSelectedZone} />
                </div>
            </div>

            {/* Right: Details */}
            <div className="w-1/2 overflow-y-auto pr-2">
                {/* Status Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</span>
                        {status === 'SIGNED' ? (
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm w-fit bg-green-50 text-green-800 border border-green-200">
                                <span className="w-1.5 h-1.5 rounded-full mr-2 bg-green-500"></span>
                                Låst & Signert
                            </div>
                        ) : (
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm w-fit bg-orange-50 text-orange-700 border border-orange-200">
                                <span className="w-1.5 h-1.5 rounded-full mr-2 bg-orange-500"></span>
                                Utkast under arbeid
                            </div>
                        )}
                    </div>
                    {status === 'SIGNED' && signedAt && (
                        <div className="text-right">
                            <div className="text-[10px] text-gray-400 font-mono">SHA-256: a7f3...92b1</div>
                            <div className="text-xs text-gray-500">Signert {signedAt.toLocaleTimeString()}</div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Behandlingsbeskrivelse
                    </label>
                    <input
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white disabled:bg-gray-50 disabled:text-gray-600"
                        defaultValue="Botox i panne (Glabella)"
                        disabled={status !== 'DRAFT'}
                    />
                </div>

                <div className="space-y-6 mb-8">
                    <div>
                        <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            1. Anamnese & Vurdering
                        </h3>
                        <textarea
                            className="w-full text-sm p-3 border border-gray-300 rounded-lg shadow-sm min-h-[80px] bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-600"
                            defaultValue="Pasienten ønsker å behandle 'sinnarynken'. Ingen kontraindikasjoner. Godkjent av lege."
                            disabled={status !== 'DRAFT'}
                        />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18" />
                                <path d="M21 3l-3 3" />
                                <path d="M18 6l3 3" />
                                <path d="M3 21l3-3" />
                                <path d="M9 15l3-3" />
                                <path d="M6 18l3 3" />
                            </svg>
                            2. Behandlingsdetaljer
                        </h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Produkt</th>
                                        <th className="px-3 py-2 text-left">Dose</th>
                                        <th className="px-3 py-2 text-left text-gray-400">Batch / Lot</th>
                                        <th className="px-3 py-2 text-left text-gray-400">Utløp</th>
                                        <th className="px-3 py-2 text-left">Sone</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="bg-white">
                                        <td className="px-3 py-2 font-medium text-gray-900">Azzalure</td>
                                        <td className="px-3 py-2"><span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">0.5 ml</span></td>
                                        <td className="px-3 py-2 text-gray-500 font-mono text-xs">KX9283</td>
                                        <td className="px-3 py-2 text-gray-500 text-xs">12/25</td>
                                        <td className="px-3 py-2 text-gray-500 text-xs">Glabella</td>
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="px-3 py-2 font-medium text-gray-900">Azzalure</td>
                                        <td className="px-3 py-2"><span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">0.5 ml</span></td>
                                        <td className="px-3 py-2 text-gray-500 font-mono text-xs">KX9283</td>
                                        <td className="px-3 py-2 text-gray-500 text-xs">12/25</td>
                                        <td className="px-3 py-2 text-gray-500 text-xs">Frontalis</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    {status === 'DRAFT' && (
                        <>
                            <button
                                onClick={handleSign}
                                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg shadow-md flex justify-center items-center gap-2 transform transition-all hover:scale-[1.02]"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                Signer & Lås Journal
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-2">Signering låser journalen permanent med kryptografisk segl.</p>
                        </>
                    )}

                    {status === 'SIGNING' && (
                        <button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-lg shadow-inner flex justify-center items-center gap-2 cursor-wait">
                            <span className="animate-spin">↻</span> Signerer og krypterer...
                        </button>
                    )}

                    {status === 'SIGNED' && (
                        <div className="space-y-3">
                            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                                <div className="text-green-800 font-bold flex items-center justify-center gap-2 mb-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                    Signert og Låst
                                </div>
                                <div className="text-xs text-green-700">
                                    Endringer kan nå kun gjøres som tillegg (addendum).
                                </div>
                            </div>
                            <button className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex justify-center items-center gap-2">
                                + Legg til Korrigering / Tillegg
                            </button>
                        </div>
                    )}
                </div>
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
                        <div className="text-xs text-gray-400 mt-1">Koblet til pasientjournal</div>
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
                        <h1 className="heading-1">
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
                        <span className="section-badge bg-teal-100 text-teal-800">For pasienten</span>
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
                                        src="/book/demo-klinikk"
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
                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Pasient booker time</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Velger behandling og tidspunkt i din tilpassede online booking.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Automatisk bekreftelse</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Pasient får SMS. Avtalen synkroniseres til din kalender i sanntid.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Klar til behandling</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Journalen opprettes automatisk og du er klar til å ta imot pasienten.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <Link
                                    href="/integrasjon"
                                    className="group flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors p-3 -ml-3 rounded-lg hover:bg-gray-50"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors flex-shrink-0">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 mb-0.5">Teknisk Integrasjon</div>
                                        <div className="text-gray-500 font-normal">Se hvordan du legger det på din nettside →</div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Desktop App Replica Section */}
            <section className="demo-section demo-app-section" style={{ background: '#f9fafb' }}>
                <div className="container">
                    <div className="demo-section-header">
                        <span className="section-badge bg-blue-100 text-blue-800">For behandleren</span>
                        <h2>Secure Clinic Desktop</h2>
                        <p>
                            Slik ser arbeidsverktøyet ditt ut. Dette er en eksakt kopi av applikasjonen.
                        </p>
                    </div>

                    <div className="desktop-app-container border border-gray-200 rounded-xl overflow-hidden shadow-2xl bg-white" style={{ height: '700px' }}>
                        <BookingsPageReplica mockData={mockBookings} />
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
                        <p>© 2025 Secure Clinic Journal. Laget i Norge.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
