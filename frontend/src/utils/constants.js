/**
 * Interview categories supported by PrepMate AI.
 * To add a new category: add an entry here — no other files need changing.
 */

export const CATEGORIES = [
  { id: 'Java',                         label: 'Java',                         icon: '☕' },
  { id: 'Data Structures & Algorithms', label: 'Data Structures & Algorithms', icon: '🌳' },
  { id: 'DBMS',                         label: 'DBMS',                         icon: '🗄️' },
  { id: 'Computer Networks',            label: 'Computer Networks',            icon: '🌐' },
  { id: 'Operating Systems',            label: 'Operating Systems',            icon: '⚙️' },
  { id: 'JavaScript',                   label: 'JavaScript',                   icon: '⚡' },
  { id: 'React',                        label: 'React',                        icon: '⚛️' },
  { id: 'Full Stack Development',       label: 'Full Stack Development',       icon: '🚀' },
];

export const DIFFICULTIES = [
  {
    id: 'Easy',
    label: 'Easy',
    description: 'Conceptual questions for beginners',
    color: 'badge-green',
  },
  {
    id: 'Medium',
    label: 'Medium',
    description: 'Scenario-based, trade-off questions',
    color: 'badge-yellow',
  },
  {
    id: 'Hard',
    label: 'Hard',
    description: 'Expert-level, deep-dive questions',
    color: 'badge-red',
  },
];

export const QUESTION_COUNTS = [5, 10, 15];

export const VERDICT_CONFIG = {
  'Excellent':         { color: 'badge-green',  icon: '✨' },
  'Mostly Correct':    { color: 'badge-green',  icon: '✅' },
  'Partially Correct': { color: 'badge-yellow', icon: '⚠️' },
  'Needs Improvement': { color: 'badge-yellow', icon: '📚' },
  'Incorrect':         { color: 'badge-red',    icon: '❌' },
  'No Answer':         { color: 'badge-gray',   icon: '⏭️' },
};

export const SCORE_COLOR = (score) => {
  if (score >= 8) return 'var(--success)';
  if (score >= 5) return 'var(--warning)';
  return 'var(--danger)';
};
