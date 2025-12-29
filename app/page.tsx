import Image from "next/image";

export default function Home() {
  return (
    <>
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
            <li><a href="#omtaler">Omtaler</a></li>
            <li><a href="#kontakt">Kontakt</a></li>
          </ul>
          <div className="navbar-cta">
            <a href="#demo" className="btn btn-secondary">Book en demo</a>
            <a href="#start" className="btn btn-primary">Prøv gratis</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="dot"></span>
              Trygt og enkelt for alle
            </div>
            <h1>
              Din klinikk fortjener et<br />
              <span className="gradient-text">journalsystem som bare fungerer</span>
            </h1>
            <p className="hero-subtitle">
              Vi vet hvor travle dagene kan være. Derfor har vi laget et journalsystem
              som er enkelt å bruke, trygt for pasientene — og som lar deg fokusere på
              det du gjør best: å hjelpe mennesker.
            </p>
            <div className="hero-buttons">
              <a href="#start" className="btn btn-primary">
                Prøv gratis i 30 dager
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#demo" className="btn btn-secondary">
                Se hvordan det fungerer
              </a>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-item">
                <span className="icon">✓</span>
                Ingen binding
              </div>
              <div className="hero-trust-item">
                <span className="icon">✓</span>
                Gratis opplæring
              </div>
              <div className="hero-trust-item">
                <span className="icon">✓</span>
                Norsk support
              </div>
            </div>
          </div>
          <div className="hero-image">
            <Image
              src="/hero-doctor.png"
              alt="Fornøyd helsepersonell som bruker Secure Clinic"
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
            <h2>Laget med omtanke for deg</h2>
            <p>Alt du trenger for en enklere arbeidshverdag</p>
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
              <p>Bank-nivå sikkerhet beskytter alle pasientopplysninger. Du kan føle deg trygg hver dag.</p>
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
              <h3>Norske krav, norsk support</h3>
              <p>Vi forstår regelverket og snakker ditt språk. Ring oss når du trenger hjelp!</p>
            </div>
            <div className="feature-card warm-card">
              <div className="feature-icon">☁️</div>
              <h3>Alltid tilgjengelig</h3>
              <p>Jobb fra kontoret, hjemme eller på farten. Alt ligger trygt i skyen — alltid oppdatert.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="omtaler" className="testimonials section">
        <div className="container">
          <div className="testimonials-header">
            <h2>Hva kundene våre sier</h2>
            <p>Vi er stolte av å hjelpe klinikker over hele Norge</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card warm-card">
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                &quot;Endelig et journalsystem som faktisk er enkelt å bruke! Vi sparte masse tid,
                og pasientene elsker at de kan booke timer selv. Anbefales på det varmeste.&quot;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">👩‍⚕️</div>
                <div>
                  <div className="testimonial-name">Dr. Kristine Berg</div>
                  <div className="testimonial-role">Tannlege, Bergen Tannklinikk</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card warm-card">
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                &quot;Supporten er fantastisk! Da vi trengte hjelp med overgangen, var de der
                for oss hele veien. Det føles som å ha en ekstra kollega.&quot;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">👨‍⚕️</div>
                <div>
                  <div className="testimonial-name">Thomas Andersen</div>
                  <div className="testimonial-role">Fysioterapeut, Aktiv Fysio Oslo</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card warm-card">
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                &quot;Vi byttet fra et gammelt system og fryktet det verste. Men overgangen
                var smertefri, og nå lurer vi på hvorfor vi ikke byttet før!&quot;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">👩‍💼</div>
                <div>
                  <div className="testimonial-name">Lise Haugen</div>
                  <div className="testimonial-role">Klinikksjef, Haugen Helse</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="sikkerhet" className="security section">
        <div className="container">
          <div className="security-content">
            <div className="security-text">
              <h2>Sikkerhet du kan <span className="gradient-text">stole på</span></h2>
              <p>
                Pasientene dine stoler på deg med sine mest private opplysninger.
                Vi tar det ansvaret på alvor og sørger for at alt er trygt.
              </p>
              <ul className="security-list">
                <li>
                  <span className="check">✓</span>
                  All data krypteres og lagres sikkert
                </li>
                <li>
                  <span className="check">✓</span>
                  Automatisk sikkerhetskopi hver dag
                </li>
                <li>
                  <span className="check">✓</span>
                  Full kontroll over hvem som ser hva
                </li>
                <li>
                  <span className="check">✓</span>
                  Oppfyller alle GDPR-krav
                </li>
                <li>
                  <span className="check">✓</span>
                  Data lagres i Norge
                </li>
              </ul>
            </div>
            <div className="security-badges">
              <div className="security-badge warm-card">
                <div className="security-badge-icon">🛡️</div>
                <h4>GDPR</h4>
                <p>Fullt ut godkjent</p>
              </div>
              <div className="security-badge warm-card">
                <div className="security-badge-icon">📜</div>
                <h4>Normen</h4>
                <p>Følger alle krav</p>
              </div>
              <div className="security-badge warm-card">
                <div className="security-badge-icon">🇳🇴</div>
                <h4>Norsk datasenter</h4>
                <p>Trygg lagring</p>
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
            <h2>La oss ta en prat! ☕</h2>
            <p>
              Vi elsker å snakke med folk som oss — som brenner for god pasientbehandling.
              Ta kontakt så finner vi ut hvordan vi kan hjelpe akkurat deg.
            </p>
            <a href="mailto:hei@secureclinic.no" className="btn">
              Send oss en melding
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
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
                Journalsystemet som gjør hverdagen enklere for klinikker over hele Norge.
                Laget med hjerte for helsepersonell.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-links-column">
                <h4>Produkt</h4>
                <ul>
                  <li><a href="#funksjoner">Funksjoner</a></li>
                  <li><a href="#sikkerhet">Sikkerhet</a></li>
                  <li><a href="#priser">Priser</a></li>
                </ul>
              </div>
              <div className="footer-links-column">
                <h4>Selskap</h4>
                <ul>
                  <li><a href="#om-oss">Om oss</a></li>
                  <li><a href="#kontakt">Kontakt</a></li>
                  <li><a href="#blogg">Blogg</a></li>
                </ul>
              </div>
              <div className="footer-links-column">
                <h4>Hjelp</h4>
                <ul>
                  <li><a href="#support">Support</a></li>
                  <li><a href="#personvern">Personvern</a></li>
                  <li><a href="#vilkar">Vilkår</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Secure Clinic Journal. Laget med 💚 i Norge.</p>
            <div className="footer-bottom-links">
              <a href="#personvern">Personvern</a>
              <a href="#vilkar">Vilkår</a>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
