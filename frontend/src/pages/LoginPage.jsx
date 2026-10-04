import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAIStatus } from '../hooks/useAIStatus';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated } = useAuth();
  const { connected } = useAIStatus();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Target destination if redirected by ProtectedRoute
  const from = location.state?.from || '/dashboard';
  const redirectNotice = location.state?.message;

  // If already authenticated, redirect straight to target/dashboard
  useEffect(() => {
    if (isAuthenticated && !success) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setError('Please enter your email or username.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      await login(trimmedId, password);
      setSuccess(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 600);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
              <span style={{ fontSize: '1.4rem' }}>🎯</span>
            </div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">
              Log in to access your interview history, performance metrics, and personalized AI coaching.
            </p>
          </div>

          {/* AI Status Pill */}
          <div className="auth-ai-pill">
            <span className={`status-dot ${connected === true ? 'online' : connected === false ? 'offline' : 'checking'}`} />
            <span>{connected === true ? 'AI Engine Ready' : connected === false ? 'Local Ollama Offline' : 'Connecting to AI…'}</span>
          </div>

          {/* Redirect Reason Banner (e.g. from ProtectedRoute) */}
          {redirectNotice && !error && !success && (
            <div className="alert alert-warning animate-in" style={{ marginBottom: 'var(--space-4)' }}>
              <span>🔒</span>
              <div>{redirectNotice}</div>
            </div>
          )}

          {/* Error / Success alert */}
          {error && (
            <div className="alert alert-error animate-in" style={{ marginBottom: 'var(--space-4)' }}>
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="alert alert-success animate-in" style={{ marginBottom: 'var(--space-4)' }}>
              <span>✨</span>
              <div>Login successful! Redirecting you to your dashboard…</div>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-identifier">
                Email or Username
              </label>
              <div className="input-icon-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="login-identifier"
                  type="text"
                  className="form-input with-icon"
                  placeholder="name@example.com or username"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="username"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
                <span className="form-hint">Min. 6 characters</span>
              </div>
              <div className="input-icon-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input with-icon with-action"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18 }} />
                  Signing In…
                </>
              ) : success ? (
                <>✨ Signed In</>
              ) : (
                <>Sign In to PrepMate →</>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="auth-divider">
            <span>OR QUICK ACCESS</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary auth-demo-btn"
            onClick={() => {
              setIdentifier('developer@prepmate.ai');
              setPassword('prepmate123');
              setError('');
            }}
            disabled={loading || success}
          >
            ⚡ Auto-fill Demo Credentials
          </button>

          {/* Footer link */}
          <div className="auth-footer">
            <p>
              Don't have an account yet?{' '}
              <Link to="/signup" className="auth-link" state={{ from }}>
                Sign up free →
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
