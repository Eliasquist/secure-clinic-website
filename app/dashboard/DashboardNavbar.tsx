"use client";

import { signOut } from "next-auth/react";

interface DashboardNavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function DashboardNavbar({ user }: DashboardNavbarProps) {
  return (
    <nav className="dashboard-nav">
      <div className="nav-content">
        <div className="nav-brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>Secure Clinic</span>
        </div>

        <div className="nav-links">
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/dashboard/subscription" className="nav-link">Abonnement</a>
          <a href="/dashboard/downloads" className="nav-link">Nedlastinger</a>
          <a href="/dashboard/exports" className="nav-link">Eksporter</a>
        </div>

        <div className="nav-user">
          {user?.image && (
            <img src={user.image} alt="" className="user-avatar" />
          )}
          <span className="user-name">{user?.name || user?.email}</span>
          <button
            className="logout-btn"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Logg ut
          </button>
        </div>
      </div>

      <style jsx>{`
        .dashboard-nav {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }
        
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #002b49;
          font-weight: 600;
          font-size: 1.25rem;
        }
        
        .nav-brand svg {
          color: #13adc4;
        }
        
        .nav-links {
          display: flex;
          gap: 0.25rem;
        }
        
        .nav-link {
          color: #64748b;
          text-decoration: none;
          padding: 0.625rem 1rem;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .nav-link:hover {
          color: #13adc4;
          background: rgba(19, 173, 196, 0.08);
        }
        
        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
        }
        
        .user-name {
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
        }
        
        .logout-btn {
          background: transparent;
          border: 1px solid #e2e8f0;
          color: #64748b;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .logout-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
      `}</style>
    </nav>
  );
}
