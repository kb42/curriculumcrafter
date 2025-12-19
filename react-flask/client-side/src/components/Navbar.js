import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="brand-wrapper">
        <div className='logo'>
          <img src="/cc_logo.png" alt="Curriculum Crafter Logo" />
        </div>
        <div className="brand">Curriculum Crafter</div>
      </div>

      <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
        <li>
          <Link to="/" className="link">Home</Link>
        </li>
        <li>
          <Link to="/login" className="link">Login</Link>
        </li>
        <li>
          <Link to="/combinedpage" className="link">My Academic Plans</Link>
        </li>
        <li>
          <Link to="/courses" className="link">Courses</Link>
        </li>
        <li>
          <Link to="/prerequisites" className="link">Prerequisites</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
