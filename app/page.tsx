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
} from "./icons";

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
                <h2>{modalType === "demo" ? "Book en demo 📅" : "Bli med som tidlig bruker 🎉"}</h2>
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
                <div className="success-icon">✅</div>
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
            <li><a href="#kontakt">Kontakt</a></li>
          </ul>
          <div className="navbar-cta">
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
            <h1>
              Journalsystemet bygget for<br />
              <span className="gradient-text">injeksjonsbehandlinger</span>
            </h1>
            <p className="hero-subtitle">
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
                <span className="icon">💉</span>
                Injeksjonskart
              </div>
              <div className="hero-trust-item">
                <span className="icon">📦</span>
                Batchsporing
              </div>
              <div className="hero-trust-item">
                <span className="icon">🔒</span>
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

      {/* Features Section */}
      <section id="funksjoner" className="features section">
        <div className="container">
          <div className="features-header">
            <h2>Bygget for injeksjonsklinikker</h2>
            <p>Funksjoner du faktisk trenger — ikke generiske løsninger</p>
          </div>
          <div className="features-grid">
            <div className="feature-card warm-card">
              <div className="feature-icon"><SyringeIcon /></div>
              <h3>Injeksjonskartlegging</h3>
              <p>Marker nøyaktig hvor du setter injeksjoner på et visuelt kart. Dose, dybde, produkt og sone — alt dokumentert automatisk.</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon"><PackageIcon /></div>
              <h3>Produktsporing & Batch</h3>
              <p>Spor hvilke produkter og batchnumre som brukes på hver pasient. Viktig for tilbakekalling og komplikasjonsoppfølging.</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon"><SignatureIcon /></div>
              <h3>Digital signering</h3>
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
            <div className="feature-card warm-card">
              <div className="feature-icon"><ExportIcon /></div>
              <h3>GDPR-eksport</h3>
              <p>Generer fullstendig pasientdata-eksport med ett klikk. Perfekt for innsynsforespørsler (SAR).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="hvorfor-oss" className="why-us section">
        <div className="container">
          <div className="why-us-header">
            <h2>Hvorfor velge oss?</h2>
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
              <h2>Sikkerhet bygget <span className="gradient-text">fra bunnen</span></h2>
              <p>
                Vi har ikke lagt på sikkerhet i ettertid — det er fundamentet
                som alt annet er bygget på.
              </p>
              <ul className="security-list">
                <li>
                  <span className="check">✓</span>
                  <strong>Envelope encryption</strong> — Pasientdata krypteres med unike nøkler per felt
                </li>
                <li>
                  <span className="check">✓</span>
                  <strong>Audit-logg med hash-kjede</strong> — Umulig å slette eller endre logger uten at det oppdages
                </li>
                <li>
                  <span className="check">✓</span>
                  <strong>Tenant-isolasjon</strong> — Klinikker kan aldri se hverandres data
                </li>
                <li>
                  <span className="check">✓</span>
                  <strong>Rollebasert tilgang</strong> — Lege, admin, terapeut, resepsjon — alle med riktige rettigheter
                </li>
                <li>
                  <span className="check">✓</span>
                  <strong>GDPR-verktøy innebygd</strong> — SAR-eksport, anonymisering, behandlingsrestriksjon
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
            <h2>Klar for et bedre journalsystem? 💉</h2>
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
            <p>© 2025 Secure Clinic Journal. Laget med 💚 i Norge.</p>
            <div className="footer-bottom-links">
              <a href="mailto:hei@secureclinic.no">hei@secureclinic.no</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
