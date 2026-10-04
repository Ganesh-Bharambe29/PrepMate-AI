/**
 * SetupPage — Interview configuration screen.
 * User picks category, difficulty, question count, and optional name.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AIStatusBanner from '../components/AIStatusBanner';
import { useAIStatus } from '../hooks/useAIStatus';
import { CATEGORIES, DIFFICULTIES, QUESTION_COUNTS } from '../utils/constants';

export default function SetupPage() {
  const navigate = useNavigate();
  const { connected } = useAIStatus();

  const [category, setCategory]           = useState('');
  const [difficulty, setDifficulty]       = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [candidateName, setCandidateName] = useState('');
  const [error, setError]                 = useState('');

  function handleStart() {
    if (!category)   { setError('Please select an interview category.'); return; }
    if (!difficulty) { setError('Please select a difficulty level.'); return; }

    navigate('/interview', {
      state: { category, difficulty, questionCount, candidateName: candidateName.trim() },
    });
  }

  return (
    <main className="page">
      <div className="container-sm">
        <AIStatusBanner />

        {/* Page header */}
        <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
          <p className="section-title">Interview Setup</p>
          <h1 style={{ fontSize: '2rem' }}>Prepare for your next interview</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-3)' }}>
            Configure your practice session below.
          </p>
        </div>

        {error && (
          <div className="alert alert-error animate-in" style={{ marginBottom: 'var(--space-5)' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

          {/* ── Category ── */}
          <div className="form-group">
            <label className="form-label">Interview Category</label>
            <div className="choice-grid choice-grid-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`choice-btn ${category === cat.id ? 'selected' : ''}`}
                  onClick={() => { setCategory(cat.id); setError(''); }}
                >
                  <span className="choice-icon">{cat.icon}</span>
                  <span style={{ fontSize: '0.82rem' }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Difficulty ── */}
          <div className="form-group">
            <label className="form-label">Difficulty Level</label>
            <div className="choice-grid choice-grid-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  className={`choice-btn ${difficulty === d.id ? 'selected' : ''}`}
                  onClick={() => { setDifficulty(d.id); setError(''); }}
                  style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-2)' }}
                >
                  <span style={{ fontWeight: 700 }}>{d.label}</span>
                  <span style={{ fontSize: '0.78rem', opacity: 0.75 }}>{d.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Question Count ── */}
          <div className="form-group">
            <label className="form-label">Number of Questions</label>
            <div className="choice-grid choice-grid-3">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  className={`choice-btn ${questionCount === n ? 'selected' : ''}`}
                  onClick={() => setQuestionCount(n)}
                  style={{ justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700 }}
                >
                  {n} Questions
                </button>
              ))}
            </div>
          </div>

          {/* ── Candidate Name (optional) ── */}
          <div className="form-group">
            <label className="form-label" htmlFor="candidate-name">
              Your Name <span style={{ fontWeight: 400, textTransform: 'none', opacity: 0.6 }}>(optional)</span>
            </label>
            <input
              id="candidate-name"
              type="text"
              className="form-input"
              placeholder="e.g. Priya Sharma"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              maxLength={60}
            />
          </div>

          {/* ── Summary ── */}
          {category && difficulty && (
            <div
              className="animate-in"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--accent-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Session:</span>
              <span className="badge badge-blue">{category}</span>
              <span
                className={`badge ${
                  difficulty === 'Easy' ? 'badge-green' : difficulty === 'Medium' ? 'badge-yellow' : 'badge-red'
                }`}
              >
                {difficulty}
              </span>
              <span className="badge badge-gray">{questionCount} questions</span>
              {candidateName && (
                <span className="badge badge-gray">👤 {candidateName}</span>
              )}
            </div>
          )}

          {/* ── Start Button ── */}
          <button
            className="btn btn-primary btn-lg"
            onClick={handleStart}
            disabled={connected === false}
            style={{ alignSelf: 'flex-end' }}
          >
            {connected === false ? '⚠️ Ollama Offline' : 'Start Interview →'}
          </button>
        </div>
      </div>
    </main>
  );
}
