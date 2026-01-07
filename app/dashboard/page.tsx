"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="dashboard-home">
      <h1>Velkommen til din klinikkportal</h1>
      <p className="subtitle">Velg en funksjon nedenfor for å komme i gang</p>

      <div className="dashboard-grid">
        <Link href="/dashboard/exports" className="dashboard-card">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <h3>Dataeksport</h3>
          <p>Last ned pasientdata i tråd med GDPR</p>
        </Link>

        <Link href="/dashboard/patients" className="dashboard-card">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3>Pasienter</h3>
          <p>Administrer pasientinformasjon</p>
        </Link>

        <Link href="/dashboard/consultations" className="dashboard-card">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h3>Konsultasjoner</h3>
          <p>Se og administrer journaler</p>
        </Link>

        <Link href="/dashboard/billing" className="dashboard-card">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <h3>Fakturering</h3>
          <p>Håndter fakturaer og betalinger</p>
        </Link>
      </div>

      <style jsx>{`
        .dashboard-home {
          color: #002b49;
        }
        
        h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #002b49;
        }
        
        .subtitle {
          color: #64748b;
          margin-bottom: 3rem;
          font-size: 1.1rem;
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }
        
        .dashboard-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 2.5rem;
          text-decoration: none;
          color: #002b49;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .dashboard-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(19, 173, 196, 0.15);
          border-color: #13adc4;
        }
        
        .card-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: #13adc4;
        }
        
        h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #002b49;
        }
        
        .dashboard-card p {
          color: #64748b;
          font-size: 1rem;
          margin: 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
