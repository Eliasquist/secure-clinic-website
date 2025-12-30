'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
    SyringeIcon,
    PackageIcon,
    SignatureIcon,
    InvoiceIcon,
    ShieldIcon,
    LockIcon,
} from '../icons';

export default function DemoPage() {
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            id: 'booking',
            title: 'Online Booking',
            description: 'Pasienter booker selv timer online. Du får automatisk bekreftelse og påminnelser.',
            icon: '📅',
        },
        {
            id: 'journal',
            title: 'Journalføring',
            description: 'Strukturert journalføring med injeksjonskartlegging, produktbruk og automatisk signering.',
            icon: '📋',
        },
        {
            id: 'injection',
            title: 'Injeksjonskart',
            description: 'Marker nøyaktig hvor injeksjoner settes. Dose, dybde og produkt dokumenteres.',
            icon: '💉',
        },
        {
            id: 'invoice',
            title: 'Fakturaer',
            description: 'Automatisk fakturautkast genereres når konsultasjon signeres.',
            icon: '💰',
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
                            Se hvordan <span className="gradient-text">Secure Clinic</span> fungerer
                        </h1>
                        <p>
                            Utforsk vårt komplette system for estetiske klinikker.
                            Prøv booking-systemet selv, eller se hvordan desktop-appen
                            håndterer pasientjournal og injeksjonskartlegging.
                        </p>
                    </div>
                </div>
            </section>

            {/* Live Booking Demo */}
            <section className="demo-section">
                <div className="container">
                    <div className="demo-section-header">
                        <span className="section-badge">🎯 Prøv selv</span>
                        <h2>Live Booking-demo</h2>
                        <p>
                            Dette er et ekte booking-system som kjører i produksjon.
                            Prøv å booke en time hos vår demo-klinikk!
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
                            <div className="device-label">
                                <span>📍</span> Oslo Klinikk - Demo
                            </div>
                        </div>

                        <div className="demo-booking-info">
                            <h3>Slik fungerer booking</h3>
                            <div className="booking-steps">
                                <div className="booking-step-item">
                                    <div className="step-num">1</div>
                                    <div>
                                        <h4>Velg behandling</h4>
                                        <p>Pasienten ser tilgjengelige tjenester med priser og varighet</p>
                                    </div>
                                </div>
                                <div className="booking-step-item">
                                    <div className="step-num">2</div>
                                    <div>
                                        <h4>Velg tid</h4>
                                        <p>Kun ledige tider vises basert på behandlers kalender</p>
                                    </div>
                                </div>
                                <div className="booking-step-item">
                                    <div className="step-num">3</div>
                                    <div>
                                        <h4>Bekreft med e-post</h4>
                                        <p>Pasient mottar OTP-kode for verifisering</p>
                                    </div>
                                </div>
                                <div className="booking-step-item">
                                    <div className="step-num">4</div>
                                    <div>
                                        <h4>Ferdig!</h4>
                                        <p>Booking dukker opp i desktop-appen automatisk</p>
                                    </div>
                                </div>
                            </div>

                            <Link href="/book/oslo-clinic" className="btn btn-primary" target="_blank">
                                Åpne booking i ny fane
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M6 3h7v7M13 3L6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Desktop App Section */}
            <section className="demo-section demo-app-section">
                <div className="container">
                    <div className="demo-section-header">
                        <span className="section-badge">🖥️ Desktop App</span>
                        <h2>Journalsystemet</h2>
                        <p>
                            Den virkelige magien skjer i desktop-appen. Her håndterer du
                            pasientjournal, injeksjonskartlegging, produktsporing og faktura.
                        </p>
                    </div>

                    <div className="app-features-tabs">
                        <div className="features-tab-list">
                            {features.map((feature, index) => (
                                <button
                                    key={feature.id}
                                    className={`feature-tab ${activeFeature === index ? 'active' : ''}`}
                                    onClick={() => setActiveFeature(index)}
                                >
                                    <span className="tab-icon">{feature.icon}</span>
                                    <span className="tab-title">{feature.title}</span>
                                </button>
                            ))}
                        </div>

                        <div className="features-tab-content">
                            <div className="feature-display">
                                <div className="feature-text">
                                    <h3>{features[activeFeature].title}</h3>
                                    <p>{features[activeFeature].description}</p>

                                    {activeFeature === 0 && (
                                        <ul className="feature-list">
                                            <li>✓ Integrert med nettside-booking</li>
                                            <li>✓ Automatiske SMS/e-post påminnelser</li>
                                            <li>✓ Kalender-synkronisering</li>
                                            <li>✓ Overbookings-beskyttelse</li>
                                        </ul>
                                    )}
                                    {activeFeature === 1 && (
                                        <ul className="feature-list">
                                            <li>✓ Strukturerte konsultasjonsmaler</li>
                                            <li>✓ Automatisk signering med hash</li>
                                            <li>✓ Endringslogg for alle felt</li>
                                            <li>✓ GDPR-kompatibel eksport</li>
                                        </ul>
                                    )}
                                    {activeFeature === 2 && (
                                        <ul className="feature-list">
                                            <li>✓ Visuelt injeksjonskart</li>
                                            <li>✓ Dose, dybde og produkt per punkt</li>
                                            <li>✓ Batchnummer-sporing</li>
                                            <li>✓ Historikk fra tidligere behandlinger</li>
                                        </ul>
                                    )}
                                    {activeFeature === 3 && (
                                        <ul className="feature-list">
                                            <li>✓ Faktura genereres automatisk</li>
                                            <li>✓ Redigerbart før sending</li>
                                            <li>✓ MVA-håndtering</li>
                                            <li>✓ Eksport til regnskapssystem</li>
                                        </ul>
                                    )}
                                </div>

                                <div className="feature-preview">
                                    <div className="app-mockup">
                                        <div className="mockup-header">
                                            <div className="mockup-dots">
                                                <span></span><span></span><span></span>
                                            </div>
                                            <span className="mockup-title">Secure Clinic Desktop</span>
                                        </div>
                                        <div className="mockup-content">
                                            {activeFeature === 0 && (
                                                <div className="mockup-booking">
                                                    <div className="mockup-sidebar">
                                                        <div className="sidebar-item active">📅 Bookinger</div>
                                                        <div className="sidebar-item">👥 Pasienter</div>
                                                        <div className="sidebar-item">📋 Journal</div>
                                                        <div className="sidebar-item">💰 Faktura</div>
                                                    </div>
                                                    <div className="mockup-main">
                                                        <h4>Dagens bookinger</h4>
                                                        <div className="booking-list">
                                                            <div className="booking-item confirmed">
                                                                <span className="time">09:00</span>
                                                                <span className="patient">Anna Larsen</span>
                                                                <span className="service">Botox</span>
                                                            </div>
                                                            <div className="booking-item pending">
                                                                <span className="time">10:30</span>
                                                                <span className="patient">Erik Johansen</span>
                                                                <span className="service">Filler</span>
                                                            </div>
                                                            <div className="booking-item confirmed">
                                                                <span className="time">14:00</span>
                                                                <span className="patient">Kari Olsen</span>
                                                                <span className="service">Konsultasjon</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {activeFeature === 1 && (
                                                <div className="mockup-journal">
                                                    <div className="journal-header">
                                                        <span>Pasient: Anna Larsen</span>
                                                        <span className="status signed">✓ Signert</span>
                                                    </div>
                                                    <div className="journal-sections">
                                                        <div className="journal-section">
                                                            <h5>Anamnese</h5>
                                                            <p>Ønsker behandling av glabellalinjer...</p>
                                                        </div>
                                                        <div className="journal-section">
                                                            <h5>Behandling</h5>
                                                            <p>Botox 20 enheter, fordelt på 5 punkter</p>
                                                        </div>
                                                        <div className="journal-section">
                                                            <h5>Produkter</h5>
                                                            <div className="product-tag">Botox (Batch: A123456)</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {activeFeature === 2 && (
                                                <div className="mockup-injection">
                                                    <div className="face-outline">
                                                        <div className="injection-point" style={{ top: '30%', left: '35%' }}>•</div>
                                                        <div className="injection-point" style={{ top: '30%', left: '50%' }}>•</div>
                                                        <div className="injection-point" style={{ top: '30%', left: '65%' }}>•</div>
                                                        <div className="injection-point large" style={{ top: '45%', left: '25%' }}>•</div>
                                                        <div className="injection-point large" style={{ top: '45%', left: '75%' }}>•</div>
                                                        <div className="face-text">👤</div>
                                                    </div>
                                                    <div className="injection-details">
                                                        <div className="injection-stat">
                                                            <span>Punkter:</span> 5
                                                        </div>
                                                        <div className="injection-stat">
                                                            <span>Total dose:</span> 24 enh
                                                        </div>
                                                        <div className="injection-stat">
                                                            <span>Produkt:</span> Botox
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {activeFeature === 3 && (
                                                <div className="mockup-invoice">
                                                    <div className="invoice-header">
                                                        <span>Faktura #2024-0042</span>
                                                        <span className="draft-badge">Utkast</span>
                                                    </div>
                                                    <div className="invoice-lines">
                                                        <div className="invoice-line">
                                                            <span>Botox behandling</span>
                                                            <span>kr 4.500</span>
                                                        </div>
                                                        <div className="invoice-line">
                                                            <span>Konsultasjon</span>
                                                            <span>kr 800</span>
                                                        </div>
                                                        <div className="invoice-line total">
                                                            <span>Totalt</span>
                                                            <span>kr 5.300</span>
                                                        </div>
                                                    </div>
                                                    <div className="invoice-actions">
                                                        <button>Rediger</button>
                                                        <button className="primary">Send faktura</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Highlights */}
            <section className="demo-section demo-security">
                <div className="container">
                    <div className="demo-section-header">
                        <span className="section-badge">🔒 Sikkerhet</span>
                        <h2>Bygget med sikkerhet i kjernen</h2>
                        <p>Alt du ser her er beskyttet med enterprise-grade sikkerhet</p>
                    </div>

                    <div className="security-grid">
                        <div className="security-card">
                            <div className="sec-icon"><LockIcon /></div>
                            <h3>AES-256 Kryptering</h3>
                            <p>All sensitiv data krypteres med militærgrad kryptering</p>
                        </div>
                        <div className="security-card">
                            <div className="sec-icon"><ShieldIcon /></div>
                            <h3>GDPR fra dag én</h3>
                            <p>Innsynsrett, sletting og dataportabilitet innebygd</p>
                        </div>
                        <div className="security-card">
                            <div className="sec-icon"><SignatureIcon /></div>
                            <h3>Digital signering</h3>
                            <p>Kryptografisk hash sikrer at dokumenter ikke kan endres</p>
                        </div>
                        <div className="security-card">
                            <div className="sec-icon"><PackageIcon /></div>
                            <h3>Batchsporing</h3>
                            <p>Full sporbarhet for produkter og tilbakekalling</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="demo-cta">
                <div className="container">
                    <div className="cta-card demo-cta-card">
                        <h2>Klar til å prøve selv? 🚀</h2>
                        <p>
                            Book en personlig demo hvor vi viser deg hele systemet
                            tilpasset din klinikk.
                        </p>
                        <div className="cta-buttons">
                            <Link href="/#kontakt" className="btn btn-primary">
                                Book en demo
                            </Link>
                            <Link href="/" className="btn btn-secondary">
                                Tilbake til forsiden
                            </Link>
                        </div>
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
