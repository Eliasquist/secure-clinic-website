"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  SyringeIcon,
  PackageIcon,
  SignatureIcon,
  InvoiceIcon,
  AlertIcon,
  ExportIcon,
  TargetIcon,
  ShieldIcon,
  HandshakeIcon,
  LockIcon,
  DocumentIcon,
  LinkIcon,
  CloudIcon,
  CheckIcon,
} from "./icons";
import ChatBot from "./ChatBot";

const heroImages = [
  { src: "/injection-treatment.png", alt: "Profesjonell injeksjonsbehandling" },
  { src: "/clinic-treatment.png", alt: "Estetisk klinikk behandlingsrom" },
  { src: "/hero-doctor.png", alt: "Helsepersonell som bruker Secure Clinic" },
  { src: "/happy-patient.png", alt: "Fornøyd pasient etter behandling" },
];

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"demo" | "trial">("demo");
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    clinic: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const openModal = (type: "demo" | "trial") => {
    setModalType(type);
    setShowModal(true);
    setSubmitted(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", email: "", phone: "", clinic: "", message: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>

            {!submitted ? (
              <>
                <h2>{modalType === "demo" ? "Book en demo" : "Bli med som tidlig bruker"}</h2>
                <p>
                  {modalType === "demo"
                    ? "Fyll ut skjemaet så tar vi kontakt for å avtale en uforpliktende demo."
                    : "Vi er på jakt etter klinikker som vil være med å forme produktet. Fyll ut skjemaet så tar vi kontakt!"}
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Navn *</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ditt navn"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">E-post *</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="din@epost.no"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Telefon</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+47 xxx xx xxx"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="clinic">Klinikknavn</label>
                    <input
                      type="text"
                      id="clinic"
                      value={formData.clinic}
                      onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                      placeholder="Navn på klinikken"
                    />
                  </div>

                  {modalType === "demo" && (
                    <div className="form-group">
                      <label htmlFor="message">Melding</label>
                      <textarea
                        id="message"
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Er det noe spesielt du lurer på?"
                      />
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-full">
                    {modalType === "demo" ? "Send forespørsel" : "Meld interesse"}
                  </button>
                </form>
              </>
            ) : (
              <div className="success-message">
                <div className="success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2>Takk for din interesse!</h2>
                <p>
                  Vi tar kontakt med deg så snart som mulig. Vi gleder oss til å høre fra deg!
                </p>
                <button className="btn btn-secondary" onClick={closeModal}>Lukk</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <a href="#" className="navbar-logo">
            <Image src="/logo.png" alt="Secure Clinic Journal" width={44} height={44} />
            <span>Secure Clinic</span>
          </a>
          <ul className="navbar-links">
            <li><a href="#funksjoner">Funksjoner</a></li>
            <li><a href="#sikkerhet">Sikkerhet</a></li>
            <li><a href="/demo">Se demo</a></li>
            <li><a href="/book/demo-klinikk">Prøv booking</a></li>
            <li><a href="/startpakke">Startpakke</a></li>
            <li><a href="#kontakt">Kontakt</a></li>
          </ul>
          <div className="navbar-cta">
            <a href="/login" className="btn btn-ghost">Logg inn</a>
            <button onClick={() => openModal("demo")} className="btn btn-secondary">Book en demo</button>
            <button onClick={() => openModal("trial")} className="btn btn-primary">Meld interesse</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="dot"></span>
              For estetiske klinikker
            </div>
            <h1 className="heading-1">
              Journalsystemet bygget for<br />
              <span className="gradient-text">injeksjonsbehandlinger</span>
            </h1>
            <p className="lead">
              Vi bygger et spesialisert journalsystem for klinikker som driver med
              injeksjonsbehandlinger — med innebygd injeksjonskartlegging,
              produktsporing, og automatisk fakturering. Alt GDPR-klart fra dag én.
            </p>
            <div className="hero-buttons">
              <button onClick={() => openModal("trial")} className="btn btn-primary">
                Bli tidlig bruker
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button onClick={() => openModal("demo")} className="btn btn-secondary">
                Få en demo
              </button>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-item">
                <span className="icon"><SyringeIcon /></span>
                Injeksjonskart
              </div>
              <div className="hero-trust-item">
                <span className="icon"><PackageIcon /></span>
                Batchsporing
              </div>
              <div className="hero-trust-item">
                <span className="icon"><LockIcon /></span>
                GDPR-klar
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-carousel">
              {heroImages.map((img, index) => (
                <div
                  key={img.src}
                  className={`hero-carousel-slide ${index === currentImage ? 'active' : ''}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={600}
                    height={600}
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
            <div className="hero-carousel-dots">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  className={`hero-carousel-dot ${index === currentImage ? 'active' : ''}`}
                  onClick={() => setCurrentImage(index)}
                  aria-label={`Gå til bilde ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <TrustBadgeRow />

      {/* Features Section */}
      <section id="funksjoner" className="features section">
        <div className="container">
          <div className="features-header">
            <h2 className="heading-2">Bygget for injeksjonsklinikker</h2>
            <p>Funksjoner du faktisk trenger — ikke generiske løsninger</p>
          </div>
          <div className="features-grid">
            <div className="feature-card warm-card">
              <div className="feature-icon"><SyringeIcon /></div>
              <h3 className="heading-3">Injeksjonskartlegging</h3>
              <p>Marker nøyaktig hvor du setter injeksjoner på et visuelt kart. Dose, dybde, produkt og sone — alt dokumentert automatisk.</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon"><PackageIcon /></div>
              <h3>Produktsporing & Batch</h3>
              <p>Spor hvilke produkter og batchnumre som brukes på hver pasient. Viktig for tilbakekalling og komplikasjonsoppfølging.</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon"><SignatureIcon /></div>
              <h3 className="heading-3">Digital signering</h3>
              <p>Lås og signer konsultasjoner med kryptografisk hash. Dokumentet kan ikke endres i ettertid uten at det vises.</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon"><InvoiceIcon /></div>
              <h3>Automatisk fakturautkast</h3>
              <p>Når en konsultasjon signeres, genereres et fakturautkast automatisk basert på behandlingen.</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon"><AlertIcon /></div>
              <h3>Komplikasjonslogg</h3>
              <p>Registrer og følg opp komplikasjoner med kobling til opprinnelig behandling og bilder.</p>
            </div>
            {/* Feature 6 */}
            <div className="feature-card warm-card group">
              <div className="feature-icon bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white">
                <ExportIcon />
              </div>
              <h3>GDPR-eksport</h3>
              <p>Generer fullstendig pasientdata-eksport (SAR) med ett klikk for innsynsrett.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Compliance Package Section */}
      <section className="section bg-warm">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 md:p-12 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldIcon />
              </div>

              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1">
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-6 text-teal-600">
                    <DocumentIcon />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    Inkludert Compliance-pakke
                  </h2>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    Vi vet at dokumentasjon er kjedelig. Derfor får du en <strong>ferdig utfylt pakke</strong> med maler skreddersydd for klinikken din:
                  </p>

                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center p-1">
                        <CheckIcon />
                      </div>
                      <span className="font-medium text-slate-700">Risikovurdering (ROS) mal</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center p-1">
                        <CheckIcon />
                      </div>
                      <span className="font-medium text-slate-700">Databehandleravtale (DPA)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center p-1">
                        <CheckIcon />
                      </div>
                      <span className="font-medium text-slate-700">Personvernerklæring</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center p-1">
                        <CheckIcon />
                      </div>
                      <span className="font-medium text-slate-700">Avvikshåndterings-skjema</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center p-1">
                        <CheckIcon />
                      </div>
                      <span className="font-medium text-slate-700">Kriseplan (Incident Response)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 max-w-sm w-full transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="border-b-2 border-slate-50 pb-4 mb-4">
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-2"></div>
                    <div className="h-8 bg-slate-200 rounded w-2/3"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-slate-100 rounded w-full"></div>
                    <div className="h-2 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-2 bg-slate-100 rounded w-4/6"></div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <div className="h-10 w-24 bg-teal-600 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Why Us Section */}
      <section id="hvorfor-oss" className="why-us section">
        <div className="container">
          <div className="why-us-header">
            <h2 className="heading-2">Hvorfor velge oss?</h2>
            <p>Vi bygger det vi selv savnet i markedet</p>
          </div>
          <div className="why-us-grid">
            <div className="why-us-card warm-card">
              <div className="why-us-icon"><TargetIcon /></div>
              <h3>Spesialisert</h3>
              <p>Ikke et generisk system tilpasset alt. Bygget fra bunnen for injeksjonsbehandlinger og estetiske klinikker.</p>
            </div>
            <div className="why-us-card warm-card">
              <div className="why-us-icon"><ShieldIcon /></div>
              <h3>Sikkerhet først</h3>
              <p>AES-256 kryptering, envelope encryption, og full audit-logg med hash-kjede som ikke kan manipuleres.</p>
            </div>
            <div className="why-us-card warm-card">
              <div className="why-us-icon"><HandshakeIcon /></div>
              <h3>Tett samarbeid</h3>
              <p>Som tidlig bruker får du direkte kontakt med utviklerne. Din feedback former produktet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="sikkerhet" className="security section">
        <div className="container">
          <div className="security-content">
            <div className="security-text">
              <h2 className="heading-2">Sikkerhet bygget <span className="gradient-text">fra bunnen</span></h2>
              <p>
                Vi har ikke lagt på sikkerhet i ettertid — det er fundamentet
                som alt annet er bygget på.
              </p>
              <ul className="security-list">
                <li>
                  <span className="check">✓</span>
                  <span><strong>Envelope encryption</strong> — unike nøkler per felt</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span><strong>Hash-kjede logg</strong> — kan ikke slettes eller endres</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span><strong>Tenant-isolasjon</strong> — klinikker ser aldri hverandres data</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span><strong>Rollebasert tilgang</strong> — lege, admin, terapeut, resepsjon</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span><strong>GDPR innebygd</strong> — SAR-eksport, anonymisering, restriksjon</span>
                </li>
              </ul>
            </div>
            <div className="security-badges">
              <div className="security-badge warm-card">
                <div className="security-badge-icon"><LockIcon /></div>
                <h4>AES-256-GCM</h4>
                <p>Autentisert kryptering</p>
              </div>
              <div className="security-badge warm-card">
                <div className="security-badge-icon"><DocumentIcon /></div>
                <h4>GDPR</h4>
                <p>Bygget inn fra start</p>
              </div>
              <div className="security-badge warm-card">
                <div className="security-badge-icon"><LinkIcon /></div>
                <h4>Hash-kjede</h4>
                <p>Manipulasjonssikker logg</p>
              </div>
              <div className="security-badge warm-card">
                <div className="security-badge-icon"><CloudIcon /></div>
                <h4>Azure</h4>
                <p>Enterprise sky</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="kontakt" className="cta section">
        <div className="container">
          <div className="cta-card">
            <h2>Klar for et bedre journalsystem?</h2>
            <p>
              Vi bygger dette for deg som driver med injeksjonsbehandlinger.
              Ta kontakt så viser vi deg hva vi holder på med.
            </p>
            <button onClick={() => openModal("demo")} className="btn">
              Ta kontakt
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-brand-logo">
                <Image src="/logo.png" alt="Secure Clinic Journal" width={36} height={36} />
                <span>Secure Clinic</span>
              </div>
              <p>
                Journalsystemet laget spesielt for estetiske klinikker og
                injeksjonsbehandlinger. Bygget med sikkerhet og GDPR i kjernen.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-links-column">
                <h4>Produkt</h4>
                <ul>
                  <li><a href="#funksjoner">Funksjoner</a></li>
                  <li><a href="#sikkerhet">Sikkerhet</a></li>
                  <li><a href="#hvorfor-oss">Hvorfor oss</a></li>
                </ul>
              </div>
              <div className="footer-links-column">
                <h4>Kontakt</h4>
                <ul>
                  <li><a href="mailto:hei@secureclinic.no">hei@secureclinic.no</a></li>
                  <li><button onClick={() => openModal("demo")} className="footer-link-btn">Book en demo</button></li>
                  <li><button onClick={() => openModal("trial")} className="footer-link-btn">Meld interesse</button></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Secure Clinic Journal. Laget i Norge.</p>
            <div className="footer-bottom-links">
              <a href="mailto:hei@secureclinic.no">hei@secureclinic.no</a>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <ChatBot />
    </>
  );
}
