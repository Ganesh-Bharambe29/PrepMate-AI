/**
 * ReportPage — Final interview performance report.
 * Receives session data from InterviewPage via router state.
 * Also saves to localStorage for the Dashboard.
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { generateFinalReport } from '../services/api';
import { VERDICT_CONFIG, SCORE_COLOR } from '../utils/constants';
import { saveInterviewToHistory } from '../utils/storage';

function ScoreCircle({ score }) {
  const color = SCORE_COLOR(score);
  return (
    <div
      style={{
        width: 100,
        height: 100,
        borderRadius: '50%',
        border: `4px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${color}18`,
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color, lineHeight: 1 }}>
        {score}
      </div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>/ 10 avg</div>
    </div>
  );
}

function TagList({ items, color }) {
  if (!items || items.length === 0) return <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None identified</span>;
  return (
    <div className="tag-list">
      {items.map((item, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            background: `${color}18`,
            border: `1px solid ${color}40`,
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            color,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const savedRef = useRef(false);

  const state = location.state;

  // If accessed directly without data, redirect
  useEffect(() => {
    if (!state?.questionHistory) {
      navigate('/setup', { replace: true });
    }
  }, [state, navigate]);

  const { category, difficulty, questionCount, candidateName, questionHistory = [] } = state || {};

  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const averageScore = questionHistory.length > 0
    ? (questionHistory.reduce((s, q) => s + (q.score || 0), 0) / questionHistory.length).toFixed(1)
    : 0;

  // ── Generate AI summary report ──

  useEffect(() => {
    if (!state?.questionHistory || state.questionHistory.length === 0) return;

    async function fetchReport() {
      try {
        const data = await generateFinalReport({
          category,
          difficulty,
          candidateName,
          questionHistory,
        });
        setSummary(data.report);
      } catch (err) {
        setError('Could not generate AI summary. Showing manual report below.');
        setSummary({
          overall_assessment: `You completed a ${difficulty} ${category} interview with ${questionHistory.length} questions and an average score of ${averageScore}/10.`,
          strong_areas: [],
          weak_areas: [],
          recommended_topics: [category],
          performance_level: averageScore >= 7 ? 'Good' : averageScore >= 5 ? 'Average' : 'Needs Improvement',
          readiness: 'Continue practicing to improve.',
          encouragement: 'Every practice session brings you closer to your goal!',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save to localStorage once summary is ready ──

  useEffect(() => {
    if (summary && !savedRef.current && questionHistory.length > 0) {
      savedRef.current = true;
      saveInterviewToHistory({
        category,
        difficulty,
        questionCount,
        candidateName,
        averageScore: parseFloat(averageScore),
        questionsCompleted: questionHistory.length,
        performanceLevel: summary.performance_level,
      });
    }
  }, [summary]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state?.questionHistory) return null;

  const verdictCfg = (v) => VERDICT_CONFIG[v] || { color: 'badge-gray', icon: '📋' };

  return (
    <main className="page">
      <div className="container">

        {/* ── Page Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }} className="animate-in">
          <p className="section-title">Interview Complete</p>
          <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>
            {candidateName ? `${candidateName}'s Report` : 'Your Interview Report'}
          </h1>
          <div className="flex justify-center gap-3" style={{ flexWrap: 'wrap' }}>
            <span className="badge badge-blue">{category}</span>
            <span className={`badge ${difficulty === 'Easy' ? 'badge-green' : difficulty === 'Medium' ? 'badge-yellow' : 'badge-red'}`}>
              {difficulty}
            </span>
            <span className="badge badge-gray">{questionHistory.length} questions</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-warning animate-in" style={{ marginBottom: 'var(--space-5)' }}>
            {error}
          </div>
        )}

        {/* ── Overview Card ── */}
        <div className="card-elevated animate-in" style={{ marginBottom: 'var(--space-6)' }}>
          {loading ? (
            <div className="flex items-center gap-4" style={{ color: 'var(--text-secondary)' }}>
              <div className="spinner spinner-lg" />
              <div>
                <div style={{ fontWeight: 600 }}>Generating AI Summary…</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>This may take a moment.</div>
              </div>
            </div>
          ) : summary && (
            <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <ScoreCircle score={parseFloat(averageScore)} />

              <div style={{ flex: 1, minWidth: 240 }}>
                <div className="flex gap-3 items-center" style={{ marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {summary.performance_level}
                  </span>
                  <span className="badge badge-gray">{summary.readiness}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: 'var(--space-4)' }}>
                  {summary.overall_assessment}
                </p>
                <p style={{ color: 'var(--accent)', fontStyle: 'italic', fontSize: '0.88rem' }}>
                  💬 {summary.encouragement}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Strong / Weak / Recommended ── */}
        {!loading && summary && (
          <div className="report-grid animate-in" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Strong Areas */}
              <div className="card">
                <p className="section-title" style={{ marginBottom: 'var(--space-3)' }}>💪 Strong Areas</p>
                <TagList items={summary.strong_areas} color="var(--success)" />
              </div>

              {/* Weak Areas */}
              <div className="card">
                <p className="section-title" style={{ marginBottom: 'var(--space-3)' }}>📚 Needs Work</p>
                <TagList items={summary.weak_areas} color="var(--warning)" />
              </div>

              {/* Recommended Topics */}
              <div className="card">
                <p className="section-title" style={{ marginBottom: 'var(--space-3)' }}>🎯 Study These Next</p>
                <TagList items={summary.recommended_topics} color="var(--accent)" />
              </div>
            </div>

            {/* Question Breakdown */}
            <div className="card">
              <p className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Question Breakdown</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {questionHistory.map((item, i) => {
                  const vc = verdictCfg(item.verdict);
                  const sc = SCORE_COLOR(item.score);
                  return (
                    <details
                      key={i}
                      style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                      }}
                    >
                      <summary
                        style={{
                          padding: 'var(--space-4)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          userSelect: 'none',
                          listStyle: 'none',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          className="mono"
                          style={{ fontSize: '1.2rem', fontWeight: 800, color: sc, minWidth: 30, flexShrink: 0 }}
                        >
                          {item.score}
                        </span>
                        <span className={`badge ${vc.color}`} style={{ flexShrink: 0 }}>
                          {vc.icon} {item.verdict}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>
                          Q{i + 1}: {item.question?.slice(0, 70)}…
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>▼</span>
                      </summary>

                      <div
                        style={{
                          padding: 'var(--space-4)',
                          borderTop: '1px solid var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--space-3)',
                        }}
                      >
                        <div>
                          <p className="section-title" style={{ marginBottom: 4 }}>Question</p>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{item.question}</p>
                        </div>

                        {item.answer && (
                          <div>
                            <p className="section-title" style={{ marginBottom: 4 }}>Your Answer</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{item.answer}</p>
                          </div>
                        )}

                        {item.strengths?.length > 0 && (
                          <div>
                            <p className="section-title" style={{ marginBottom: 4 }}>Strengths</p>
                            {item.strengths.map((s, j) => (
                              <div key={j} style={{ fontSize: '0.82rem', color: 'var(--success)', marginBottom: 2 }}>✅ {s}</div>
                            ))}
                          </div>
                        )}

                        {item.issues?.length > 0 && (
                          <div>
                            <p className="section-title" style={{ marginBottom: 4 }}>Issues</p>
                            {item.issues.map((s, j) => (
                              <div key={j} style={{ fontSize: '0.82rem', color: 'var(--warning)', marginBottom: 2 }}>⚠️ {s}</div>
                            ))}
                          </div>
                        )}

                        {item.ideal_answer && (
                          <div>
                            <p className="section-title" style={{ marginBottom: 4 }}>Model Answer</p>
                            <div className="ideal-answer" style={{ fontSize: '0.82rem' }}>{item.ideal_answer}</div>
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex justify-center gap-4" style={{ flexWrap: 'wrap', paddingTop: 'var(--space-4)' }}>
          <Link to="/setup" className="btn btn-primary btn-lg">
            Start New Interview →
          </Link>
          <Link
            to="/setup"
            state={{ category, difficulty }}
            className="btn btn-secondary btn-lg"
          >
            🔄 Practice Same Topic
          </Link>
          <Link to="/dashboard" className="btn btn-ghost btn-lg">
            📊 Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
