/**
 * Navbar — Modern persistent top bar with brand, nav links, auth status, and AI status indicator.
 * Controls dynamic visibility for Dashboard based on user authentication state.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAIStatus } from '../hooks/useAIStatus';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { connected } = useAIStatus();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  let dotClass = 'checking';
  let statusLabel = 'Checking…';
  if (connected === true) {
    dotClass = 'online';
    statusLabel = 'AI Connected';
  } else if (connected === false) {
    dotClass = 'offline';
    statusLabel = 'AI Offline';
  }

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar">
        <div className="navbar-container">
          {/* Brand */}
          <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
            <div className="brand-icon-wrapper">
              <span className="brand-emoji">🎯</span>
              <div className="brand-glow-dot" />
            </div>
            <div className="brand-text">
              <span className="brand-name">PrepMate</span>
              <span className="brand-badge">AI</span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <div className="navbar-nav-links">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>

            {/* Dashboard link ONLY visible when authenticated */}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Action Items (Desktop) */}
          <div className="navbar-right">
            {/* AI Status Indicator */}
            <div className="status-indicator-pill" title={connected ? 'Ollama AI engine active' : 'Ollama not detected'}>
              <div className={`status-dot ${dotClass}`} />
              <span className="status-pill-text">{statusLabel}</span>
            </div>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="navbar-user-section">
                <div className="navbar-user-chip" title={currentUser?.email || currentUser?.name}>
                  <div className="user-avatar-sm">
                    {(currentUser?.name || currentUser?.username || 'U')[0].toUpperCase()}
                  </div>
                  <span className="user-name-text">
                    {currentUser?.name?.split(' ')[0] || currentUser?.username || 'User'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm nav-logout-btn"
                  title="Sign out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="navbar-auth-buttons">
                <Link
                  to="/login"
                  className={`btn btn-ghost btn-sm ${isActive('/login') ? 'active-auth' : ''}`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary btn-sm nav-signup-btn"
                >
                  Sign Up →
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`} />
              <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`} />
              <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer animate-in">
            <div className="mobile-drawer-links">
              <Link
                to="/"
                className={`mobile-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>🏠</span> Home
              </Link>

              {/* Dashboard in mobile drawer ONLY when authenticated */}
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`mobile-link ${isActive('/dashboard') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>📊</span> Dashboard
                </Link>
              )}

              <Link
                to="/setup"
                className="mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>🚀</span> Start Practice Session
              </Link>
            </div>

            <div className="mobile-drawer-divider" />

            {/* Mobile Status & Auth */}
            <div className="mobile-drawer-footer">
              <div className="status-indicator" style={{ marginBottom: 'var(--space-4)' }}>
                <div className={`status-dot ${dotClass}`} />
                <span>{statusLabel}</span>
              </div>

              {isAuthenticated ? (
                <div className="mobile-auth-user">
                  <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-3)' }}>
                    <div className="user-avatar-sm">
                      {(currentUser?.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-actions">
                  <Link
                    to="/login"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-primary btn-sm"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
