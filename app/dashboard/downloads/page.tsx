"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ReleaseInfo {
    version: string;
    releaseDate: string;
    changelog: string[];
    downloads: {
        windows: { url: string; size: string; checksum: string };
        macos?: { url: string; size: string; checksum: string };
    };
}

export default function DownloadsPage() {
    const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
    const [release, setRelease] = useState<ReleaseInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloadingPlatform, setDownloadingPlatform] = useState<string | null>(null);

    useEffect(() => {
        // Check subscription status
        fetch("/api/subscription/status")
            .then((res) => res.json())
            .then((data) => {
                setHasSubscription(data.subscription?.status === "active");
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Fetch latest release info
        fetch("/api/releases/latest")
            .then((res) => res.json())
            .then((data) => {
                if (data.release) {
                    setRelease(data.release);
                }
            })
            .catch(console.error);
    }, []);

    const handleDownload = async (platform: "windows" | "macos") => {
        setDownloadingPlatform(platform);
        try {
            const res = await fetch(`/api/downloads/${platform}`, {
                method: "POST",
            });
            const data = await res.json();

            if (data.error) {
                alert(data.error);
                return;
            }

            // Redirect to signed download URL
            window.location.href = data.url;
        } catch (error) {
            console.error("Download error:", error);
            alert("Nedlasting feilet. Prøv igjen.");
        } finally {
            setDownloadingPlatform(null);
        }
    };

    if (loading) {
        return (
            <div className="downloads-page">
                <div className="loading">Laster...</div>
            </div>
        );
    }

    if (!hasSubscription) {
        return (
            <div className="downloads-page">
                <h1>Nedlastinger</h1>
                <div className="no-access">
                    <div className="lock-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h2>Aktivt abonnement kreves</h2>
                    <p>
                        Du må ha et aktivt abonnement for å laste ned Secure Clinic Journal.
                    </p>
                    <a href="/dashboard/subscription" className="btn btn-primary">
                        Se abonnement
                    </a>
                </div>

                <style jsx>{`
          .downloads-page {
            color: white;
            max-width: 800px;
          }
          h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
          }
          .no-access {
            text-align: center;
            padding: 4rem 2rem;
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
          }
          .lock-icon {
            color: #64748b;
            margin-bottom: 1.5rem;
          }
          h2 {
            font-size: 1.5rem;
            margin-bottom: 0.75rem;
          }
          p {
            color: #94a3b8;
            margin-bottom: 1.5rem;
          }
          .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            text-decoration: none;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
          }
          .loading {
            color: #94a3b8;
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="downloads-page">
            <h1>Nedlastinger</h1>
            <p className="subtitle">
                Last ned Secure Clinic Journal for din plattform
            </p>

            <div className="releases">
                <div className="release-card">
                    <div className="release-header">
                        <h2>Secure Clinic Journal</h2>
                        <span className="version">v{release?.version || "0.3.0"}</span>
                    </div>

                    <div className="platforms">
                        {/* Windows */}
                        <div className="platform-card">
                            <div className="platform-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                                </svg>
                            </div>
                            <div className="platform-info">
                                <h3>Windows</h3>
                                <p>Windows 10/11 (64-bit)</p>
                                <span className="file-size">{release?.downloads.windows.size || "~65 MB"}</span>
                            </div>
                            <button
                                onClick={() => handleDownload("windows")}
                                disabled={downloadingPlatform === "windows"}
                                className="btn btn-download"
                            >
                                {downloadingPlatform === "windows" ? (
                                    "Forbereder..."
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Last ned (.msi)
                                    </>
                                )}
                            </button>
                        </div>

                        {/* macOS */}
                        <div className="platform-card">
                            <div className="platform-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                            </div>
                            <div className="platform-info">
                                <h3>macOS</h3>
                                <p>macOS 11+ (Apple Silicon & Intel)</p>
                                <span className="file-size">Kommer snart</span>
                            </div>
                            <button className="btn btn-download" disabled>
                                Ikke tilgjengelig
                            </button>
                        </div>
                    </div>

                    {release?.changelog && (
                        <div className="changelog">
                            <h4>Hva er nytt i v{release.version}:</h4>
                            <ul>
                                {release.changelog.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="checksums">
                <h3>SHA256 sjekksummer</h3>
                <p className="muted">Verifiser nedlastingen for sikkerhet</p>
                <pre>
                    {release?.downloads.windows.checksum || "Laster..."}  SecureClinic-{release?.version || "0.3.0"}.msi
                </pre>
            </div>

            <style jsx>{`
        .downloads-page {
          color: white;
          max-width: 800px;
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

        .release-card {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .release-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .release-header h2 {
          font-size: 1.5rem;
          margin: 0;
        }

        .version {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .platforms {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .platform-card {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .platform-icon {
          color: #64748b;
          margin-bottom: 1rem;
        }

        .platform-info h3 {
          margin: 0 0 0.25rem;
          font-size: 1.1rem;
        }

        .platform-info p {
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0 0 0.5rem;
        }

        .file-size {
          color: #64748b;
          font-size: 0.75rem;
        }

        .btn-download {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-download:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn-download:disabled {
          background: rgba(148, 163, 184, 0.2);
          cursor: not-allowed;
          opacity: 0.5;
        }

        .changelog {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 1rem;
        }

        .changelog h4 {
          margin: 0 0 0.75rem;
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .changelog ul {
          margin: 0;
          padding-left: 1.25rem;
          color: #cbd5e1;
        }

        .changelog li {
          margin-bottom: 0.5rem;
        }

        .checksums {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .checksums h3 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
        }

        .checksums .muted {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0 0 1rem;
        }

        .checksums pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 0;
        }
      `}</style>
        </div>
    );
}
