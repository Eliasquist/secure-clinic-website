"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Map NextAuth error codes to Norwegian user-friendly messages
  const errorMessages: Record<string, string> = {
    "Configuration": "Serverfeil: Autentisering er ikke konfigurert riktig. Kontakt administrator.",
    "AccessDenied": "Tilgang nektet. Du har ikke tilgang til denne portalen.",
    "Verification": "Verifiseringsfeil. Prøv å logge inn på nytt.",
    "OAuthSignin": "Kunne ikke starte innlogging med Microsoft. Prøv igjen.",
    "OAuthCallback": "Feil under OAuth callback. Sjekk at du har godkjent tilgang.",
    "OAuthCreateAccount": "Kunne ikke opprette brukerkonto. Kontakt administrator.",
    "Callback": "Innloggingsfeil. Prøv igjen eller kontakt administrator.",
    "Default": "En ukjent feil oppstod. Prøv igjen.",
  };

  const errorMessage = error ? (errorMessages[error] || errorMessages["Default"]) : null;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1>Secure Clinic Journal</h1>
        <p className="login-subtitle">Logg inn for å få tilgang til din klinikkportal</p>

        {errorMessage && (
          <div className="error-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
            {error && <code className="error-code">Feilkode: {error}</code>}
          </div>
        )}

        <button
          className="login-button"
          onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
        >
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          Logg inn med Microsoft
        </button>

        <p className="login-footer">
          Kun for autorisert klinikkpersonell
        </p>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 1rem;
        }
        
        .login-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .login-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .login-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }
        
        .error-box {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #fca5a5;
        }
        
        .error-box svg {
          color: #ef4444;
        }
        
        .error-box span {
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .error-code {
          font-size: 0.75rem;
          color: #94a3b8;
          background: rgba(0, 0, 0, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          margin-top: 0.25rem;
        }
        
        .login-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem 1.5rem;
          background: white;
          color: #1e293b;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .login-footer {
          margin-top: 2rem;
          font-size: 0.8rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white'
      }}>
        Laster...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
