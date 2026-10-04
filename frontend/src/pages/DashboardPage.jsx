/**
 * DashboardPage — Shows interview history and stats from localStorage.
 * No database required — uses the saveInterviewToHistory utility.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadInterviewHistory, formatDate, removeFromStorage } from '../utils/storage';
import { useAIStatus } from '../hooks/useAIStatus';
import { SCORE_COLOR } from '../utils/constants';

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { connected, model } = useAIStatus();
  const [history, setHistory] = useState(() => loadInterviewHistory());

  function clearHistory() {
    if (window.confirm('Clear all interview history? This cannot be undone.')) {
      removeFromStorage('history');
      setHistory([]);
    }
  }

  const totalInterviews = history.length;
  const avgScore =
    totalInterviews > 0
      ? (history.reduce((s, h) => s + (h.averageScore || 0), 0) / totalInterviews).toFixed(1)
      : '—';

  const categoryBreakdown = history.reduce((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="page">
      <div className="container">

        {/* ── Header ── */}
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <p className="section-title">Overview</p>
            <h1 style={{ fontSize: '1.8rem' }}>Dashboard</h1>
          </div>

          <div className="flex gap-3 items-center">
            {/* AI Status */}
            <div className="status-indicator">
              <div className={`status-dot ${connected === true ? 'online' : connected === false ? 'offline' : 'checking'}`} />
              <span style={{ fontSize: '0.85rem' }}>
                {connected === true ? `${model} · Ready` : connected === false ? 'Ollama Offline' : 'Checking…'}
              </span>
            </div>
            <Link to="/setup" className="btn btn-primary">
              New Interview →
            </Link>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)',
          }}
        >
          <StatCard label="Interviews" value={totalInterviews} sub="Total sessions" />
          <StatCard label="Avg Score" value={avgScore} sub="Out of 10" />
          <StatCard label="Categories" value={Object.keys(categoryBreakdown).length} sub="Practiced" />
          <StatCard
            label="Last Session"
            value={history[0] ? formatDate(history[0].completedAt) : '—'}
            sub={history[0]?.category || ''}
          />
        </div>

        {/* ── Category Breakdown ── */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <p className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Sessions by Category</p>
            <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
              {Object.entries(categoryBreakdown).map(([cat, count]) => (
                <div
                  key={cat}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cat}</span>
                  <span
                    style={{
                      background: 'var(--accent-dim)',
                      color: 'var(--accent)',
                      borderRadius: 'var(--radius-full)',
                      padding: '1px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── History List ── */}
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
          <p className="section-title" style={{ margin: 0 }}>Recent Interviews</p>
          {history.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearHistory} style={{ color: 'var(--danger)' }}>
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">🎯</div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>No interviews yet</h3>
            <p>Complete your first practice session to see results here.</p>
            <Link to="/setup" className="btn btn-primary" style={{ marginTop: 'var(--space-5)' }}>
              Start Practice →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {history.map((item) => {
              const scoreColor = SCORE_COLOR(item.averageScore || 0);
              return (
                <div
                  key={item.id}
                  className="card"
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}
                >
                  {/* Score */}
                  <div
                    className="mono"
                    style={{ fontSize: '1.5rem', fontWeight: 800, color: scoreColor, minWidth: 36, textAlign: 'center' }}
                  >
                    {item.averageScore?.toFixed(1) || '—'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.category}</span>
                      <span
                        className={`badge ${item.difficulty === 'Easy' ? 'badge-green' : item.difficulty === 'Medium' ? 'badge-yellow' : 'badge-red'}`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {item.difficulty}
                      </span>
                      {item.performanceLevel && (
                        <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                          {item.performanceLevel}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.questionsCompleted} questions · {formatDate(item.completedAt)}
                      {item.candidateName && ` · ${item.candidateName}`}
                    </div>
                  </div>

                  {/* Retry button */}
                  <Link
                    to="/setup"
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    Practice Again
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
