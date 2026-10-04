/**
 * Interview Controller
 * Contains all business logic for the interview flow.
 * Calls ollamaService for AI inference and uses prompt templates.
 */

const { chatJSON } = require('../services/ollamaService');
const {
  buildSystemPrompt,
  buildQuestionPrompt,
  buildEvaluationPrompt,
  buildFollowUpPrompt,
  buildFinalReportPrompt,
} = require('../prompts/interviewerPrompts');

// Valid categories and difficulty levels for request validation
const VALID_CATEGORIES = [
  'Java',
  'Data Structures & Algorithms',
  'DBMS',
  'Computer Networks',
  'Operating Systems',
  'JavaScript',
  'React',
  'Full Stack Development',
];

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const DEFAULT_QUESTIONS = {
  Java: 'Explain the core principles of Object-Oriented Programming (OOP) in Java and how polymorphism is achieved.',
  'Data Structures & Algorithms': 'What is the difference between an Array and a Linked List, and when would you choose one over the other?',
  DBMS: 'What are the ACID properties in database management systems, and why are they important for transaction integrity?',
  'Computer Networks': 'Explain the difference between TCP and UDP protocols, and provide practical use cases for each.',
  'Operating Systems': 'What is the difference between a process and a thread, and how does the OS handle context switching?',
  JavaScript: 'Explain how closures work in JavaScript and provide an example of a practical use case.',
  React: 'What is the Virtual DOM in React, and how does the reconciliation process optimize UI rendering?',
  'Full Stack Development': 'Explain the lifecycle of an HTTP request from a client browser to a backend REST API and database, and back.',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateCategory(category) {
  return VALID_CATEGORIES.includes(category);
}

function validateDifficulty(difficulty) {
  return VALID_DIFFICULTIES.includes(difficulty);
}

/**
 * Build a fallback evaluation when JSON parsing from the model fails.
 * Returns a usable object instead of crashing.
 */
function buildFallbackEvaluation(rawText, question) {
  return {
    score: 6,
    verdict: 'Partially Correct',
    strengths: ['Your answer addressed the core question.'],
    issues: ['Consider expanding with more technical depth and specific examples.'],
    ideal_answer: 'A comprehensive answer clearly explains the underlying principles, advantages, trade-offs, and practical code examples.',
    follow_up_question: 'Can you provide a specific code or architectural example to illustrate your point?',
    follow_up_reason: 'Follow-up to test practical implementation knowledge.',
    should_continue: true,
    _fallback: true,
  };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/interview/start
 * Generate the first question for the interview.
 *
 * Body: { category, difficulty, totalQuestions, candidateName?, previousQuestions? }
 */
async function startInterview(req, res) {
  const { category, difficulty, totalQuestions, candidateName, previousQuestions = [] } = req.body;

  // Input validation
  if (!category || !validateCategory(category)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }
  if (!difficulty || !validateDifficulty(difficulty)) {
    return res.status(400).json({
      error: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
    });
  }
  if (!totalQuestions || totalQuestions < 1 || totalQuestions > 20) {
    return res.status(400).json({ error: 'totalQuestions must be between 1 and 20.' });
  }

  const systemPrompt = buildSystemPrompt(category, difficulty);
  const userPrompt = buildQuestionPrompt(category, difficulty, previousQuestions, 1, totalQuestions);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const result = await chatJSON(messages, { temperature: 0.7, maxTokens: 400 });
    return res.json({
      success: true,
      question: result.question || DEFAULT_QUESTIONS[category] || 'Could you explain the core concepts of ' + category + '?',
      topic: result.topic || category,
      questionNumber: 1,
      totalQuestions,
      category,
      difficulty,
      candidateName: candidateName || null,
    });
  } catch (err) {
    console.error('[startInterview] Failed to generate/parse question:', err.message);
    const fallbackQ = DEFAULT_QUESTIONS[category] || 'Could you explain a key concept in ' + category + '?';
    return res.json({
      success: true,
      question: fallbackQ,
      topic: category,
      questionNumber: 1,
      totalQuestions,
      category,
      difficulty,
      candidateName: candidateName || null,
      _fallback: true,
    });
  }
}

/**
 * POST /api/interview/evaluate
 * Evaluate the candidate's answer to the current question.
 *
 * Body: { category, difficulty, question, answer, questionNumber, totalQuestions }
 */
async function evaluateAnswer(req, res) {
  const { category, difficulty, question, answer, questionNumber, totalQuestions } = req.body;

  if (!category || !validateCategory(category)) {
    return res.status(400).json({ error: 'Invalid or missing category.' });
  }
  if (!difficulty || !validateDifficulty(difficulty)) {
    return res.status(400).json({ error: 'Invalid or missing difficulty.' });
  }
  if (!question) {
    return res.status(400).json({ error: 'question is required.' });
  }

  const systemPrompt = buildSystemPrompt(category, difficulty);
  const userPrompt = buildEvaluationPrompt(category, difficulty, question, answer || '');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  let evaluation;
  try {
    evaluation = await chatJSON(messages, { temperature: 0.2, maxTokens: 768 }); // Low temp for consistent evaluation
  } catch (err) {
    console.error('[evaluateAnswer] Evaluation failed/timed out, using safe fallback:', err.message);
    evaluation = buildFallbackEvaluation(err.message, question);
  }

  // Determine if there are more questions
  const isLastQuestion = questionNumber >= totalQuestions;

  return res.json({
    success: true,
    evaluation,
    questionNumber,
    totalQuestions,
    isLastQuestion,
  });
}

/**
 * POST /api/interview/follow-up
 * Generate a follow-up question based on the previous answer.
 *
 * Body: { category, difficulty, originalQuestion, candidateAnswer, followUpContext }
 */
async function generateFollowUp(req, res) {
  const { category, difficulty, originalQuestion, candidateAnswer, followUpContext } = req.body;

  if (!category || !difficulty || !originalQuestion) {
    return res.status(400).json({ error: 'category, difficulty, and originalQuestion are required.' });
  }

  const systemPrompt = buildSystemPrompt(category, difficulty);
  const userPrompt = buildFollowUpPrompt(
    category,
    difficulty,
    originalQuestion,
    candidateAnswer || '',
    followUpContext || 'Probe the candidate\'s understanding further.'
  );

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const result = await chatJSON(messages, { temperature: 0.6, maxTokens: 400 });
    return res.json({
      success: true,
      question: result.question,
      topic: result.topic,
    });
  } catch (err) {
    console.error('[generateFollowUp] JSON parse failed:', err.message);
    return res.json({
      success: true,
      question: followUpContext || 'Can you elaborate further on your previous answer?',
      topic: category,
      _fallback: true,
    });
  }
}

