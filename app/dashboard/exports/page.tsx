"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface ExportJob {
    export_job_id: string;
    status: string;
    result?: {
        file_size_bytes: number;
        expires_at: string;
    };
    error?: string;
}

export default function ExportsPage() {
    const { data: session } = useSession();
    const [patientId, setPatientId] = useState("");
    const [jobs, setJobs] = useState<ExportJob[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const createExport = async () => {
        if (!patientId.trim()) {
            setError("Vennligst skriv inn en pasient-ID");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiBaseUrl}/exports/patients/${patientId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error(`Feil: ${response.status} ${response.statusText}`);
            }

            const job = await response.json();
            setJobs([job, ...jobs]);
            setPatientId("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "En feil oppstod");
        } finally {
            setLoading(false);
        }
    };

    const downloadExport = async (jobId: string) => {
        try {
            const response = await fetch(`${apiBaseUrl}/exports/${jobId}/download-init`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Feil: ${response.status}`);
            }

            const { download_url } = await response.json();
            window.open(download_url, "_blank");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Kunne ikke laste ned");
        }
    };

    return (
        <div className="exports-page">
            <h1>Dataeksport</h1>
            <p className="subtitle">Last ned pasientdata i tråd med GDPR artikkel 20</p>

            <div className="export-form">
                <div className="input-group">
                    <label htmlFor="patientId">Pasient-ID</label>
                    <input
                        id="patientId"
                        type="text"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        placeholder="Skriv inn pasient-ID..."
                    />
                </div>
                <button
                    className="export-btn"
                    onClick={createExport}
                    disabled={loading}
                >
                    {loading ? "Oppretter..." : "Start eksport"}
                </button>
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            <div className="jobs-list">
                <h2>Eksportjobber</h2>
                {jobs.length === 0 ? (
                    <p className="no-jobs">Ingen eksportjobber ennå</p>
                ) : (
                    jobs.map((job) => (
                        <div key={job.export_job_id} className="job-card">
                            <div className="job-info">
                                <span className="job-id">{job.export_job_id}</span>
                                <span className={`job-status status-${job.status.toLowerCase()}`}>
                                    {job.status}
                                </span>
                            </div>
                            {job.status === "COMPLETED" && (
                                <button
                                    className="download-btn"
                                    onClick={() => downloadExport(job.export_job_id)}
                                >
                                    Last ned
                                </button>
                            )}
                            {job.error && (
                                <span className="job-error">{job.error}</span>
                            )}
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
        .exports-page {
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

        .export-form {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: flex-end;
        }

        .input-group {
          flex: 1;
        }

        label {
          display: block;
          color: #94a3b8;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
        }

        input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .export-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .no-jobs {
          color: #64748b;
        }

        .job-card {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .job-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .job-id {
          font-family: monospace;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .job-status {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-completed {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .status-processing, .status-queued {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .status-failed {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .download-btn {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #22c55e;
          color: #22c55e;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .download-btn:hover {
          background: rgba(34, 197, 94, 0.1);
        }

        .job-error {
          color: #f87171;
          font-size: 0.85rem;
        }
      `}</style>
        </div>
    );
}
