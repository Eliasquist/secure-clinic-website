"use client";

import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="dashboard-home">
            <h1>Velkommen til din klinikkportal</h1>
            <p className="subtitle">Velg en funksjon nedenfor for å komme i gang</p>

            <div className="dashboard-grid">
                <Link href="/dashboard/exports" className="dashboard-card">
                    <div className="card-icon">
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
                    <div className="card-icon">
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
                    <div className="card-icon">
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
                    <div className="card-icon">
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
          color: white;
        }
        
        h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .subtitle {
          color: #94a3b8;
          margin-bottom: 2rem;
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        
        .dashboard-card {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 2rem;
          text-decoration: none;
          color: white;
          transition: all 0.2s ease;
        }
        
        .dashboard-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        
        .card-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: #3b82f6;
        }
        
        h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .dashboard-card p {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0;
        }
      `}</style>
        </div>
    );
}
