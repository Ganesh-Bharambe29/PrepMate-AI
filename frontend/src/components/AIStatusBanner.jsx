/**
 * AIStatusBanner — shown when Ollama is offline.
 * Gives the user a clear, actionable message.
 */

import { useAIStatus } from '../hooks/useAIStatus';

export default function AIStatusBanner() {
  const { connected, refresh } = useAIStatus();

  if (connected !== false) return null;

  return (
    <div className="alert alert-error animate-in" style={{ margin: '0 0 var(--space-5)' }}>
      <span>⚠️</span>
      <div style={{ flex: 1 }}>
        <strong>Ollama is not running.</strong> The AI interviewer requires Ollama to be active on your machine.
        <div style={{ marginTop: 4, fontSize: '0.8rem', opacity: 0.85 }}>
          Open a terminal and run: <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.2)', padding: '1px 6px', borderRadius: 4 }}>ollama serve</code>
        </div>
      </div>
      <button className="btn btn-sm" onClick={refresh} style={{ flexShrink: 0, color: 'var(--danger)', borderColor: 'rgba(248,113,113,0.3)', background: 'transparent' }}>
        Retry
      </button>
    </div>
  );
}
