const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId, timestamp: Date.now() },
    process.env.JWT_SECRET || 'change_this_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }

  const { name, email, password, age, habits, preferences } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash: password, // Will be hashed by pre-save middleware
    age,
    habits: habits || [],
    preferences: preferences || {}
  });

  // Generate token
  const token = generateToken(user.userId);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        age: user.age,
        habits: user.habits,
        createdAt: user.createdAt
      }
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email and password'
    });
  }

  // Find user and include password
  const user = await User.findOne({ email }).select('+passwordHash');
  
  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  // Update last active
  user.lastActive = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user.userId);

  res.json({
    status: 'success',
    token,
    data: {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        profile: user.profile,
        stats: user.stats
      }
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  // User is attached to req by auth middleware
  const user = await User.findOne({ userId: req.user.userId })
    .populate('dailyGoals')
    .select('-passwordHash');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.json({
    status: 'success',
    data: { user }
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
exports.refreshToken = asyncHandler(async (req, res) => {
  const token = generateToken(req.user.userId);
  
  res.json({
    status: 'success',
    token
  });
});

// @desc    Logout (client-side, but we can blacklist token if needed)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  // In a production app, you might want to blacklist the token here
  // For now, we'll just send a success response
  
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});
