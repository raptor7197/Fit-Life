const express = require('express');
const joi = require('joi');
const Workout = require('../models/Workout');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

const createWorkoutSchema = joi.object({
  title: joi.string().trim().min(1).max(100).required(),
  description: joi.string().trim().max(500).optional(),
  type: joi.string().valid('cardio', 'strength', 'yoga', 'pilates', 'crossfit', 'swimming', 'running', 'cycling', 'stretching', 'sports', 'dance', 'martial-arts').required(),
  durationMinutes: joi.number().integer().min(1).max(480).required(),
  intensity: joi.string().valid('low', 'medium', 'high').required(),
  exercises: joi.array().items(joi.object({
    name: joi.string().required(),
    sets: joi.number().integer().min(1).optional(),
    reps: joi.number().integer().min(1).optional(),
    weight: joi.number().min(0).optional(),
    duration: joi.number().min(1).optional(),
    distance: joi.number().min(0.01).optional()
  })).optional(),
  date: joi.date().max('now').optional()
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
 * @route   POST /api/workouts
 * @desc    Create a new workout
 * @access  Private
 */
router.post('/', 
  validateRequest(createWorkoutSchema),
  asyncHandler(async (req, res) => {
    const workout = new Workout({
      ...req.body,
      userId: req.userId
    });
    
    await workout.save();
    
    res.status(201).json({
      status: 'success',
      message: 'Workout created successfully',
      data: { workout }
    });
  })
);

/**
 * @route   GET /api/workouts/user/:userId
 * @desc    Get all workouts for a user with filtering and pagination
 * @access  Private
 */
router.get('/user/:userId', asyncHandler(async (req, res) => {
  if (req.params.userId !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  const { type, completed, limit = 20, page = 1, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;
  
  const query = { userId: req.userId };
  
  if (type) query.type = type;
  if (completed !== undefined) query.completed = completed === 'true';
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const workouts = await Workout.find(query)
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Workout.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: {
      workouts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    }
  });
}));

/**
 * @route   GET /api/workouts/:id
 * @desc    Get single workout
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);
  
  if (!workout) {
    throw new AppError('Workout not found', 404);
  }
  
  if (workout.userId.toString() !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  res.status(200).json({
    status: 'success',
    data: { workout }
  });
}));

/**
 * @route   PUT /api/workouts/:id
 * @desc    Update workout
 * @access  Private
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);
  
  if (!workout) {
    throw new AppError('Workout not found', 404);
  }
  
  if (workout.userId.toString() !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  Object.assign(workout, req.body);
  await workout.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Workout updated successfully',
    data: { workout }
  });
}));

/**
 * @route   DELETE /api/workouts/:id
 * @desc    Delete workout
 * @access  Private
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);
  
  if (!workout) {
    throw new AppError('Workout not found', 404);
  }
  
  if (workout.userId.toString() !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  await workout.deleteOne();
  
  res.status(200).json({
    status: 'success',
    message: 'Workout deleted successfully'
  });
}));

/**
 * @route   PUT /api/workouts/:id/complete
 * @desc    Mark workout as completed
 * @access  Private
 */
router.put('/:id/complete', asyncHandler(async (req, res) => {
  const { rating, notes, caloriesBurned } = req.body;
  
  const workout = await Workout.findById(req.params.id);
  
  if (!workout) {
    throw new AppError('Workout not found', 404);
  }
  
  if (workout.userId.toString() !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  if (workout.completed) {
    throw new AppError('Workout is already completed', 400);
  }
  
  workout.completed = true;
  workout.completedAt = new Date();
  if (rating) workout.rating = rating;
  if (notes) workout.notes = notes;
  if (caloriesBurned) workout.caloriesBurned = caloriesBurned;
  
  await workout.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Workout completed successfully',
    data: { workout }
  });
}));

/**
 * @route   GET /api/workouts/stats/:userId
 * @desc    Get workout statistics for user
 * @access  Private
 */
router.get('/stats/:userId', asyncHandler(async (req, res) => {
  if (req.params.userId !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  const { days = 30 } = req.query;
  const stats = await Workout.getWorkoutStats(req.userId, parseInt(days));
  
  res.status(200).json({
    status: 'success',
    data: { stats: stats[0] || {} }
  });
}));

/**
 * @route   GET /api/workouts/recommendations/:userId
 * @desc    Get AI-powered workout recommendations
 * @access  Private
 */
router.get('/recommendations/:userId', asyncHandler(async (req, res) => {
  if (req.params.userId !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  const geminiService = require('../services/geminiService');
  const recommendation = await geminiService.generateWorkoutSuggestion(req.userId, req.query.type);
  
  res.status(200).json({
    status: 'success',
    data: { recommendation }
  });
}));

module.exports = router;