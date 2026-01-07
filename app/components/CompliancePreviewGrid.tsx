"use client";

import { useState } from "react";

interface ComplianceDoc {
    title: string;
    description: string;
    icon: string;
}

export default function CompliancePreviewGrid() {
    const [selectedDoc, setSelectedDoc] = useState<ComplianceDoc | null>(null);

    const documents: ComplianceDoc[] = [
        {
            title: "ROS-analyse mal",
            description: "Ferdigutfylt risikovurdering tilpasset estetiske klinikker",
            icon: "📊"
        },
        {
            title: "Databehandleravtale (DPA)",
            description: "GDPR-kompliant avtale mellom deg og Secure Clinic",
            icon: "📄"
        },
        {
            title: "Personvernerklæring",
            description: "Mal for personvernerklæring til dine pasienter",
            icon: "🔒"
        },
        {
            title: "Avviksskjema",
            description: "Digital avviksrapportering og oppfølging",
            icon: "⚠️"
        },
        {
            title: "Kriseplan",
            description: "Beredskapsplan for IT-avbrudd og sikkerhetshendelser",
            icon: "🆘"
        },
        {
            title: "Informasjonskapsler",
            description: "Cookie-policy for booking-systemet",
            icon: "🍪"
        }
    ];

    return (
        <>
            <div className="compliance-grid">
                <div className="compliance-header">
                    <h3>Komplett dokumentpakke inkludert</h3>
                    <p>Alt du trenger for å oppfylle GDPR og Helsedirektoratets krav</p>
                </div>

                <div className="grid">
                    {documents.map((doc, index) => (
                        <div key={index} className="compliance-card">
                            <div className="doc-icon">{doc.icon}</div>
                            <h4>{doc.title}</h4>
                            <p>{doc.description}</p>
                            <button
                                onClick={() => setSelectedDoc(doc)}
                                className="btn-preview"
                            >
                                Se eksempel →
                            </button>
                        </div>
                    ))}
                </div>

                <div className="compliance-footer">
                    <p className="time-save">
                        ⏱️ <strong>Sparer deg 10-20 timer</strong> på oppstartsfasen
                    </p>
                </div>
            </div>

            {/* Modal */}
            {selectedDoc && (
                <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
                    <div className="modal-content compliance-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedDoc(null)}>
                            ×
                        </button>
                        <div className="modal-header">
                            <div className="modal-icon">{selectedDoc.icon}</div>
                            <h3>{selectedDoc.title}</h3>
                            <p>{selectedDoc.description}</p>
                        </div>
                        <div className="modal-body">
                            <div className="preview-placeholder">
                                <div className="placeholder-icon">📄</div>
                                <p>
                                    Dette dokumentet er tilgjengelig når du aktiverer Secure Clinic.
                                    <br />
                                    Kontakt oss for å få tilgang til hele compliance-pakken.
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <a href="mailto:hei@secureclinic.no" className="btn btn-primary">
                                Kontakt oss for tilgang
                            </a>
                            <button onClick={() => setSelectedDoc(null)} className="btn btn-secondary">
                                Lukk
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .compliance-grid {
          background: white;
          padding: 3rem 2rem;
          border-radius: 16px;
        }

        .compliance-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .compliance-header h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--color-text-primary);
        }

        .compliance-header p {
          color: var(--color-text-secondary);
          font-size: 1rem;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .compliance-card {
          background: var(--color-bg-section);
          border: 1px solid var(--color-border-light);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .compliance-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .doc-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .compliance-card h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--color-text-primary);
        }

        .compliance-card p {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .btn-preview {
          background: none;
          border: none;
          color: var(--color-primary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s ease;
        }

        .btn-preview:hover {
          color: var(--color-primary-dark);
        }

        .compliance-footer {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border-light);
        }

        .time-save {
          font-size: 1.1rem;
          color: var(--color-text-secondary);
        }

        .time-save strong {
          color: var(--color-primary);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .compliance-modal {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 36px;
          height: 36px;
          border: none;
          background: var(--color-bg-section);
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          color: var(--color-text-muted);
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: var(--color-border);
          color: var(--color-text-primary);
        }

        .modal-header {
          padding: 2rem 2rem 1.5rem;
          text-align: center;
          border-bottom: 1px solid var(--color-border-light);
        }

        .modal-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .modal-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .modal-header p {
          color: var(--color-text-secondary);
          font-size: 0.95rem;
        }

        .modal-body {
          padding: 2rem;
        }

        .preview-placeholder {
          background: var(--color-bg-section);
          border: 2px dashed var(--color-border);
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
        }

        .placeholder-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .preview-placeholder p {
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--color-border-light);
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>
        </>
    );
}
