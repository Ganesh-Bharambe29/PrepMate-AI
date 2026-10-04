/**
 * InterviewPage — The core interview experience.
 *
 * State machine:
 *   loading_question → question_ready → submitting → showing_feedback → [next question | done]
 *
 * Session data is kept in React state and passed to ReportPage via router state.
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { startInterview, evaluateAnswer } from '../services/api';
import { VERDICT_CONFIG, SCORE_COLOR } from '../utils/constants';

// ─── Phase constants ───────────────────────────────────────

const PHASE = {
  LOADING:   'loading',
  QUESTION:  'question',
  SUBMITTING: 'submitting',
  FEEDBACK:  'feedback',
  DONE:      'done',
};

// ─── Helper components ─────────────────────────────────────

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div>
      <div className="flex justify-between" style={{ marginBottom: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>Progress</span>
        <span>{current} / {total}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="typing-dots">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = SCORE_COLOR(score);
  return (
    <div
      className="mono"
      style={{
        fontSize: '2rem',
        fontWeight: 800,
        color,
        lineHeight: 1,
      }}
    >
      {score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: 2 }}>/10</span>
    </div>
  );
}

function FeedbackList({ items, type }) {
  if (!items || items.length === 0) return null;
  const icon = type === 'strength' ? '✅' : '⚠️';
  const color = type === 'strength' ? 'var(--success)' : 'var(--warning)';
  return (
    <div className="feedback-list">
      {items.map((item, i) => (
        <div key={i} className="feedback-list-item">
          <span className="icon">{icon}</span>
          <span style={{ color }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────

export default function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const answerRef = useRef(null);

  // Session config (from SetupPage via router state)
  const config = location.state;

  // Redirect if accessed directly without config
  useEffect(() => {
    if (!config?.category) {
      navigate('/setup', { replace: true });
    }
  }, [config, navigate]);

  const { category, difficulty, questionCount, candidateName } = config || {};

  // ── State ──

  const [phase, setPhase]               = useState(PHASE.LOADING);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer]             = useState('');
  const [evaluation, setEvaluation]     = useState(null);
  const [error, setError]               = useState('');
  const [timer, setTimer]               = useState(0);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [previousQuestions, setPreviousQuestions] = useState([]);

  // ── Timer ──

  const timerRef = useRef(null);

  function startTimer() {
    setTimer(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  function formatTimer(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  // ── Load first question on mount ──

  useEffect(() => {
    if (config?.category) {
      loadQuestion(1, []);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadQuestion(qNum, prevQuestions) {
    setPhase(PHASE.LOADING);
    setError('');
    setAnswer('');
    setEvaluation(null);

    try {
      const data = await startInterview({
        category,
        difficulty,
        totalQuestions: questionCount,
        candidateName,
        previousQuestions: prevQuestions,
      });

      setCurrentQuestion(data);
      setPreviousQuestions((prev) => [...prev, data.question]);
      setPhase(PHASE.QUESTION);
      startTimer();
      setTimeout(() => answerRef.current?.focus(), 100);
    } catch (err) {
      setError(err.message || 'Failed to load question. Please try again.');
      setPhase(PHASE.QUESTION);
    }
  }

  // ── Submit Answer ──

  async function handleSubmit() {
    if (phase === PHASE.SUBMITTING) return;

    stopTimer();
    setPhase(PHASE.SUBMITTING);
    setError('');

    try {
      const data = await evaluateAnswer({
        category,
        difficulty,
        question: currentQuestion.question,
        answer: answer.trim(),
        questionNumber,
        totalQuestions: questionCount,
      });

      setEvaluation(data.evaluation);

      // Build history entry
      const historyEntry = {
        question: currentQuestion.question,
        topic: currentQuestion.topic,
        answer: answer.trim(),
        score: data.evaluation.score,
        verdict: data.evaluation.verdict,
        strengths: data.evaluation.strengths || [],
        issues: data.evaluation.issues || [],
        ideal_answer: data.evaluation.ideal_answer || '',
        follow_up_question: data.evaluation.follow_up_question || '',
        timeSpent: timer,
      };

      const updatedHistory = [...questionHistory, historyEntry];
      setQuestionHistory(updatedHistory);
      setPhase(PHASE.FEEDBACK);
    } catch (err) {
      setError(err.message || 'Failed to evaluate your answer. Please try again.');
      setPhase(PHASE.QUESTION);
      startTimer();
    }
  }

  // ── Next Question ──

  async function handleNextQuestion() {
    const nextNum = questionNumber + 1;

    if (nextNum > questionCount) {
      // Navigate to report
      navigate('/report', {
        state: {
          category,
          difficulty,
          questionCount,
          candidateName,
          questionHistory,
        },
      });
      return;
    }

    setQuestionNumber(nextNum);
    await loadQuestion(nextNum, previousQuestions);
  }

  // ── Skip Question ──

  function handleSkip() {
    // Submit with empty answer
    if (!answer.trim()) {
      handleSubmit();
    }
  }

  // ── Exit Interview ──

  function handleExit() {
    if (window.confirm('Exit the interview? Your progress will be lost.')) {
      navigate('/');
    }
  }

  // ── Finish Early ──

  function handleFinishEarly() {
    if (questionHistory.length === 0) {
      navigate('/');
      return;
    }
    navigate('/report', {
      state: { category, difficulty, questionCount, candidateName, questionHistory },
    });
  }

  // ── Verdict badge color ──

  function getVerdictConfig(verdict) {
    return VERDICT_CONFIG[verdict] || { color: 'badge-gray', icon: '📋' };
  }

  if (!config?.category) return null;

  const isLoading = phase === PHASE.LOADING;
  const isSubmitting = phase === PHASE.SUBMITTING;
  const showFeedback = phase === PHASE.FEEDBACK;
  const isBusy = isLoading || isSubmitting;
  const isLastQuestion = questionNumber >= questionCount;

  return (
    <main style={{ minHeight: '100vh', paddingBottom: 'var(--space-10)' }}>
      <div className="interview-layout">

        {/* ── Interview Header ── */}
        <div className="interview-header animate-in">
          <div className="interview-meta">
            <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
              <span className="badge badge-blue">{category}</span>
              <span className={`badge ${difficulty === 'Easy' ? 'badge-green' : difficulty === 'Medium' ? 'badge-yellow' : 'badge-red'}`}>
                {difficulty}
              </span>
              {candidateName && (
                <span className="badge badge-gray">👤 {candidateName}</span>
              )}
            </div>

            <div className="flex gap-3 items-center">
              {/* Timer */}
              <div
                className="mono"
                style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: 40 }}
              >
                {formatTimer(timer)}
              </div>

              <button className="btn btn-danger btn-sm" onClick={handleExit}>
                Exit
              </button>
            </div>
          </div>

          <ProgressBar current={showFeedback ? questionNumber : questionNumber - 1} total={questionCount} />
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="alert alert-error animate-in">
            ⚠️ {error}
            <button
              className="btn btn-sm"
              onClick={() => setError('')}
              style={{ marginLeft: 'auto', color: 'var(--danger)', background: 'transparent', border: 'none' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Question Card ── */}
        <div className="interview-question-card animate-in" key={questionNumber}>
          <div className="interviewer-label">
            <div className="interviewer-avatar">🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI Interviewer</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Question {questionNumber} of {questionCount}
                {currentQuestion?.topic && ` · ${currentQuestion.topic}`}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
              <TypingIndicator />
              <span style={{ fontSize: '0.9rem' }}>Preparing your question…</span>
            </div>
          ) : (
            <p className="question-text">
              {currentQuestion?.question || 'Question could not be loaded.'}
            </p>
          )}
        </div>

        {/* ── Answer Section ── */}
        {!showFeedback && (
          <div className="answer-section animate-in">
            <label
              className="form-label"
              htmlFor="answer-area"
              style={{ marginBottom: 'var(--space-3)', display: 'block' }}
            >
              Your Answer
            </label>
            <textarea
              id="answer-area"
              ref={answerRef}
              className="answer-textarea"
              placeholder={
                isLoading
                  ? 'Question loading…'
                  : 'Type your answer here. Take your time and be thorough.'
              }
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isBusy}
            />

            <div className="flex justify-between items-center" style={{ marginTop: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div className="flex gap-3">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleFinishEarly}
                  disabled={isBusy || questionHistory.length === 0}
                >
                  Finish Early
                </button>
                {!answer.trim() && !isBusy && (
                  <button className="btn btn-ghost btn-sm" onClick={handleSkip}>
                    Skip Question ⏭
                  </button>
                )}
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isBusy || isLoading}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Evaluating…
                  </>
                ) : (
                  'Submit Answer →'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Feedback Panel ── */}
        {showFeedback && evaluation && (
          <div className="feedback-panel animate-slide-up">
            {/* Header */}
            <div className="feedback-header">
              <div className="flex items-center gap-4">
                <ScoreBadge score={evaluation.score} />
                <div>
                  <div>
                    {(() => {
                      const vc = getVerdictConfig(evaluation.verdict);
                      return (
                        <span className={`badge ${vc.color}`}>
                          {vc.icon} {evaluation.verdict}
                        </span>
                      );
                    })()}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Question {questionNumber} of {questionCount}
                  </div>
                </div>
              </div>

              <button
                className={`btn ${isLastQuestion ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleNextQuestion}
              >
                {isLastQuestion ? 'View Final Report →' : 'Next Question →'}
              </button>
            </div>

            {/* Body */}
            <div className="feedback-body">
              {/* Strengths */}
              {evaluation.strengths?.length > 0 && (
                <div>
                  <p className="section-title" style={{ marginBottom: 'var(--space-3)' }}>What You Got Right</p>
                  <FeedbackList items={evaluation.strengths} type="strength" />
                </div>
              )}

              {/* Issues */}
              {evaluation.issues?.length > 0 && (
                <div>
                  <p className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Areas to Improve</p>
                  <FeedbackList items={evaluation.issues} type="issue" />
                </div>
              )}

              {/* Ideal Answer */}
              {evaluation.ideal_answer && (
                <div>
                  <p className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Model Answer</p>
                  <div className="ideal-answer">{evaluation.ideal_answer}</div>
                </div>
              )}

              {/* Follow-up context */}
              {evaluation.follow_up_question && !isLastQuestion && (
                <div
                  style={{
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                  }}
                >
                  <p style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Next: Follow-up Question
                  </p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    {evaluation.follow_up_question}
                  </p>
                </div>
              )}

              {/* Your answer recap */}
              {answer && (
                <details style={{ cursor: 'pointer' }}>
                  <summary style={{ fontSize: '0.82rem', color: 'var(--text-muted)', userSelect: 'none', padding: '4px 0' }}>
                    Your answer (expand)
                  </summary>
                  <div
                    style={{
                      marginTop: 'var(--space-3)',
                      padding: 'var(--space-4)',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {answer}
                  </div>
                </details>
              )}

              {/* Navigation */}
              <div className="flex justify-end" style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
                <button
                  className={`btn ${isLastQuestion ? 'btn-primary' : 'btn-primary'}`}
                  onClick={handleNextQuestion}
                >
                  {isLastQuestion ? '🏁 View Final Report' : 'Continue →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
