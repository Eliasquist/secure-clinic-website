"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"demo" | "trial">("demo");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    clinic: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

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
    // In production, this would send to your backend
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
              Kommer snart
            </div>
            <h1>
              Et journalsystem som<br />
              <span className="gradient-text">endelig setter deg først</span>
            </h1>
            <p className="hero-subtitle">
              Vi bygger et journalsystem som er enkelt å bruke, trygt for pasientene —
              og som lar deg fokusere på det du gjør best: å hjelpe mennesker.
              Vil du være med å forme fremtidens klinikkverktøy?
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
                <span className="icon">🔒</span>
                Sikkerhet i fokus
              </div>
              <div className="hero-trust-item">
                <span className="icon">🇳🇴</span>
                Laget i Norge
              </div>
              <div className="hero-trust-item">
                <span className="icon">💬</span>
                Norsk support
              </div>
            </div>
          </div>
          <div className="hero-image">
            <Image
              src="/hero-doctor.png"
              alt="Helsepersonell som bruker Secure Clinic"
              width={600}
              height={600}
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funksjoner" className="features section">
        <div className="container">
          <div className="features-header">
            <h2>Det vi bygger for deg</h2>
            <p>Funksjoner designet for en enklere arbeidshverdag</p>
          </div>
          <div className="features-grid">
            <div className="feature-card warm-card">
              <div className="feature-icon">💝</div>
              <h3>Enkel i bruk</h3>
              <p>Intuitivt design som ikke krever opplæring i dagesvis. Du og teamet ditt kommer raskt i gang.</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon">🔒</div>
              <h3>Trygg pasientdata</h3>
              <p>Kryptering og sikkerhet er bygget inn fra starten. Vi tar personvern på alvor.</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon">📅</div>
              <h3>Smart timebestilling</h3>
              <p>Pasientene booker selv online, og du får full oversikt. Færre telefoner, mer tid til omsorg.</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon">📋</div>
              <h3>Alt på ett sted</h3>
              <p>Journal, faktura, timeavtaler og kommunikasjon — samlet i ett enkelt system.</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon">🇳🇴</div>
              <h3>Norske krav i fokus</h3>
              <p>Vi bygger med tanke på norsk regelverk og GDPR fra dag én.</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon">☁️</div>
              <h3>Alltid tilgjengelig</h3>
              <p>Jobb fra kontoret, hjemme eller på farten. Alt ligger trygt i skyen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section (replaces testimonials) */}
      <section id="hvorfor-oss" className="why-us section">
        <div className="container">
          <div className="why-us-header">
            <h2>Hvorfor velge oss?</h2>
            <p>Vi er et lite team med stor lidenskap for å lage gode verktøy</p>
          </div>
          <div className="why-us-grid">
            <div className="why-us-card warm-card">
              <div className="why-us-icon">🤝</div>
              <h3>Tett samarbeid</h3>
              <p>Som tidlig bruker får du direkte kontakt med utviklerne. Din feedback former produktet.</p>
            </div>
            <div className="why-us-card warm-card">
              <div className="why-us-icon">🚀</div>
              <h3>Aktiv utvikling</h3>
              <p>Vi jobber kontinuerlig med forbedringer og nye funksjoner basert på reelle behov.</p>
            </div>
            <div className="why-us-card warm-card">
              <div className="why-us-icon">💚</div>
              <h3>Personlig service</h3>
              <p>Ingen roboter eller ventelister. Du snakker med ekte mennesker som bryr seg.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="sikkerhet" className="security section">
        <div className="container">
          <div className="security-content">
            <div className="security-text">
              <h2>Sikkerhet vi <span className="gradient-text">tar på alvor</span></h2>
              <p>
                Pasientene dine stoler på deg med sine mest private opplysninger.
                Vi bygger systemet med sikkerhet som førsteprioritet.
              </p>
              <ul className="security-list">
                <li>
                  <span className="check">✓</span>
                  Kryptering av all sensitiv data
                </li>
                <li>
                  <span className="check">✓</span>
                  Sikker innlogging
                </li>
                <li>
                  <span className="check">✓</span>
                  Rollebasert tilgangskontroll
                </li>
                <li>
                  <span className="check">✓</span>
                  Bygget med GDPR i tankene
                </li>
                <li>
                  <span className="check">✓</span>
                  Full sporbarhet og logging
                </li>
              </ul>
            </div>
            <div className="security-badges">
              <div className="security-badge warm-card">
                <div className="security-badge-icon">🔐</div>
                <h4>Kryptering</h4>
                <p>AES-256</p>
              </div>
              <div className="security-badge warm-card">
                <div className="security-badge-icon">📜</div>
                <h4>GDPR</h4>
                <p>I fokus</p>
              </div>
              <div className="security-badge warm-card">
                <div className="security-badge-icon">☁️</div>
                <h4>Azure</h4>
                <p>Sikker sky</p>
              </div>
              <div className="security-badge warm-card">
                <div className="security-badge-icon">💚</div>
                <h4>Support</h4>
                <p>Vi er her for deg</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="kontakt" className="cta section">
        <div className="container">
          <div className="cta-card">
            <h2>Nysgjerrig? La oss snakke! ☕</h2>
            <p>
              Vi leter etter klinikker som vil være med på reisen fra starten.
              Ta kontakt så forteller vi mer om hva vi holder på med.
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
                Vi bygger journalsystemet vi selv skulle ønske fantes.
                Laget med hjerte i Norge.
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
