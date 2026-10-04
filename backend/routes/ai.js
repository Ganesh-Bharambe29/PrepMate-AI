/**
 * AI Status routes
 * GET /api/ai/status
 */

const express = require('express');
const router = express.Router();
const { checkOllamaStatus } = require('../services/ollamaService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/ai/status
 * Check if Ollama is running and the configured model is available.
 */
router.get('/status', asyncHandler(async (req, res) => {
  const status = await checkOllamaStatus();

  // Return 503 if Ollama is down so the frontend can detect it easily
  if (!status.connected) {
    return res.status(503).json(status);
  }

  res.json(status);
}));

module.exports = router;
