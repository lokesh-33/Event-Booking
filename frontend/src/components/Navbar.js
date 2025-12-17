import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          🎉 Event Platform
        </Link>

        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link" onClick={closeMobileMenu}>
            Events
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'creator' && (
                <Link to="/create-event" className="navbar-link" onClick={closeMobileMenu}>
                  Create Event
                </Link>
              )}
              <Link to="/my-events" className="navbar-link" onClick={closeMobileMenu}>
                My Events
              </Link>
              <div className="navbar-user">
                <span className="user-name">
                  {user?.name}
                  <span className="role-badge">
                    {user?.role === 'creator' ? '👨‍💼 Creator' : '🎫 Attender'}
                  </span>
                </span>
                <button onClick={() => { logout(); closeMobileMenu(); }} className="btn btn-sm btn-outline">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={closeMobileMenu}>
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary" onClick={closeMobileMenu}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="navbar-mobile-icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
