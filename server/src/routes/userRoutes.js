const express = require('express');
const joi = require('joi');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Goal = require('../models/Goal');
const { validateResourceOwnership } = require('../middleware/authMiddleware');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { searchLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation schemas
const updateUserSchema = joi.object({
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
});

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
 * @route   GET /api/users/:id
 * @desc    Get user details by ID
 * @access  Private (own profile or admin)
 */
router.get('/:id',
  asyncHandler(async (req, res) => {
    const requestedUserId = req.params.id;
    
    // Users can only view their own profile (unless admin)
    if (requestedUserId !== req.userId.toString() && !req.user.isAdmin) {
      throw new AppError('Access denied. You can only view your own profile.', 403, 'ACCESS_DENIED');
    }

    const user = await User.findById(requestedUserId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 404, 'USER_DEACTIVATED');
    }

    const userResponse = user.toJSON();

    res.status(200).json({
      status: 'success',
      data: {
        user: userResponse
      }
    });
  })
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user information
 * @access  Private (own profile only)
 */
router.put('/:id',
  validateRequest(updateUserSchema),
  asyncHandler(async (req, res) => {
    const requestedUserId = req.params.id;
    
    // Users can only update their own profile
    if (requestedUserId !== req.userId.toString()) {
      throw new AppError('Access denied. You can only update your own profile.', 403, 'ACCESS_DENIED');
    }

    const user = await User.findById(requestedUserId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('Cannot update deactivated account', 400, 'ACCOUNT_DEACTIVATED');
    }

    const updates = req.body;
    
    // Update user fields
    Object.keys(updates).forEach(key => {
      if (key === 'profile' || key === 'preferences') {
        user[key] = { ...user[key], ...updates[key] };
      } else {
        user[key] = updates[key];
      }
    });

    await user.save();

    const userResponse = user.toJSON();

    res.status(200).json({
      status: 'success',
      message: 'User profile updated successfully',
      data: {
        user: userResponse
      }
    });
  })
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete/deactivate user account
 * @access  Private (own profile only)
 */
router.delete('/:id',
  asyncHandler(async (req, res) => {
    const requestedUserId = req.params.id;
    
    // Users can only delete their own profile
    if (requestedUserId !== req.userId.toString()) {
      throw new AppError('Access denied. You can only delete your own account.', 403, 'ACCESS_DENIED');
    }

    const user = await User.findById(requestedUserId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('Account is already deactivated', 400, 'ALREADY_DEACTIVATED');
    }

    // Soft delete - deactivate instead of removing
    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivationReason = 'User requested account deletion';
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Account deactivated successfully'
    });
  })
);

/**
 * @route   GET /api/users/:id/stats
 * @desc    Get user statistics
 * @access  Private (own profile only)
 */
router.get('/:id/stats',
  asyncHandler(async (req, res) => {
    const requestedUserId = req.params.id;
    
    // Users can only view their own stats
    if (requestedUserId !== req.userId.toString()) {
      throw new AppError('Access denied. You can only view your own statistics.', 403, 'ACCESS_DENIED');
    }

    const user = await User.findById(requestedUserId);
    if (!user || !user.isActive) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const days = parseInt(req.query.days) || 30;

    // Get workout statistics
    const workoutStats = await Workout.getWorkoutStats(requestedUserId, days);
    
    // Get goal statistics  
    const goalStats = await Goal.getGoalStats(requestedUserId, days);

    // Get recent activity
    const recentWorkouts = await Workout.find({
      userId: requestedUserId,
      completed: true
    })
    .sort({ completedAt: -1 })
    .limit(5)
    .select('title type durationMinutes completedAt rating');

    const activeGoals = await Goal.find({
      userId: requestedUserId,
      status: 'active',
      completed: false
    })
    .sort({ deadline: 1 })
    .limit(5)
    .select('title category targetValue progressValue deadline completionPercentage');

    // Calculate additional stats
    const totalDays = days;
    const workoutDays = workoutStats.length > 0 ? workoutStats[0].totalWorkouts : 0;
    const consistency = totalDays > 0 ? Math.round((workoutDays / totalDays) * 100) : 0;

    const stats = {
      period: `${days} days`,
      overview: {
        totalWorkouts: user.stats.totalWorkouts,
        currentStreak: user.stats.currentStreak,
        longestStreak: user.stats.longestStreak,
        totalMinutesExercised: user.stats.totalMinutesExercised,
        averageWorkoutDuration: user.stats.averageWorkoutDuration,
        goalsCompleted: user.stats.goalsCompleted,
        consistency: `${consistency}%`
      },
      recent: {
        workouts: workoutStats[0] || {
          totalWorkouts: 0,
          totalMinutes: 0,
          totalCalories: 0,
          avgRating: 0,
          avgDuration: 0
        },
        goals: goalStats[0] || {
          totalGoals: 0,
          completedGoals: 0,
          activeGoals: 0,
          overdueGoals: 0,
          completionRate: 0
        }
      },
      activity: {
        recentWorkouts,
        activeGoals
      },
      profile: {
        fitnessLevel: user.profile.fitnessLevel,
        fitnessGoals: user.profile.fitnessGoals,
        bmi: user.bmi,
        fitnessProgress: user.fitnessProgress
      }
    };

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  })
);

