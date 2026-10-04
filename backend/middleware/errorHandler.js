/**
 * Global error handler middleware.
 * Formats errors consistently and hides internal details from the client.
 */

function errorHandler(err, req, res, next) {
  // Log the full error internally
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}:`, err.message);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // User-facing error messages — never expose stack traces or internal details
  let userMessage = 'An unexpected error occurred. Please try again.';

  if (statusCode === 400) {
    userMessage = err.message || 'Invalid request. Please check your input.';
  } else if (statusCode === 404) {
    userMessage = 'The requested resource was not found.';
  } else if (statusCode === 503) {
    userMessage = 'AI service is unavailable. Please make sure Ollama is running.';
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    userMessage = 'Cannot connect to Ollama. Please make sure Ollama is running on your machine.';
  } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
    userMessage = 'The AI took too long to respond. Please try again.';
  }

  res.status(statusCode).json({
    error: userMessage,
    // Only include error code in dev mode for debugging
    ...(process.env.NODE_ENV === 'development' && { code: err.code }),
  });
}

/**
 * Wrap async route handlers to avoid try/catch boilerplate in every controller.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, asyncHandler };
