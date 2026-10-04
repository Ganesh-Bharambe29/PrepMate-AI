/**
 * Ollama Service
 * Handles all communication with the local Ollama API.
 * Centralizes the HTTP calls so routes stay clean.
 */

const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b';

// Axios instance for Ollama requests
const ollamaClient = axios.create({
  baseURL: OLLAMA_BASE_URL,
  timeout: 120000, // 2 minutes — local inference can take time
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check if the Ollama service is running and the model is available.
 * @returns {{ connected: boolean, model: string, error?: string }}
 */
async function checkOllamaStatus() {
  try {
    const response = await ollamaClient.get('/api/tags', { timeout: 5000 });
    const models = response.data?.models || [];
    const modelAvailable = models.some(
      (m) => m.name === OLLAMA_MODEL || m.name.startsWith(OLLAMA_MODEL.split(':')[0])
    );

    return {
      connected: true,
      model: OLLAMA_MODEL,
      modelAvailable,
      availableModels: models.map((m) => m.name),
    };
  } catch (err) {
    return {
      connected: false,
      model: OLLAMA_MODEL,
      modelAvailable: false,
      error: 'Ollama is not reachable. Make sure Ollama is running.',
    };
  }
}

/**
 * Send a chat request to Ollama and return the assistant's message content.
 * @param {Array<{role: string, content: string}>} messages - Chat history
 * @param {object} options - Optional overrides
 * @returns {Promise<string>} - The raw text response from the model
 */
async function chat(messages, options = {}) {
  const payload = {
    model: options.model || OLLAMA_MODEL,
    messages,
    stream: false,
    think: options.think ?? false, // Disable reasoning token loops for instant responses
    format: options.format,
    options: {
      temperature: options.temperature ?? 0.7,
      num_predict: options.maxTokens ?? 512,
    },
  };

  const response = await ollamaClient.post('/api/chat', payload);

  const message = response.data?.message;
  // In reasoning models, content is in message.content (or message.thinking if content is empty)
  const content = message?.content || (message?.thinking ? message.thinking : '');
  if (!content || !content.trim()) {
    throw new Error('Ollama returned an empty response.');
  }

  return content;
}

/**
 * Send a chat request and attempt to parse the response as JSON.
 * Includes fallback extraction for when the model wraps JSON in markdown code blocks.
 * @param {Array} messages
 * @param {object} options
 * @returns {Promise<object>} - Parsed JSON object
 */
async function chatJSON(messages, options = {}) {
  const rawContent = await chat(messages, {
    ...options,
    format: 'json',
    think: options.think ?? false,
    maxTokens: options.maxTokens ?? 768,
  });
  return parseJSONResponse(rawContent);
}

/**
 * Robustly parse a JSON response from the model.
 * Handles cases where the model wraps JSON in ```json ... ``` blocks or contains <think> tags.
 * @param {string} rawText
 * @returns {object}
 */
function parseJSONResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response received for JSON parsing');
  }

  // 1. Strip thinking tags if present
  let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (_) { /* continue */ }

  // 3. Try extracting from markdown code block: ```json { ... } ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (_) { /* continue */ }
  }

  // 4. Try finding first { ... } in the text
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0].trim());
    } catch (_) { /* continue */ }
  }

  // 5. If all fails, throw a structured error with the raw content so callers can handle it
  throw new Error(`Failed to parse JSON from model response. Raw content: ${cleaned.slice(0, 500)}`);
}

module.exports = {
  checkOllamaStatus,
  chat,
  chatJSON,
  parseJSONResponse,
  OLLAMA_MODEL,
};
