/**
 * Interviewer Prompt Templates
 * All AI prompts are centralized here for easy adjustment.
 * Changing the interview behavior = changing these templates.
 */

// ─── Category Descriptions ────────────────────────────────────────────────────

const CATEGORY_CONTEXT = {
  Java: 'Core Java, OOP principles, JVM internals, collections, multithreading, Spring Framework basics, Java memory model, and Java best practices.',
  'Data Structures & Algorithms': 'Arrays, linked lists, stacks, queues, trees, graphs, sorting algorithms, searching algorithms, dynamic programming, recursion, time and space complexity analysis.',
  DBMS: 'Relational databases, SQL queries, normalization, ACID properties, indexing, transactions, joins, stored procedures, NoSQL concepts, and database design.',
  'Computer Networks': 'OSI model, TCP/IP stack, HTTP/HTTPS, DNS, routing, switching, subnetting, network security basics, load balancing, and common networking protocols.',
  'Operating Systems': 'Process management, threads, deadlocks, memory management, virtual memory, file systems, scheduling algorithms, semaphores, and OS design concepts.',
  JavaScript: 'Core JavaScript, ES6+ features, closures, prototypes, async/await, promises, event loop, DOM manipulation, and JavaScript design patterns.',
  React: 'React components, hooks (useState, useEffect, useContext, useReducer), state management, component lifecycle, props, virtual DOM, React Router, and performance optimization.',
  'Full Stack Development': 'Frontend and backend integration, REST API design, authentication, session management, database interaction, deployment basics, and full-stack architecture patterns.',
};

// ─── Difficulty Instructions ──────────────────────────────────────────────────

const DIFFICULTY_INSTRUCTIONS = {
  Easy: 'Ask straightforward conceptual questions suitable for junior candidates or beginners. Focus on definitions, basic concepts, and simple examples. Avoid complex edge cases.',
  Medium: 'Ask questions that require a solid understanding of the topic. Include scenario-based questions, comparison questions, and questions about trade-offs. Suitable for mid-level candidates.',
  Hard: 'Ask advanced, deep-dive questions that test expert-level knowledge. Include edge cases, system design considerations, performance implications, and questions requiring synthesis of multiple concepts.',
};

// ─── System Prompt ────────────────────────────────────────────────────────────

/**
 * Build the system prompt that defines the AI interviewer's persona and rules.
 */
function buildSystemPrompt(category, difficulty) {
  return `You are a professional and experienced technical interviewer at a top software company.

Your role is to conduct a realistic technical interview in the subject: ${category}.
Topic coverage: ${CATEGORY_CONTEXT[category] || category}

Difficulty level: ${difficulty}
${DIFFICULTY_INSTRUCTIONS[difficulty] || DIFFICULTY_INSTRUCTIONS.Medium}

BEHAVIORAL RULES:
- Ask exactly ONE question at a time. Never ask multiple questions in a single response.
- Stay strictly focused on the ${category} subject.
- Do NOT repeat questions already asked in this session.
- Be honest in your evaluation. Do NOT praise incorrect or incomplete answers.
- Distinguish clearly between: Correct, Mostly Correct, Partially Correct, and Incorrect answers.
- Keep your responses concise and professional. Avoid unnecessary verbosity.
- Do NOT reveal your chain of thought, internal reasoning, or meta-commentary.
- Respond ONLY with valid JSON when asked for structured output.
- Never break character — you are always the interviewer.

EVALUATION PHILOSOPHY:
- A score of 9-10 means the candidate's answer is comprehensive and accurate.
- A score of 7-8 means the answer is correct but missing some important details.
- A score of 5-6 means the answer is partially correct or conceptually on the right track but incomplete.
- A score of 3-4 means the answer has some relevant content but significant errors or gaps.
- A score of 1-2 means the answer is mostly incorrect or demonstrates a fundamental misunderstanding.
- A score of 0 means no answer was provided or the answer is completely wrong.`;
}

// ─── Question Prompt ──────────────────────────────────────────────────────────

/**
 * Build prompt to generate the next interview question.
 * @param {string} category
 * @param {string} difficulty
 * @param {string[]} previousQuestions - Questions already asked (to avoid repeats)
 * @param {number} questionNumber - Current question number
 * @param {number} totalQuestions - Total questions in the interview
 */
