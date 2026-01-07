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
          color: #64748b;
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.875rem 1.25rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #002b49;
          font-size: 1rem;
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #13adc4;
          box-shadow: 0 0 0 3px rgba(19, 173, 196, 0.1);
        }

        .export-btn {
          padding: 0.875rem 2rem;
          background: #13adc4;
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }

        .export-btn:hover:not(:disabled) {
          background: #0f8fa3;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(19, 173, 196, 0.3);
        }

        .export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #dc2626;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
          color: #002b49;
        }

        .no-jobs {
          color: #64748b;
          font-size: 1rem;
        }

        .job-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem 1.75rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s;
        }

        .job-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border-color: #cbd5e1;
        }

        .job-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .job-id {
          font-family: monospace;
          color: #64748b;
          font-size: 0.95rem;
          background: #f1f5f9;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
        }

        .job-status {
          padding: 0.375rem 1rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-completed {
          background: rgba(34, 197, 94, 0.15);
          color: #16a34a;
        }

        .status-processing, .status-queued {
          background: rgba(19, 173, 196, 0.15);
          color: #0e7490;
        }

        .status-failed {
          background: rgba(239, 68, 68, 0.15);
          color: #dc2626;
        }

        .download-btn {
          padding: 0.625rem 1.25rem;
          background: white;
          border: 1.5px solid #16a34a;
          color: #16a34a;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .download-btn:hover {
          background: #16a34a;
          color: white;
          transform: translateY(-1px);
        }

        .job-error {
          color: #dc2626;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
