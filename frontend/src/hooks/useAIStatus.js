/**
 * useAIStatus hook
 * Polls the backend to check if Ollama is reachable.
 * Components read this to show the connection indicator.
 */

import { useState, useEffect, useCallback } from 'react';
import { checkAIStatus } from '../services/api';

export function useAIStatus(pollInterval = 30000) {
  const [status, setStatus] = useState({
    connected: null, // null = checking
    model: null,
    modelAvailable: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      const data = await checkAIStatus();
      setStatus({
        connected: data.connected,
        model: data.model,
        modelAvailable: data.modelAvailable,
        error: data.error || null,
      });
    } catch (err) {
      setStatus({
        connected: false,
        model: null,
        modelAvailable: false,
        error: 'Cannot reach AI service. Make sure Ollama is running.',
      });
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollInterval);
    return () => clearInterval(id);
  }, [refresh, pollInterval]);

  return { ...status, refresh };
}
