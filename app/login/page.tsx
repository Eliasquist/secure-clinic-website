"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
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
