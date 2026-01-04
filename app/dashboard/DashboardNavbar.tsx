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
          background: rgba(30, 41, 59, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .nav-brand svg {
          color: #3b82f6;
        }
        
        .nav-links {
          display: flex;
          gap: 0.5rem;
        }
        
        .nav-link {
          color: #94a3b8;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .nav-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        
        .user-name {
          color: #94a3b8;
          font-size: 0.9rem;
        }
        
        .logout-btn {
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.3);
          color: #94a3b8;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .logout-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
        }
      `}</style>
    </nav>
  );
}
