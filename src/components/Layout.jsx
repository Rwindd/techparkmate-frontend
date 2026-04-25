// ─── Layout.jsx ───────────────────────────────────────────────────────────────
import React, { useState, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Toast from './Toast';
import './Layout.css';

// Global toast system — any child can call window.showToast(ico, title, body)
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((ico, title, body) => {
    const id = Date.now();
    setToasts(t => [...t, { id, ico, title, body }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  }, []);
  return { toasts, show };
}

const NAV_ITEMS = [
  { to: '/',          label: 'Home',       emoji: '🏠' },
  { to: '/sports',    label: 'Sports',     emoji: '🏏' },
  { to: '/lunch',     label: 'Lunch',      emoji: '🍽️' },
  { to: '/build',     label: 'Build',      emoji: '💻' },
  { to: '/gaming',    label: 'Gaming',     emoji: '🎮' },
  { to: '/movie',     label: 'Movie',      emoji: '🎬' },
  { to: '/clockpoint',label: 'Clockpoint', emoji: '☕' },
  { to: '/anon',      label: 'Anon',       emoji: '👻' },
  { to: '/olympians', label: 'Olympians',  emoji: '🏆' },
];

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toasts, show } = useToast();

  // Expose globally so any page can call window.showToast(...)
  React.useEffect(() => { window.showToast = show; }, [show]);

  return (
    <>
      <nav className="topnav">
        <div className="topnav-logo" onClick={() => navigate('/')}>
          <span className="logo-hex">⬡</span> ParkMate
        </div>

        <div className="topnav-links">
          {NAV_ITEMS.map(n => (
            <NavLink
              key={n.to} to={n.to} end={n.to === '/'}
              className={({ isActive }) => `nav-tab ${isActive ? 'on' : ''}`}
            >
              <span>{n.emoji}</span>
              <span className="nav-label">{n.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="topnav-right">
          <button className="create-btn" onClick={() => navigate('/create')}>
            ＋ Create Event
          </button>
          <div className="notif-btn" onClick={() => show('🔔','Notifications','No new notifications.')}>
            🔔<div className="notif-pip" />
          </div>
          <div className="user-av" onClick={() => navigate('/profile')}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </nav>

      {/* This is where each page renders */}
      <Outlet context={{ showToast: show }} />

      {/* Toast notifications */}
      <div className="toast-wrap">
        {toasts.map(t => <Toast key={t.id} {...t} />)}
      </div>
    </>
  );
}