/**
 * @route   GET /api/users/:id/dashboard
 * @desc    Get user dashboard data
 * @access  Private (own profile only)
 */
router.get('/:id/dashboard',
  asyncHandler(async (req, res) => {
    const requestedUserId = req.params.id;
    
    // Users can only view their own dashboard
    if (requestedUserId !== req.userId.toString()) {
      throw new AppError('Access denied. You can only view your own dashboard.', 403, 'ACCESS_DENIED');
    }

    const user = await User.findById(requestedUserId);
    if (!user || !user.isActive) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Get today's data
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Today's workouts
    const todaysWorkouts = await Workout.find({
      userId: requestedUserId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: -1 });

    // Active goals with deadlines soon
    const upcomingDeadlines = await Goal.find({
      userId: requestedUserId,
      status: 'active',
      completed: false,
      deadline: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // Next 7 days
    }).sort({ deadline: 1 });

    // Weekly progress
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyWorkouts = await Workout.countDocuments({
      userId: requestedUserId,
      completed: true,
      completedAt: { $gte: weekAgo }
    });

    // Overdue goals
    const overdueGoals = await Goal.find({
      userId: requestedUserId,
      status: 'active',
      completed: false,
      deadline: { $lt: new Date() }
    }).countDocuments();

    // Recent achievements (completed goals in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAchievements = await Goal.find({
      userId: requestedUserId,
      completed: true,
      completedAt: { $gte: thirtyDaysAgo }
    })
    .sort({ completedAt: -1 })
    .limit(5)
    .select('title category completedAt');

    const dashboardData = {
      user: {
        name: user.name,
        fitnessLevel: user.profile.fitnessLevel,
        currentStreak: user.stats.currentStreak,
        weeklyGoal: user.preferences.weeklyGoal
      },
      today: {
        date: new Date().toISOString().split('T')[0],
        workouts: todaysWorkouts,
        completedWorkouts: todaysWorkouts.filter(w => w.completed).length,
        totalMinutes: todaysWorkouts.reduce((sum, w) => sum + (w.completed ? w.durationMinutes : 0), 0)
      },
      thisWeek: {
        workoutsCompleted: weeklyWorkouts,
        goalWorkouts: user.preferences.weeklyGoal,
        progress: Math.min(Math.round((weeklyWorkouts / user.preferences.weeklyGoal) * 100), 100)
      },
      goals: {
        upcoming: upcomingDeadlines,
        overdue: overdueGoals
      },
      achievements: recentAchievements,
      quickActions: [
        { action: 'start-workout', label: 'Start Workout', icon: 'play' },
        { action: 'log-workout', label: 'Log Workout', icon: 'plus' },
        { action: 'set-goal', label: 'Set New Goal', icon: 'target' },
        { action: 'view-progress', label: 'View Progress', icon: 'chart' }
      ]
    };

    res.status(200).json({
      status: 'success',
      data: {
        dashboard: dashboardData
      }
    });
  })
);

/**
 * @route   GET /api/users/search
 * @desc    Search users (for social features)
 * @access  Private
 */
router.get('/search',
  searchLimiter,
  asyncHandler(async (req, res) => {
    const { q, limit = 10, page = 1 } = req.query;
    
    if (!q || q.length < 2) {
      throw new AppError('Search query must be at least 2 characters long', 400, 'INVALID_QUERY');
    }

    const skip = (page - 1) * limit;
    
    // Search by name or email (limited to public profiles or friends)
    const users = await User.find({
      $and: [
        { isActive: true },
        { _id: { $ne: req.userId } }, // Exclude current user
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('userId name profile.fitnessLevel stats.currentStreak createdAt')
    .limit(parseInt(limit))
    .skip(skip)
    .sort({ name: 1 });

    const total = await User.countDocuments({
      $and: [
        { isActive: true },
        { _id: { $ne: req.userId } },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  })
);

/**
 * @route   GET /api/users/:id/public-profile
 * @desc    Get public profile information
 * @access  Private
 */
router.get('/:id/public-profile',
  asyncHandler(async (req, res) => {
    const requestedUserId = req.params.id;
    
    const user = await User.findById(requestedUserId)
      .select('userId name profile.fitnessLevel stats.currentStreak stats.totalWorkouts createdAt');
    
    if (!user || !user.isActive) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Get some public stats
    const recentWorkouts = await Workout.find({
      userId: requestedUserId,
      completed: true,
      isPublic: true // Only public workouts
    })
    .sort({ completedAt: -1 })
    .limit(5)
    .select('title type durationMinutes completedAt');

    const publicProfile = {
      userId: user.userId,
      name: user.name,
      fitnessLevel: user.profile.fitnessLevel,
      memberSince: user.createdAt,
      stats: {
        currentStreak: user.stats.currentStreak,
        totalWorkouts: user.stats.totalWorkouts
      },
      recentActivity: recentWorkouts
    };

    res.status(200).json({
      status: 'success',
      data: {
        profile: publicProfile
      }
    });
  })
);

module.exports = router;