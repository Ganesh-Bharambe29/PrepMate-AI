import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAIStatus } from '../hooks/useAIStatus';

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, loading, isAuthenticated } = useAuth();
  const { connected } = useAIStatus();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (isAuthenticated && !success) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    try {
      await signup(trimmedName, trimmedEmail, password);
      setSuccess(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 600);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <main className="page auth-page">
      <div className="auth-glow" />
      <div className="container-sm">
        <div className="auth-card-wrapper animate-slide-up">
          {/* Brand header */}
          <div className="auth-header">
            <div className="auth-logo-badge">
              <span style={{ fontSize: '1.4rem' }}>🚀</span>
            </div>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">
              Join PrepMate AI to practice technical interviews locally with privacy and unlimited AI sessions.
            </p>
          </div>

          {/* AI Status Pill */}
          <div className="auth-ai-pill">
            <span className={`status-dot ${connected === true ? 'online' : connected === false ? 'offline' : 'checking'}`} />
            <span>{connected === true ? 'AI Engine Connected' : connected === false ? 'Local Ollama Offline' : 'Connecting to AI…'}</span>
          </div>

          {/* Alerts */}
          {error && (
            <div className="alert alert-error animate-in" style={{ marginBottom: 'var(--space-4)' }}>
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="alert alert-success animate-in" style={{ marginBottom: 'var(--space-4)' }}>
              <span>🎉</span>
              <div>Account created successfully! Taking you to Dashboard…</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">
                Full Name
              </label>
              <div className="input-icon-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="signup-name"
                  type="text"
                  className="form-input with-icon"
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="name"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">
                Email Address
              </label>
              <div className="input-icon-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="signup-email"
                  type="email"
                  className="form-input with-icon"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="email"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label className="form-label" htmlFor="signup-password">
                  Password
                </label>
                <span className="form-hint">Min. 6 chars</span>
              </div>
              <div className="input-icon-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input with-icon with-action"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="new-password"
                  disabled={loading || success}
                  required
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm-password">
                Confirm Password
              </label>
              <div className="input-icon-wrapper">
                <span className="input-icon">🛡️</span>
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input with-icon"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="new-password"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            <div className="auth-privacy-notice">
              <span>🔒</span>
              <span>100% Private Practice — No proprietary cloud AI tracking or telemetry.</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18 }} />
                  Creating Account…
                </>
              ) : success ? (
                <>🎉 Account Created</>
              ) : (
                <>Create Free Account →</>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link" state={{ from }}>
                Sign in here →
              </Link>
            </p>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
