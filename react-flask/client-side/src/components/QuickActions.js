import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './QuickActions.css';

function QuickActions() {
  const location = useLocation();
  const links = [
    { to: '/', label: 'About' },
    { to: '/login', label: 'Login' },
    { to: '/combinedpage', label: 'Plans' },
    { to: '/courses', label: 'Courses' },
    { to: '/prerequisites', label: 'Prereqs' },
    { to: '/add-course', label: 'Add Course' },
  ];

  return (
    <div className="quick-dock glass-card">
      <div className="quick-dock__title">Quick links</div>
      <div className="quick-dock__links">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`btn ${isActive ? 'primary' : 'ghost'}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;
