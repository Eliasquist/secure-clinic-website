export default function TrustBadgeRow() {
    const badges = [
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            ),
            text: "GDPR-klar fra dag én"
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
            text: "Tenant-isolasjon"
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            ),
            text: "Audit-logg"
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                </svg>
            ),
            text: "Azure-hosted"
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            ),
            text: "DPA inkludert"
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            ),
            text: "Norsk produkt"
        }
    ];

    return (
        <div className="trust-badges">
            <div className="container">
                <div className="badges-grid">
                    {badges.map((badge, index) => (
                        <div key={index} className="badge">
                            <div className="badge-icon">{badge.icon}</div>
                            <span className="badge-text">{badge.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .trust-badges {
          padding: 2rem 0;
          background: var(--color-bg-section);
          border-top: 1px solid var(--color-border-light);
        }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: white;
          border: 1px solid var(--color-border-light);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .badge:hover {
          border-color: var(--color-primary);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .badge-icon {
          flex-shrink: 0;
          color: var(--color-primary);
        }

        .badge-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary);
          line-height: 1.3;
        }

        @media (max-width: 768px) {
          .badges-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .badge {
            flex-direction: column;
            text-align: center;
            padding: 1rem 0.5rem;
          }

          .badge-text {
            font-size: 0.75rem;
          }
        }
      `}</style>
        </div>
    );
}
