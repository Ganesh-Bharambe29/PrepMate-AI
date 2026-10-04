/**
 * API Service
 * Centralizes all HTTP calls to the Express backend.
 * Components never call fetch/axios directly — they use this service.
 */

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 180000, // 3 minutes — local LLM inference can be slow
  headers: { 'Content-Type': 'application/json' },
});

// ─── Response interceptor: normalize errors ───────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// ─── Health ───────────────────────────────────────────────

export const checkHealth = () => api.get('/health').then((r) => r.data);

// ─── AI Status ────────────────────────────────────────────

export const checkAIStatus = () => api.get('/ai/status').then((r) => r.data);

// ─── Interview ────────────────────────────────────────────

/**
 * Start a new interview and get the first question.
 */
export const startInterview = (payload) =>
  api.post('/interview/start', payload).then((r) => r.data);

/**
 * Submit an answer for AI evaluation.
 */
export const evaluateAnswer = (payload) =>
  api.post('/interview/evaluate', payload).then((r) => r.data);

/**
 * Generate a follow-up question based on the previous answer.
 */
export const generateFollowUp = (payload) =>
  api.post('/interview/follow-up', payload).then((r) => r.data);

/**
 * Generate the final interview report.
 */
export const generateFinalReport = (payload) =>
  api.post('/interview/final-report', payload).then((r) => r.data);

export default api;
