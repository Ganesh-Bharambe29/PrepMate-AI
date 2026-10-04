/**
 * Interview Routes
 * Wires HTTP endpoints to interview controller functions.
 *
 * POST /api/interview/start        — Generate first question
 * POST /api/interview/evaluate     — Evaluate a candidate's answer
 * POST /api/interview/follow-up    — Generate a follow-up question
 * POST /api/interview/final-report — Generate the final performance report
 */

const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { asyncHandler } = require('../middleware/errorHandler');

router.post('/start', asyncHandler(interviewController.startInterview));
router.post('/evaluate', asyncHandler(interviewController.evaluateAnswer));
router.post('/follow-up', asyncHandler(interviewController.generateFollowUp));
router.post('/final-report', asyncHandler(interviewController.generateFinalReport));

module.exports = router;