function buildQuestionPrompt(category, difficulty, previousQuestions, questionNumber, totalQuestions) {
  const avoidSection = previousQuestions.length > 0
    ? `\n\nQUESTIONS ALREADY ASKED (do NOT repeat these or closely related topics):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  return `Generate interview question #${questionNumber} of ${totalQuestions} for a ${difficulty} difficulty ${category} interview.

${avoidSection}

Respond with ONLY a valid JSON object in this exact format:
{
  "question": "Your interview question here",
  "topic": "Specific topic this question tests (e.g. 'HashMap internals', 'Binary Search Tree')",
  "hint": "A brief hint the interviewer has in mind (for internal use, not shown to candidate)"
}

The question should be clear, specific, and appropriately challenging for the ${difficulty} level. Do not add any text outside the JSON.`;
}

// ─── Evaluation Prompt ────────────────────────────────────────────────────────

/**
 * Build prompt to evaluate the candidate's answer.
 * @param {string} category
 * @param {string} difficulty
 * @param {string} question - The question that was asked
 * @param {string} candidateAnswer - What the user typed
 */
function buildEvaluationPrompt(category, difficulty, question, candidateAnswer) {
  const answerSection = candidateAnswer.trim()
    ? `CANDIDATE'S ANSWER:\n"${candidateAnswer.trim()}"`
    : 'CANDIDATE\'S ANSWER: (No answer provided — candidate skipped this question)';

  return `You are evaluating a candidate's answer in a ${difficulty} ${category} technical interview.

INTERVIEW QUESTION:
"${question}"

${answerSection}

Evaluate the answer thoroughly and respond with ONLY a valid JSON object in this exact format:
{
  "score": <integer from 0 to 10>,
  "verdict": "<one of: 'Excellent', 'Mostly Correct', 'Partially Correct', 'Needs Improvement', 'Incorrect', 'No Answer'>",
  "strengths": [<list of specific things the candidate got right — empty array if none>],
  "issues": [<list of specific mistakes, gaps, or misconceptions — empty array if none>],
  "ideal_answer": "<A concise, accurate model answer that a strong candidate would give>",
  "follow_up_question": "<A relevant follow-up question based on this answer to probe deeper or address a gap>",
  "follow_up_reason": "<Brief explanation of why this follow-up is relevant>",
  "should_continue": true
}

Be honest, specific, and constructive. Do not add any text outside the JSON.`;
}

// ─── Follow-up Question Prompt ────────────────────────────────────────────────

/**
 * Build prompt for a follow-up question based on prior answer.
 * @param {string} category
 * @param {string} difficulty
 * @param {string} originalQuestion
 * @param {string} candidateAnswer
 * @param {string} followUpContext - The follow_up_question from evaluation
 */
function buildFollowUpPrompt(category, difficulty, originalQuestion, candidateAnswer, followUpContext) {
  return `You are conducting a follow-up in a ${difficulty} ${category} technical interview.

ORIGINAL QUESTION: "${originalQuestion}"
CANDIDATE'S ANSWER: "${candidateAnswer}"
FOLLOW-UP CONTEXT: "${followUpContext}"

Generate a specific follow-up question that probes the candidate's understanding further.
Respond with ONLY a valid JSON object:
{
  "question": "Your follow-up question here",
  "topic": "Specific topic this tests"
}

Do not add any text outside the JSON.`;
}

// ─── Final Report Prompt ──────────────────────────────────────────────────────

/**
 * Build prompt to generate the final interview summary.
 * @param {string} category
 * @param {string} difficulty
 * @param {string} candidateName
 * @param {Array} questionHistory - Array of { question, answer, score, verdict }
 */
function buildFinalReportPrompt(category, difficulty, candidateName, questionHistory) {
  const questionsText = questionHistory
    .map((item, i) =>
      `Q${i + 1}: ${item.question}\nAnswer: ${item.answer || '(No answer)'}\nScore: ${item.score}/10 — ${item.verdict}`
    )
    .join('\n\n');

  const averageScore =
    questionHistory.length > 0
      ? (questionHistory.reduce((sum, q) => sum + (q.score || 0), 0) / questionHistory.length).toFixed(1)
      : 0;

  return `You are generating a final performance report for a ${difficulty} ${category} interview.

${candidateName ? `Candidate: ${candidateName}` : 'Candidate: Anonymous'}
Questions attempted: ${questionHistory.length}
Average score: ${averageScore}/10

COMPLETE INTERVIEW TRANSCRIPT:
${questionsText}

Generate a professional performance summary. Respond with ONLY a valid JSON object:
{
  "overall_assessment": "<2-3 sentence professional summary of the candidate's performance>",
  "strong_areas": [<list of specific topics/concepts the candidate demonstrated good knowledge of>],
  "weak_areas": [<list of specific topics/concepts that need improvement>],
  "recommended_topics": [<list of specific topics to study, directly relevant to gaps shown>],
  "performance_level": "<one of: 'Excellent', 'Good', 'Average', 'Needs Improvement', 'Poor'>",
  "readiness": "<one of: 'Ready for senior roles', 'Ready for mid-level roles', 'Ready for junior roles', 'Needs more preparation'>",
  "encouragement": "<A short, honest, motivating closing message for the candidate>"
}

Base all fields strictly on the actual answers given. Do not add any text outside the JSON.`;
}

module.exports = {
  buildSystemPrompt,
  buildQuestionPrompt,
  buildEvaluationPrompt,
  buildFollowUpPrompt,
  buildFinalReportPrompt,
  CATEGORY_CONTEXT,
  DIFFICULTY_INSTRUCTIONS,
};
