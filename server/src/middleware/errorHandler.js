const mongoose = require('mongoose');

/**
 * Global Error Handler Middleware
 * Handles different types of errors and returns appropriate responses
 */
const errorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', {
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    const message = 'Invalid resource ID format';
    return res.status(400).json({
      status: 'error',
      message,
      code: 'INVALID_ID'
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    
    return res.status(400).json({
      status: 'error',
      message,
      code: 'DUPLICATE_ENTRY',
      field
    });
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: messages,
      code: 'VALIDATION_ERROR'
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // MongoDB connection errors
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    return res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      code: 'DATABASE_ERROR'
    });
  }

  // Request timeout
  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
    return res.status(408).json({
      status: 'error',
      message: 'Request timeout',
      code: 'TIMEOUT'
    });
  }

  // File size limit exceeded
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      status: 'error',
      message: 'File size too large',
      code: 'FILE_TOO_LARGE'
    });
  }

  // Rate limiting error
  if (error.status === 429) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: error.retryAfter
    });
  }

  // Custom application errors
  if (error.isOperational) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message,
      code: error.code || 'APPLICATION_ERROR'
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong. Please try again.' 
    : error.message || 'Internal server error';

  return res.status(statusCode).json({
    status: 'error',
    message,
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch and forward errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom Error Class for operational errors
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Handler
 * Handles 404 errors for non-existent routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Validation Error Handler
 * Handles request validation errors from middleware like Joi
 */
const validationErrorHandler = (error, req, res, next) => {
  if (error.isJoi) {
    const messages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, '')
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: messages,
      code: 'VALIDATION_ERROR'
    });
  }
  next(error);
};

/**
 * Security Error Handler
 * Handles security-related errors
 */
const securityErrorHandler = (error, req, res, next) => {
  // CORS errors
  if (error.message && error.message.includes('CORS')) {
    return res.status(403).json({
      status: 'error',
      message: 'CORS policy violation',
      code: 'CORS_ERROR'
    });
  }

  // Content Security Policy violations
  if (error.message && error.message.includes('CSP')) {
    return res.status(403).json({
      status: 'error',
      message: 'Content Security Policy violation',
      code: 'CSP_VIOLATION'
    });
  }

  next(error);
};

/**
 * Production Error Handler
 * Sanitizes errors for production environment
 */
const productionErrorHandler = (error, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Don't expose sensitive error details in production
    if (!error.isOperational) {
      console.error('Unhandled Error:', error);
      
      return res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again.',
        code: 'INTERNAL_ERROR'
      });
    }
  }
  next(error);
};

/**
 * Request Context Logger
 * Logs request context for error tracking
 */
const logRequestContext = (req, res, next) => {
  req.context = {
    requestId: require('uuid').v4(),
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null
  };

  // Add request ID to response headers for tracking
  res.set('X-Request-ID', req.context.requestId);
  
  next();
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  notFoundHandler,
  validationErrorHandler,
  securityErrorHandler,
  productionErrorHandler,
  logRequestContext
};