/**
 * POST /api/interview/final-report
 * Generate the complete final interview performance report.
 *
 * Body: { category, difficulty, candidateName, questionHistory }
 * questionHistory: Array of { question, answer, score, verdict, strengths, issues, ideal_answer }
 */
async function generateFinalReport(req, res) {
  const { category, difficulty, candidateName, questionHistory } = req.body;

  if (!category || !difficulty) {
    return res.status(400).json({ error: 'category and difficulty are required.' });
  }
  if (!Array.isArray(questionHistory) || questionHistory.length === 0) {
    return res.status(400).json({ error: 'questionHistory must be a non-empty array.' });
  }

  // Calculate stats from question history
  const totalScore = questionHistory.reduce((sum, q) => sum + (q.score || 0), 0);
  const averageScore = (totalScore / questionHistory.length).toFixed(1);

  const systemPrompt = buildSystemPrompt(category, difficulty);
  const userPrompt = buildFinalReportPrompt(category, difficulty, candidateName, questionHistory);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  let reportSummary;
  try {
    reportSummary = await chatJSON(messages, { temperature: 0.3, maxTokens: 800 });
  } catch (err) {
    console.error('[generateFinalReport] JSON parse failed, using fallback:', err.message);
    reportSummary = {
      overall_assessment: `The candidate completed ${questionHistory.length} technical interview questions in ${category} (${difficulty} level) with an average score of ${averageScore}/10.`,
      strong_areas: questionHistory.filter((q) => q.score >= 7).map((q) => q.topic || 'Core concepts'),
      weak_areas: questionHistory.filter((q) => q.score < 7).map((q) => q.topic || 'Advanced details'),
      recommended_topics: [category, 'System Design basics', 'Edge cases & performance'],
      performance_level: averageScore >= 7.5 ? 'Good' : averageScore >= 5 ? 'Average' : 'Needs Improvement',
      readiness: averageScore >= 7.5 ? 'Ready for interviews' : 'Needs more practice',
      encouragement: 'Great job completing the interview session! Consistent practice is the key to mastering technical interviews.',
      _fallback: true,
    };
  }

  return res.json({
    success: true,
    report: {
      ...reportSummary,
      averageScore: parseFloat(averageScore),
      totalQuestions: questionHistory.length,
      category,
      difficulty,
      candidateName: candidateName || 'Anonymous',
      completedAt: new Date().toISOString(),
    },
    questionHistory,
  });
}

module.exports = {
  startInterview,
  evaluateAnswer,
  generateFollowUp,
  generateFinalReport,
};
