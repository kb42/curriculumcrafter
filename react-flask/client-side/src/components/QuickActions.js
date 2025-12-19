import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './QuickActions.css';

function QuickActions() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const links = [
    { to: '/', label: 'About' },
    { to: '/login', label: 'Login' },
    { to: '/combinedpage', label: 'Plans' },
    { to: '/courses', label: 'Courses' },
    { to: '/prerequisites', label: 'Prereqs' },
  ];

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
          </div>
        </div>
      </div>
    </>
  );
}

export default QuickActions;
