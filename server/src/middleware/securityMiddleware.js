const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const validator = require('validator');

/**
 * Input Sanitization Middleware
 * Sanitizes user input to prevent XSS and injection attacks
 */
const sanitizeInput = (req, res, next) => {
  // Recursively sanitize all string values in req.body
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // XSS protection
        sanitized[key] = xss(value, {
          whiteList: {}, // No HTML tags allowed
          stripIgnoreTag: true,
          stripIgnoreTagBody: ['script']
        });
        
        // Additional sanitization
        sanitized[key] = sanitized[key].trim();
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * MongoDB Injection Protection
 * Removes MongoDB operators from user input
 */
const mongoSanitizeMiddleware = mongoSanitize({
  onSanitize: ({ req, key }) => {
    console.warn(`Request contains potentially dangerous key: ${key}`);
  }
});

/**
 * Email Validation Middleware
 */
const validateEmail = (req, res, next) => {
  if (req.body.email) {
    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }
    
    // Normalize email
    req.body.email = validator.normalizeEmail(req.body.email, {
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false
    });
  }
  
  next();
};

/**
 * Password Strength Validation
 */
const validatePassword = (req, res, next) => {
  const password = req.body.password || req.body.newPassword;
  
  if (password) {
    // Check password strength
    const minLength = 8;
    const maxLength = 128;
    
    if (password.length < minLength) {
      return res.status(400).json({
        status: 'error',
        message: `Password must be at least ${minLength} characters long`,
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    if (password.length > maxLength) {
      return res.status(400).json({
        status: 'error',
        message: `Password must be less than ${maxLength} characters`,
        code: 'PASSWORD_TOO_LONG'
      });
    }
    
    // Check for required character types
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasLowerCase || !hasUpperCase || !hasNumbers) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        code: 'PASSWORD_TOO_WEAK'
      });
    }
    
    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      '1234567890', 'password1', 'qwerty123'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is too common. Please choose a more secure password.',
        code: 'PASSWORD_TOO_COMMON'
      });
    }
  }
  
  next();
};

/**
 * File Upload Security
 */
const validateFileUpload = (allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (req.file) {
      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          status: 'error',
          message: `File type ${req.file.mimetype} not allowed`,
          code: 'INVALID_FILE_TYPE'
        });
      }
      
      // Check file size
      if (req.file.size > maxSize) {
        return res.status(400).json({
          status: 'error',
          message: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
          code: 'FILE_TOO_LARGE'
        });
      }
      
      // Sanitize filename
      req.file.filename = req.file.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    }
    
    next();
  };
};

/**
 * URL Validation
 */
const validateURL = (req, res, next) => {
  const urlFields = ['website', 'profileUrl', 'socialLinks'];
  
  for (const field of urlFields) {
    if (req.body[field]) {
      if (!validator.isURL(req.body[field], {
        require_protocol: true,
        require_host: true,
        require_valid_protocol: true,
        protocols: ['http', 'https']
      })) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid URL format for ${field}`,
          code: 'INVALID_URL'
        });
      }
    }
  }
  
  next();
};

/**
 * SQL Injection Prevention
 * Additional layer even though we're using MongoDB
 */
const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\w+\s*=\s*\w+)/gi,
    /(;|\-\-|\||\*|%|<|>)/g
  ];
  
  const checkForSQLInjection = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  const checkObject = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        if (checkForSQLInjection(value)) {
          return currentPath;
        }
      } else if (typeof value === 'object' && value !== null) {
        const result = checkObject(value, currentPath);
        if (result) return result;
      }
    }
    return null;
  };
  
  // Check body, query, and params
  for (const source of ['body', 'query', 'params']) {
    if (req[source]) {
      const suspiciousField = checkObject(req[source]);
      if (suspiciousField) {
        return res.status(400).json({
          status: 'error',
          message: 'Potentially malicious input detected',
          code: 'SUSPICIOUS_INPUT',
          field: suspiciousField
        });
      }
    }
  }
  
  next();
};

/**
 * Content Length Validation
 */
const validateContentLength = (maxLength = 10000) => {
  return (req, res, next) => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength && parseInt(contentLength) > maxLength) {
      return res.status(413).json({
        status: 'error',
        message: 'Request payload too large',
        code: 'PAYLOAD_TOO_LARGE'
      });
    }
    
    next();
  };
};

/**
 * IP Whitelist/Blacklist
 */
const ipFilter = (whitelist = [], blacklist = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Check blacklist
    if (blacklist.length > 0 && blacklist.includes(clientIP)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
        code: 'IP_BLOCKED'
      });
    }
    
    // Check whitelist (if provided)
    if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
        code: 'IP_NOT_WHITELISTED'
      });
    }
    
    next();
  };
};

/**
 * Request ID Generator
 */
const generateRequestId = (req, res, next) => {
  req.requestId = require('crypto').randomBytes(16).toString('hex');
  res.set('X-Request-ID', req.requestId);
  next();
};

module.exports = {
  sanitizeInput,
  mongoSanitizeMiddleware,
  validateEmail,
  validatePassword,
  validateFileUpload,
  validateURL,
  preventSQLInjection,
  validateContentLength,
  ipFilter,
  generateRequestId
};