const express = require('express');
const bcrypt = require('bcrypt');
const joi = require('joi');
const User = require('../models/User');
const { 
  generateAuthToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authMiddleware 
} = require('../middleware/authMiddleware');
const { 
  authLimiter, 
  registrationLimiter, 
  passwordResetLimiter 
} = require('../middleware/rateLimiter');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const registerSchema = joi.object({
  name: joi.string().trim().min(2).max(50).required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
  email: joi.string().email().lowercase().trim().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: joi.string().min(6).max(128).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  age: joi.number().integer().min(13).max(120).optional()
    .messages({
      'number.min': 'Age must be at least 13',
      'number.max': 'Age must be less than 120'
    }),
  habits: joi.array().items(joi.string().trim()).max(20).optional(),
  profile: joi.object({
    height: joi.number().min(50).max(300).optional(),
    weight: joi.number().min(20).max(500).optional(),
    fitnessLevel: joi.string().valid('beginner', 'intermediate', 'advanced', 'athlete').optional(),
    fitnessGoals: joi.array().items(
      joi.string().valid('weight-loss', 'muscle-gain', 'endurance', 'strength', 'flexibility', 'general-fitness')
    ).optional(),
    preferredWorkoutTypes: joi.array().items(
      joi.string().valid('cardio', 'strength', 'yoga', 'pilates', 'crossfit', 'swimming', 'running', 'cycling')
    ).optional()
  }).optional()
});

const loginSchema = joi.object({
  email: joi.string().email().lowercase().trim().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: joi.string().required()
    .messages({
      'any.required': 'Password is required'
    })
});

const refreshTokenSchema = joi.object({
  refreshToken: joi.string().required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

const forgotPasswordSchema = joi.object({
  email: joi.string().email().lowercase().trim().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

const resetPasswordSchema = joi.object({
  token: joi.string().required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  password: joi.string().min(6).max(128).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    })
});

// Validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  registrationLimiter,
  validateRequest(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, age, habits, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409, 'USER_EXISTS');
    }

    // Create new user
    const userData = {
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
      age,
      habits: habits || [],
      profile: profile || {}
    };

    const user = new User(userData);
    await user.save();

    // Generate tokens
    const authToken = generateAuthToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove sensitive data from response
    const userResponse = user.toJSON();

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userResponse,
        tokens: {
          accessToken: authToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      }
    });
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  authLimiter,
  validateRequest(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated. Please contact support.', 401, 'ACCOUNT_DEACTIVATED');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate tokens
    const authToken = generateAuthToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove sensitive data from response
    const userResponse = user.toJSON();

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens: {
          accessToken: authToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      }
    });
  })
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  validateRequest(refreshTokenSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Generate new access token
      const newAccessToken = generateAuthToken(user);

      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      });
    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  })
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile',
  authMiddleware,
  asyncHandler(async (req, res) => {
    // User is already attached by authMiddleware
    const userResponse = req.user.toJSON();

    res.status(200).json({
      status: 'success',
      data: {
        user: userResponse
      }
    });
  })
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile',
  authMiddleware,
  validateRequest(joi.object({
    name: joi.string().trim().min(2).max(50).optional(),
    age: joi.number().integer().min(13).max(120).optional(),
    habits: joi.array().items(joi.string().trim()).max(20).optional(),
    profile: joi.object({
      height: joi.number().min(50).max(300).optional(),
      weight: joi.number().min(20).max(500).optional(),
      fitnessLevel: joi.string().valid('beginner', 'intermediate', 'advanced', 'athlete').optional(),
      fitnessGoals: joi.array().items(
        joi.string().valid('weight-loss', 'muscle-gain', 'endurance', 'strength', 'flexibility', 'general-fitness')
      ).optional(),
      preferredWorkoutTypes: joi.array().items(
        joi.string().valid('cardio', 'strength', 'yoga', 'pilates', 'crossfit', 'swimming', 'running', 'cycling')
      ).optional()
    }).optional(),
    preferences: joi.object({
      notificationsEnabled: joi.boolean().optional(),
      emailNotifications: joi.boolean().optional(),
      reminderTime: joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      weeklyGoal: joi.number().integer().min(1).max(7).optional()
    }).optional()
  })),
  asyncHandler(async (req, res) => {
    const updates = req.body;
    
    // Update user profile
    Object.keys(updates).forEach(key => {
      if (key === 'profile' || key === 'preferences') {
        req.user[key] = { ...req.user[key], ...updates[key] };
      } else {
        req.user[key] = updates[key];
      }
    });

    await req.user.save();

    const userResponse = req.user.toJSON();

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: userResponse
      }
    });
  })
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password',
  authMiddleware,
  validateRequest(joi.object({
    currentPassword: joi.string().required()
      .messages({ 'any.required': 'Current password is required' }),
    newPassword: joi.string().min(6).max(128).required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .messages({
        'string.min': 'New password must be at least 6 characters long',
        'string.max': 'New password cannot exceed 128 characters',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'New password is required'
      })
  })),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.userId).select('+passwordHash');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
    }

    // Check if new password is different
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw new AppError('New password must be different from current password', 400, 'SAME_PASSWORD');
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate token on client side)
 * @access  Private
 */
router.post('/logout',
  authMiddleware,
  asyncHandler(async (req, res) => {
    // In a real-world scenario, you might want to blacklist the token
    // For now, we just confirm the logout
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  })
);

/**
 * @route   POST /api/auth/deactivate
 * @desc    Deactivate user account
 * @access  Private
 */
router.post('/deactivate',
  authMiddleware,
  validateRequest(joi.object({
    password: joi.string().required()
      .messages({ 'any.required': 'Password confirmation is required' }),
    reason: joi.string().optional()
  })),
  asyncHandler(async (req, res) => {
    const { password, reason } = req.body;

    // Get user with password
    const user = await User.findById(req.userId).select('+passwordHash');
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Password confirmation failed', 400, 'INVALID_PASSWORD');
    }

    // Deactivate account
    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivationReason = reason;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Account deactivated successfully'
    });
  })
);

module.exports = router;