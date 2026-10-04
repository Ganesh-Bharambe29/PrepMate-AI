/**
 * LandingPage — Modern, high-performance landing page for PrepMate AI.
 * Standalone AI interview platform with interactive hero simulation,
 * category deep-dives, step workflows, and developer-focused dark aesthetic.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AIStatusBanner from '../components/AIStatusBanner';
import { useAIStatus } from '../hooks/useAIStatus';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/constants';

// Interactive interview simulation scenarios
const SIMULATION_SCENARIOS = [
  {
    id: 'java',
    category: 'Java & Backend',
    icon: '☕',
    difficulty: 'Medium',
    aiQuestion: 'Can you explain the difference between JVM Heap and Stack memory, and how Java manages object lifecycle?',
    candidateAnswer: 'Stack memory stores method call frames and primitive local variables in LIFO order. Heap stores dynamic objects. Garbage collection runs in the Heap to reclaim unreferenced memory using generational collectors like G1.',
    aiFeedback: {
      score: '9.4',
      verdict: 'Excellent Response',
      highlight: 'Clear distinction between stack frames and heap objects with accurate mention of generational GC.',
      followUp: 'Follow-up: How do weak references interact with the young generation scavenge cycle?',
    },
  },
  {
    id: 'dsa',
    category: 'DSA & Algorithms',
    icon: '🌳',
    difficulty: 'Hard',
    aiQuestion: 'How would you detect and locate the start node of a cycle in a singly linked list with O(1) extra space?',
    candidateAnswer: 'I would use Floyd’s Tortoise and Hare algorithm. Initialize slow and fast pointers. If they meet, reset slow to head and advance both one step at a time until they meet at the cycle entry.',
    aiFeedback: {
      score: '9.8',
      verdict: 'Optimal Solution',
      highlight: 'Correct time complexity O(N) and space complexity O(1) with mathematical pointer phase explanation.',
      followUp: 'Follow-up: Why is the distance from head to entry equal to the distance from meeting point to entry?',
    },
  },
  {
    id: 'react',
    category: 'React & Frontend',
    icon: '⚛️',
    difficulty: 'Medium',
    aiQuestion: 'What problems does React’s reconciliation algorithm solve, and when should you use useMemo vs useCallback?',
    candidateAnswer: 'Reconciliation uses virtual DOM diffing with O(N) heuristic keys to minimize actual browser DOM mutations. useMemo caches computed values, while useCallback caches function definitions across re-renders.',
    aiFeedback: {
      score: '9.2',
      verdict: 'Strong Concept',
      highlight: 'Accurate explanation of dependency arrays and render-cycle memoization trade-offs.',
      followUp: 'Follow-up: Under what conditions can over-memoization actually degrade rendering performance?',
    },
  },
  {
    id: 'networks',
    category: 'Computer Networks',
    icon: '🌐',
    difficulty: 'Medium',
    aiQuestion: 'Explain what happens during the TCP 3-Way Handshake and why HTTP/3 moved to UDP-based QUIC.',
    candidateAnswer: 'TCP handshake exchanges SYN, SYN-ACK, and ACK to sync sequence numbers. HTTP/3 uses QUIC over UDP to eliminate Head-of-Line blocking and enable zero-RTT connection resumption.',
    aiFeedback: {
      score: '9.6',
      verdict: 'Excellent Insight',
      highlight: 'Spot-on description of TCP sequence establishment and HOL blocking resolution in QUIC.',
      followUp: 'Follow-up: How does QUIC handle packet loss without stalling other multiplexed streams?',
    },
  },
];

const VALUE_PROPS = [
  {
    icon: '🔒',
    tag: '100% PRIVATE',
    title: 'Local AI Powered',
    desc: 'Runs on your own machine via Ollama and Qwen3. Your voice, thoughts, and interview transcripts never touch proprietary third-party servers.',
  },
  {
    icon: '⚡',
    tag: 'ON DEMAND',
    title: 'Always Ready 24/7',
    desc: 'Practice whenever inspiration strikes without waiting on peer schedules, expensive coaching fees, or interview queue times.',
  },
  {
    icon: '🎯',
    tag: 'ADAPTIVE',
    title: 'Realistic Conversation',
    desc: 'Experience dynamic, adaptive technical dialogue with intelligent follow-up questions instead of generic static multiple-choice quizzes.',
  },
  {
    icon: '📊',
    tag: 'ACTIONABLE',
    title: 'Honest Unbiased Feedback',
    desc: 'Receive granular scoring across conceptual clarity, trade-off understanding, ideal model answers, and targeted revision tips.',
  },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    label: 'Custom Setup',
    title: 'Choose Your Domain & Level',
    desc: 'Pick from Java, DSA, React, DBMS, Networks, or Full Stack. Tailor the difficulty from foundational concepts to architect-level deep dives.',
    badge: '30s Setup',
  },
  {
    step: '02',
    label: 'Live Simulation',
    title: 'Converse with Local AI',
    desc: 'Answer realistic technical questions one by one. The AI listens, evaluates your specific arguments, and poses context-aware follow-ups.',
    badge: 'Real-time AI',
  },
  {
    step: '03',
    label: 'Deep Analytics',
    title: 'Review Score & Model Answers',
    desc: 'Inspect granular strengths, spot hidden knowledge gaps, study benchmark answers, and track your interview trajectory over time.',
    badge: 'Instant Report',
  },
];

export default function LandingPage() {
  const { connected, model } = useAIStatus();
  const { isAuthenticated } = useAuth();
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(true);

  const currentScenario = SIMULATION_SCENARIOS[activeScenarioIdx];

  const handleScenarioChange = (idx) => {
    if (idx === activeScenarioIdx) return;
    setIsTyping(true);
    setShowFeedback(false);
    setActiveScenarioIdx(idx);

    setTimeout(() => {
      setIsTyping(false);
      setShowFeedback(true);
    }, 450);
  };

  return (
    <main className="landing-page">
      {/* Background ambient light effects */}
      <div className="landing-bg-glow-top" />
      <div className="landing-bg-glow-right" />

      <div className="container">
        {/* Ollama Connection status alert if offline */}
        <AIStatusBanner />

        {/* ══════════════════════════════════════════════════
            HERO SECTION
            ══════════════════════════════════════════════════ */}
        <section className="hero-section">
          <div className="hero-badge-pill animate-in">
            <span className="hero-badge-pulse" />
            <span className="hero-badge-text">
              {connected ? `⚡ Powered by Local ${model || 'Qwen3'} · Ollama Runtime` : '⚡ Private Local AI Interview Engine'}
            </span>
          </div>

          <h1 className="hero-headline animate-in">
            Your Personal AI Interview Partner.<br />
            <span className="hero-headline-gradient">Practice. Improve. Get Hired.</span>
          </h1>

          <p className="hero-subtext animate-in">
            Master software engineering interviews with an intelligent, open-weight AI that asks realistic questions,
            evaluates your answers in real-time, and provides honest technical feedback — running 100% locally on your machine.
          </p>

          <div className="hero-actions-row animate-in">
            <Link to="/setup" className="btn btn-primary btn-lg hero-cta-primary">
              <span>Start Practice Interview</span>
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg hero-cta-secondary">
              <span>{isAuthenticated ? '📊 View Dashboard' : '📊 Access Dashboard'}</span>
            </Link>
            <a href="#how-it-works" className="btn btn-ghost btn-lg hero-cta-ghost">
              How It Works
            </a>
          </div>

          {/* Quick Metrics Strip */}
          <div className="hero-metrics-strip animate-in">
            <div className="metric-item">
              <span className="metric-icon">🔒</span>
              <span className="metric-text"><strong>100% Private</strong> Zero cloud leaks</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-icon">⚡</span>
              <span className="metric-text"><strong>0ms Cloud Latency</strong> Runs via Ollama</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-icon">🎯</span>
              <span className="metric-text"><strong>8+ Technical Tracks</strong> Core CS & Full Stack</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-icon">📈</span>
              <span className="metric-text"><strong>Instant Feedback</strong> Score + Ideal Answers</span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              INTERACTIVE AI INTERVIEW SIMULATION PANEL
              ══════════════════════════════════════════════════ */}
          <div className="simulation-wrapper animate-slide-up">
            <div className="simulation-card">
              {/* Simulation Card Top Bar */}
              <div className="simulation-topbar">
                <div className="sim-window-controls">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                  <span className="sim-window-title">prepmate-live-session.ai</span>
                </div>

                <div className="sim-category-selector">
                  {SIMULATION_SCENARIOS.map((scenario, idx) => (
                    <button
                      key={scenario.id}
                      type="button"
                      className={`sim-cat-tab ${activeScenarioIdx === idx ? 'active' : ''}`}
                      onClick={() => handleScenarioChange(idx)}
                    >
                      <span>{scenario.icon}</span>
                      <span className="tab-label">{scenario.category.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>

                <div className="sim-status-chip">
                  <span className="sim-live-pulse" />
                  <span className="sim-status-label">LIVE MOCK</span>
                </div>
              </div>

              {/* Simulation Conversation Body */}
              <div className="simulation-body">
                {/* AI Interviewer Message */}
                <div className="sim-message ai-message">
                  <div className="sim-avatar ai-avatar">
                    <span>🤖</span>
                  </div>
                  <div className="sim-bubble-wrapper">
                    <div className="sim-speaker-row">
                      <span className="speaker-name">AI Interviewer</span>
                      <span className="speaker-role">Technical Lead · {currentScenario.difficulty}</span>
                      <div className="audio-wave-anim">
                        <span className="wave-bar" />
                        <span className="wave-bar" />
                        <span className="wave-bar" />
                        <span className="wave-bar" />
                      </div>
                    </div>
                    <div className="sim-bubble ai-bubble">
                      <p className="sim-text">{currentScenario.aiQuestion}</p>
                    </div>
                  </div>
                </div>

                {/* Candidate Response Bubble */}
                <div className="sim-message candidate-message">
                  <div className="sim-avatar candidate-avatar">
                    <span>👤</span>
                  </div>
                  <div className="sim-bubble-wrapper">
                    <div className="sim-speaker-row candidate-row">
                      <span className="speaker-name">Candidate</span>
                      <span className="speaker-role">You</span>
                    </div>
                    <div className="sim-bubble candidate-bubble">
                      <p className="sim-text">{currentScenario.candidateAnswer}</p>
                    </div>
                  </div>
                </div>

                {/* Live AI Feedback / Score Panel */}
                {isTyping ? (
                  <div className="sim-typing-box animate-in">
                    <div className="typing-dots">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      AI is evaluating answer depth, accuracy, and trade-offs…
                    </span>
                  </div>
                ) : showFeedback ? (
                  <div className="sim-feedback-card animate-in">
                    <div className="sim-feedback-header">
                      <div className="flex items-center gap-2">
                        <span className="feedback-badge-icon">✨</span>
                        <span className="feedback-heading">AI Evaluation & Score</span>
                      </div>
                      <div className="sim-score-pill">
                        <span className="score-num">{currentScenario.aiFeedback.score}</span>
                        <span className="score-denom">/ 10</span>
                        <span className="score-verdict">{currentScenario.aiFeedback.verdict}</span>
                      </div>
                    </div>

                    <p className="sim-feedback-highlight">
                      <strong>Key Strength:</strong> {currentScenario.aiFeedback.highlight}
                    </p>

                    <div className="sim-followup-box">
                      <span className="followup-tag">Follow-up Probe:</span>
                      <span className="followup-text">{currentScenario.aiFeedback.followUp}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Simulation Card Bottom Action Footer */}
              <div className="simulation-footer">
                <div className="sim-footer-meta">
                  <span>💡 Try interacting with categories above or start your own custom session</span>
                </div>
                <Link to="/setup" className="btn btn-primary btn-sm sim-practice-now-btn">
                  Practice This Category →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 1 — HOW IT WORKS
            ══════════════════════════════════════════════════ */}
        <section id="how-it-works" className="landing-section">
          <div className="section-header-center">
            <span className="section-eyebrow">SIMPLE 3-STEP WORKFLOW</span>
            <h2 className="section-main-title">How PrepMate AI Works</h2>
            <p className="section-subtitle">
              From category selection to conversational practice and deep performance analytics in seconds.
            </p>
          </div>

          <div className="workflow-grid">
            {WORKFLOW_STEPS.map((stepItem, idx) => (
              <div key={stepItem.step} className="workflow-card">
                <div className="workflow-step-num-wrapper">
                  <span className="workflow-step-num">{stepItem.step}</span>
                  <span className="workflow-badge">{stepItem.badge}</span>
                </div>
                <div className="workflow-content">
                  <span className="workflow-label">{stepItem.label}</span>
                  <h3 className="workflow-title">{stepItem.title}</h3>
                  <p className="workflow-desc">{stepItem.desc}</p>
                </div>
                {idx < 2 && <div className="workflow-connector-line" />}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — INTERVIEW MODES & CATEGORIES
            ══════════════════════════════════════════════════ */}
        <section className="landing-section">
          <div className="section-header-center">
            <span className="section-eyebrow">SUPPORTED TRACKS</span>
            <h2 className="section-main-title">Practice Any Technical Domain</h2>
            <p className="section-subtitle">
              Choose your focus area. Each track features domain-specific questions tailored to standard engineering hiring bars.
            </p>
          </div>

          <div className="category-cards-grid">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="category-showcase-card">
                <div className="cat-card-top">
                  <div className="cat-icon-circle">{cat.icon}</div>
                  <span className="cat-level-badge">Easy · Med · Hard</span>
                </div>

                <h3 className="cat-title">{cat.label}</h3>
                <p className="cat-desc">
                  {cat.id === 'Java' && 'Core OOP, concurrency, JVM internals, memory model, and Spring ecosystem.'}
                  {cat.id === 'Data Structures & Algorithms' && 'Trees, graphs, dynamic programming, heaps, and algorithmic complexity.'}
                  {cat.id === 'DBMS' && 'ACID properties, indexing strategies, normalization, query optimization, and SQL.'}
                  {cat.id === 'Computer Networks' && 'TCP/IP, HTTP/2/3, WebSockets, DNS routing, and socket lifecycle.'}
                  {cat.id === 'Operating Systems' && 'Process scheduling, threads, memory paging, deadlocks, and IPC mechanisms.'}
                  {cat.id === 'JavaScript' && 'Event loop, prototypes, closures, async/await, and modern ES2024 features.'}
                  {cat.id === 'React' && 'Component lifecycle, hooks, state patterns, reconciliation, and performance tuning.'}
                  {cat.id === 'Full Stack Development' && 'System architecture, API design, security, scalability, and microservices.'}
                </p>

                <div className="cat-card-footer">
                  <Link to="/setup" className="cat-launch-link">
                    Start Mock Session <span className="arrow">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 3 — WHY PREPMATE AI
            ══════════════════════════════════════════════════ */}
        <section className="landing-section">
          <div className="section-header-center">
            <span className="section-eyebrow">THE LOCAL ADVANTAGE</span>
            <h2 className="section-main-title">Why Developers Choose PrepMate AI</h2>
            <p className="section-subtitle">
              Engineered for realistic interview preparation without subscriptions, data tracking, or cloud latency.
            </p>
          </div>

          <div className="value-props-grid">
            {VALUE_PROPS.map((prop) => (
              <div key={prop.title} className="value-card">
                <div className="value-icon-wrapper">
                  <span className="value-icon">{prop.icon}</span>
                </div>
                <span className="value-tag">{prop.tag}</span>
                <h3 className="value-title">{prop.title}</h3>
                <p className="value-desc">{prop.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 4 — LOCAL ARCHITECTURE & TERMINAL
            ══════════════════════════════════════════════════ */}
        <section className="landing-section">
          <div className="tech-spotlight-card">
            <div className="tech-spotlight-left">
              <span className="tech-badge">ZERO CLOUD LOCK-IN</span>
              <h2 className="tech-headline">Private by Design. Powered by Ollama.</h2>
              <p className="tech-description">
                PrepMate AI pairs with open-weight models like Qwen3 4B running on your local machine.
                You get all the intelligence of modern conversational LLMs with zero API billing, zero rate limits,
                and absolute privacy.
              </p>

              <div className="tech-checklist">
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <span>No OpenAI / Claude API keys required</span>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <span>Unlimited practice sessions with zero monthly subscription</span>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <span>Completely private — conversations stay on your local disk</span>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <span>Customizable model weights and difficulty parameters</span>
                </div>
              </div>

              <div className="tech-cta-group">
                <Link to="/setup" className="btn btn-primary">
                  Launch Local Session →
                </Link>
                <Link to="/dashboard" className="btn btn-secondary">
                  View Past History
                </Link>
              </div>
            </div>

            <div className="tech-spotlight-right">
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="term-dots">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                  </div>
                  <span className="term-title">terminal — ollama</span>
                </div>
                <div className="terminal-body">
                  <div className="term-line">
                    <span className="term-prompt">$</span> ollama run qwen3:4b
                  </div>
                  <div className="term-output text-dim">
                    pulling manifest...<br />
                    verifying sha256 digest...<br />
                    writing model layers... done.<br />
                    <span className="text-success">success: model loaded in VRAM (3.8 GB)</span>
                  </div>
                  <div className="term-line" style={{ marginTop: 'var(--space-3)' }}>
                    <span className="term-prompt">$</span> npm run dev
                  </div>
                  <div className="term-output">
                    <span className="text-accent">🚀 PrepMate AI backend listening on port 5000</span><br />
                    <span className="text-dim">📡 Local Ollama connected at http://localhost:11434</span><br />
                    <span className="text-success">✨ Ready for technical practice sessions.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 5 — FINAL CALL TO ACTION
            ══════════════════════════════════════════════════ */}
        <section className="final-cta-section">
          <div className="final-cta-card">
            <div className="final-cta-glow" />
            <div className="final-cta-content">
              <span className="final-cta-tag">GET READY FOR YOUR DREAM ROLE</span>
              <h2 className="final-cta-title">Ready for your next technical interview?</h2>
              <p className="final-cta-subtext">
                Start practicing immediately. Pick your topic, answer challenging questions, and sharpen your technical communication skills.
              </p>

              <div className="final-cta-buttons">
                <Link to="/setup" className="btn btn-primary btn-lg final-btn-start">
                  Start Practicing →
                </Link>
                <Link to="/dashboard" className="btn btn-secondary btn-lg">
                  {isAuthenticated ? 'View Dashboard' : 'Explore Dashboard'}
                </Link>
              </div>

              <div className="final-cta-status">
                <div className={`status-dot ${connected === true ? 'online' : connected === false ? 'offline' : 'checking'}`} />
                <span>
                  {connected === true
                    ? `AI Engine (${model || 'Qwen3'}) is connected and ready.`
                    : connected === false
                    ? 'Local Ollama is currently offline — start Ollama to begin.'
                    : 'Checking local AI engine status…'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FOOTER
            ══════════════════════════════════════════════════ */}
        <footer className="landing-footer">
          <div className="footer-top">
            <div className="footer-brand-col">
              <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: '1.4rem' }}>🎯</span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>PrepMate AI</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: 1.6 }}>
                Your private, local AI interviewer. Practice technical mock interviews and sharpen your engineering fundamentals with zero data leaks.
              </p>
            </div>

            <div className="footer-links-col">
              <span className="footer-col-title">Navigation</span>
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/setup" className="footer-link">Start Practice</Link>
              <Link to="/dashboard" className="footer-link">Dashboard</Link>
              <Link to="/login" className="footer-link">Sign In</Link>
              <Link to="/signup" className="footer-link">Create Account</Link>
            </div>

            <div className="footer-links-col">
              <span className="footer-col-title">Interview Topics</span>
              <Link to="/setup" className="footer-link">Java & Spring</Link>
              <Link to="/setup" className="footer-link">DSA & Algorithms</Link>
              <Link to="/setup" className="footer-link">React & Frontend</Link>
              <Link to="/setup" className="footer-link">Computer Networks</Link>
              <Link to="/setup" className="footer-link">DBMS & SQL</Link>
            </div>

            <div className="footer-links-col">
              <span className="footer-col-title">Privacy & Architecture</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Powered by Ollama open weights.<br />
                All interview conversations, evaluations, and metrics remain 100% on your local device.
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} PrepMate AI. All rights reserved. Private local AI mock interview engine.
            </div>
            <div className="flex gap-4">
              <Link to="/setup" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Practice Now
              </Link>
              <Link to="/dashboard" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Dashboard
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
