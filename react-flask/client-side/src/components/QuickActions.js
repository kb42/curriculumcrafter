import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './QuickActions.css';

function QuickActions() {
  const location = useLocation();
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'));
  const [isOpen, setIsOpen] = useState(false);
  const links = [
    { to: '/', label: 'About' },
    { to: '/combinedpage', label: 'Plans' },
    { to: '/courses', label: 'Courses' },
    { to: '/prerequisites', label: 'Prereqs' },
  ];

  useEffect(() => {
    const syncAuth = () => setAuthed(!!localStorage.getItem('token'));
    syncAuth();

    // Listen for both storage events and custom authChange events
    window.addEventListener('storage', syncAuth);
    window.addEventListener('authChange', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('authChange', syncAuth);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('netid');
    localStorage.removeItem('name');
    localStorage.removeItem('majorid');
    localStorage.removeItem('egrad');

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));

    setAuthed(false);
    window.location.href = '/login';
  };

  return (
    <>
      <div className={`dock-overlay ${isOpen ? 'visible' : ''}`} onClick={() => setIsOpen(false)} />
      <div className={`quick-dock ${isOpen ? 'open' : ''}`}>
        <button
          className="dock-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <span className={`hamburger ${isOpen ? 'open' : ''}`}>
            <span />
            <span />
            <span />
          </span>
          <span className="dock-toggle__label">{isOpen ? 'Close' : 'Menu'}</span>
        </button>

        <div className="dock-panel glass-card">
          <div className="quick-dock__links">
            {!authed && (
              <Link
                to="/login"
                className={`btn ${location.pathname === '/login' ? 'primary' : 'ghost'}`}
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
            {links.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`btn ${active ? 'primary' : 'ghost'}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            {authed && (
              <>
                <Link
                  to="/login"
                  className="btn ghost"
                  onClick={() => setIsOpen(false)}
                >
                  Update Info
                </Link>
                <button className="btn ghost" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default QuickActions;
