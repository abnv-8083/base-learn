const logger = require('../utils/logger');

// ── 404 Not Found handler ────────────────────────────────────────────────────
// Register AFTER all routes: app.use(notFound);
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

// ── Global error handler ─────────────────────────────────────────────────────
// Register LAST: app.use(errorHandler);
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'An unexpected error occurred';
  let errors = null;

  // ── Mongoose Bad ObjectId (CastError) ──
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found — invalid ID format';
  }

  // ── Mongoose Duplicate Key ──
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  // ── Mongoose Validation Error ──
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );
  }

  // ── JWT errors ──
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token — please log in again';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired — please log in again';
  }

  // ── Zod Validation (legacy) ──
  try {
    const { ZodError } = require('zod');
    if (err instanceof ZodError) {
      statusCode = 422;
      message = 'Validation Error';
      errors = err.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
    }
  } catch {}

  // ── Logging ──
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${err.name || 'Error'}: ${message}`, {
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      body: req.method !== 'GET' ? req.body : undefined,
    });
  } else {
    logger.warn(`[${statusCode}] ${message}`, {
      method: req.method,
      url: req.originalUrl,
    });
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== 'production' && err.stack && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
