const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No valid token provided.'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by ID from token
      const user = await User.findById(decoded.userId).select('-passwordHash');
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token. User not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Update last active time
      user.lastActive = new Date();
      await user.save();

      // Attach user to request object
      req.user = user;
      req.userId = user._id;
      req.userUUID = user.userId;

      next();
    } catch (jwtError) {
      // Handle specific JWT errors
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token format.',
          code: 'INVALID_TOKEN'
        });
      }

      throw jwtError; // Re-throw if it's not a JWT-specific error
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication failed. Please try again.'
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user to request if token exists, but doesn't fail if missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without auth
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // Continue without auth
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
        req.userUUID = user.userId;
        
        // Update last active time
        user.lastActive = new Date();
        await user.save();
      }
    } catch (jwtError) {
      // Silently fail for optional auth
      console.log('Optional auth failed:', jwtError.message);
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without auth on error
  }
};

/**
 * Admin role middleware
 * Requires user to be authenticated and have admin role
 */
const adminAuth = async (req, res, next) => {
  try {
    // First run normal auth
    await authMiddleware(req, res, () => {});
    
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.'
      });
    }

    // Check if user has admin privileges
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authorization failed. Please try again.'
    });
  }
};

/**
 * Rate limiting middleware for sensitive operations
 */
const sensitiveOpAuth = (req, res, next) => {
  // Add timestamp to track sensitive operations
  if (!req.user.sensitiveOps) {
    req.user.sensitiveOps = [];
  }

  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  // Filter out operations older than 1 hour
  req.user.sensitiveOps = req.user.sensitiveOps.filter(time => time > oneHourAgo);

  // Check if user exceeded limit (5 sensitive operations per hour)
  if (req.user.sensitiveOps.length >= 5) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many sensitive operations. Please try again later.',
      retryAfter: Math.ceil((Math.min(...req.user.sensitiveOps) + (60 * 60 * 1000) - now) / 1000)
    });
  }

  // Add current operation timestamp
  req.user.sensitiveOps.push(now);
  next();
};

/**
 * Middleware to validate user ownership of resources
 */
const validateResourceOwnership = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const Model = require(`../models/${resourceModel}`);
      
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          status: 'error',
          message: `${resourceModel} not found.`
        });
      }

      // Check if user owns the resource
      if (resource.userId.toString() !== req.userId.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You can only access your own resources.'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Resource ownership validation error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to validate resource ownership.'
      });
    }
  };
};

/**
 * Generate JWT token for user
 */
const generateAuthToken = (user) => {
  const payload = {
    userId: user._id,
    userUUID: user.userId,
    email: user.email,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'fitlife-gym-buddy',
      audience: 'fitlife-users'
    }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'fitlife-gym-buddy',
      audience: 'fitlife-refresh'
    }
  );
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminAuth,
  sensitiveOpAuth,
  validateResourceOwnership,
  generateAuthToken,
  generateRefreshToken,
  verifyRefreshToken
};