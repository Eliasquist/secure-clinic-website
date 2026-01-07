"use client";

import { useState } from "react";
import Image from "next/image";

interface Tab {
    id: 'patient' | 'practitioner';
    label: string;
}

export default function ProductTourSection() {
    const [activeTab, setActiveTab] = useState<'patient' | 'practitioner'>('patient');

    const tabs: Tab[] = [
        { id: 'patient', label: 'For pasienten (Booking)' },
        { id: 'practitioner', label: 'For behandleren (Journal)' }
    ];

    const content = {
        patient: {
            steps: [
                { icon: '📅', text: 'Velg behandling og tidspunkt' },
                { icon: '✉️', text: 'Få bekreftelse på e-post' },
                { icon: '🏥', text: 'Klinikken får konsultasjonen klar' }
            ],
            cta: {
                text: 'Prøv booking-demo',
                href: '/book/demo-klinikk'
            },
            preview: '/booking-preview.png' // Placeholder
        },
        practitioner: {
            steps: [
                { icon: '📋', text: 'Konsultasjon ligger klar fra booking' },
                { icon: '💉', text: 'Dokumenter injeksjonskart + produkt/batch' },
                { icon: '✍️', text: 'Signer og få fakturautkast' }
            ],
            cta: {
                text: 'Se journal-demo',
                href: '/demo#desktop'
            },
            preview: '/journal-preview.png' // Placeholder
        }
    };

    const activeContent = content[activeTab];

    return (
        <section className="product-tour section">
            <div className="container">
                <div className="tour-header">
                    <h2 className="heading-2">Slik fungerer Secure Clinic i praksis</h2>
                    <p className="lead" style={{ maxWidth: '700px', margin: '0 auto' }}>
                        To flyter: pasienten booker, klinikken dokumenterer.
                    </p>
                </div>

                {/* Tabs */}
                <div className="tour-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tour-tab ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="tour-content">
                    {/* Steps */}
                    <div className="tour-steps">
                        {activeContent.steps.map((step, index) => (
                            <div key={index} className="tour-step">
                                <div className="step-icon">{step.icon}</div>
                                <div className="step-number">{index + 1}</div>
                                <p className="step-text">{step.text}</p>
                            </div>
                        ))}
                        <div className="tour-cta-mobile">
                            <a href={activeContent.cta.href} className="btn btn-primary">
                                {activeContent.cta.text} →
                            </a>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="tour-preview">
                        <div className={`device-frame ${activeTab === 'patient' ? 'phone' : 'laptop'}`}>
                            {/* Placeholder for actual screenshots */}
                            <div className="preview-placeholder">
                                <div className="placeholder-icon">
                                    {activeTab === 'patient' ? '📱' : '💻'}
                                </div>
                                <p>{activeTab === 'patient' ? 'Booking preview' : 'Journal preview'}</p>
                            </div>
                        </div>
                        <div className="tour-cta-desktop">
                            <a href={activeContent.cta.href} className="btn btn-primary">
                                {activeContent.cta.text} →
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .product-tour {
          background: white;
          border-top: 1px solid var(--color-border-light);
          border-bottom: 1px solid var(--color-border-light);
        }

        .tour-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .tour-tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .tour-tab {
          padding: 1rem 2rem;
          background: white;
          border: 2px solid var(--color-border);
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tour-tab:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .tour-tab.active {
          background: var(--gradient-primary);
          border-color: transparent;
          color: white;
        }

        .tour-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .tour-steps {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .tour-step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          position: relative;
        }

        .step-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .step-number {
          position: absolute;
          top: 0;
          left: 3.5rem;
          width: 24px;
          height: 24px;
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .step-text {
          font-size: 1.1rem;
          font-weight: 500;
          color: var(--color-text-primary);
          padding-left: 2.5rem;
        }

        .tour-cta-mobile {
          display: none;
          margin-top: 1rem;
        }

        .tour-cta-desktop {
          margin-top: 1.5rem;
        }

        .tour-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .device-frame {
          width: 100%;
          max-width: 400px;
          aspect-ratio: 9 / 16;
          background: #f5f5f5;
          border-radius: 24px;
          border: 8px solid #333;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          padding: 1rem;
          position: relative;
        }

        .device-frame.laptop {
          aspect-ratio: 16 / 10;
          max-width: 500px;
          border-radius: 12px;
          border: 6px solid #333;
        }

        .device-frame.laptop::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 120%;
          height: 8px;
          background: #333;
          border-radius: 0 0 8px 8px;
        }

        .preview-placeholder {
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .placeholder-icon {
          font-size: 4rem;
        }

        .preview-placeholder p {
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .tour-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .tour-steps {
            order: 2;
          }

          .tour-preview {
            order: 1;
          }

          .tour-cta-mobile {
            display: block;
          }

          .tour-cta-desktop {
            display: none;
          }

          .device-frame {
            max-width: 300px;
          }

          .device-frame.laptop {
            max-width: 100%;
          }

          .step-text {
            font-size: 1rem;
          }
        }
      `}</style>
        </section>
    );
}
