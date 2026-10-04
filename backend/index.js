/**
 * PrepMate AI - Backend Entry Point
 * Express server that connects the React frontend to the local Ollama instance.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health');
const aiRoutes = require('./routes/ai');
const interviewRoutes = require('./routes/interview');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Middleware ───────────────────────────────────────────────────────────────

const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for development/deployed testing
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api', healthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/interview', interviewRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 PrepMate AI backend running on http://localhost:${PORT}`);
  console.log(`📡 Connecting to Ollama at: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
  console.log(`🤖 Model: ${process.env.OLLAMA_MODEL || 'qwen3:4b'}`);
  console.log(`🌐 CORS allowed for: ${FRONTEND_URL}\n`);
});

module.exports = app;
