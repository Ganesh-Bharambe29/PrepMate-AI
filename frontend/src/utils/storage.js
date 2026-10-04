/**
 * localStorage helpers — simple wrappers with JSON handling.
 * Used for saving interview history without a database.
 */

const PREFIX = 'prepmate_';

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn('localStorage write failed:', err);
  }
}

export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn('localStorage read failed:', err);
    return fallback;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (err) {
    console.warn('localStorage remove failed:', err);
  }
}

/**
 * Save a completed interview to the history array.
 */
export function saveInterviewToHistory(interviewData) {
  const history = loadFromStorage('history', []);
  const entry = {
    id: Date.now().toString(),
    completedAt: new Date().toISOString(),
    ...interviewData,
  };
  // Keep only the last 20 interviews
  const updated = [entry, ...history].slice(0, 20);
  saveToStorage('history', updated);
  return entry;
}

/**
 * Load interview history array.
 */
export function loadInterviewHistory() {
  return loadFromStorage('history', []);
}

/**
 * Format a date string for display.
 */
export function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
