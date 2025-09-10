const express = require('express');
const joi = require('joi');
const Goal = require('../models/Goal');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

const createGoalSchema = joi.object({
  title: joi.string().trim().min(1).max(100).required(),
  description: joi.string().trim().max(500).optional(),
  category: joi.string().valid('weight-loss', 'weight-gain', 'muscle-gain', 'endurance', 'strength', 'flexibility', 'habit-building', 'nutrition', 'sleep', 'steps', 'water-intake', 'workout-frequency', 'distance', 'time-based').required(),
  type: joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'one-time').required(),
  targetValue: joi.number().min(0.1).required(),
  unit: joi.string().valid('kg', 'lbs', 'minutes', 'hours', 'steps', 'km', 'miles', 'calories', 'glasses', 'workouts', 'days', 'reps', 'sets', 'percentage', 'count', 'sessions').required(),
  deadline: joi.date().greater('now').required()
});

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 * @access  Private
 */
router.post('/', asyncHandler(async (req, res) => {
  const goal = new Goal({
    ...req.body,
    userId: req.userId
  });
  
  await goal.save();
  
  res.status(201).json({
    status: 'success',
    message: 'Goal created successfully',
    data: { goal }
  });
}));

/**
 * @route   GET /api/goals/user/:userId
 * @desc    Get all goals for a user
 * @access  Private
 */
router.get('/user/:userId', asyncHandler(async (req, res) => {
  if (req.params.userId !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  const goals = await Goal.find({ userId: req.userId })
    .sort({ priority: -1, deadline: 1 });
  
  res.status(200).json({
    status: 'success',
    data: { goals }
  });
}));

/**
 * @route   GET /api/goals/:id
 * @desc    Get single goal
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if (!goal) {
    throw new AppError('Goal not found', 404);
  }
  
  if (goal.userId.toString() !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  res.status(200).json({
    status: 'success',
    data: { goal }
  });
}));

/**
 * @route   PUT /api/goals/:id
 * @desc    Update goal
 * @access  Private
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if (!goal) {
    throw new AppError('Goal not found', 404);
  }
  
  if (goal.userId.toString() !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  Object.assign(goal, req.body);
  await goal.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Goal updated successfully',
    data: { goal }
  });
}));

/**
 * @route   PUT /api/goals/:id/progress
 * @desc    Update goal progress
 * @access  Private
 */
router.put('/:id/progress', asyncHandler(async (req, res) => {
  const { value, notes, mood } = req.body;
  
  const goal = await Goal.findById(req.params.id);
  
  if (!goal) {
    throw new AppError('Goal not found', 404);
  }
  
  if (goal.userId.toString() !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  await goal.updateProgress(value, notes, mood);
  
  res.status(200).json({
    status: 'success',
    message: 'Goal progress updated successfully',
    data: { goal }
  });
}));

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete goal
 * @access  Private
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if (!goal) {
    throw new AppError('Goal not found', 404);
  }
  
  if (goal.userId.toString() !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  await goal.deleteOne();
  
  res.status(200).json({
    status: 'success',
    message: 'Goal deleted successfully'
  });
}));

/**
 * @route   GET /api/goals/stats/:userId
 * @desc    Get goal statistics for user
 * @access  Private
 */
router.get('/stats/:userId', asyncHandler(async (req, res) => {
  if (req.params.userId !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  const { days = 30 } = req.query;
  const stats = await Goal.getGoalStats(req.userId, parseInt(days));
  
  res.status(200).json({
    status: 'success',
    data: { stats: stats[0] || {} }
  });
}));

/**
 * @route   GET /api/goals/recommendations/:userId
 * @desc    Get AI-powered goal recommendations
 * @access  Private
 */
router.get('/recommendations/:userId', asyncHandler(async (req, res) => {
  if (req.params.userId !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  const geminiService = require('../services/geminiService');
  const recommendations = await geminiService.generateRecommendations(req.userId);
  
  res.status(200).json({
    status: 'success',
    data: { recommendations }
  });
}));

/**
 * @route   PUT /api/goals/:id/complete
 * @desc    Mark goal as completed
 * @access  Private
 */
router.put('/:id/complete', asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  
  if (!goal) {
    throw new AppError('Goal not found', 404);
  }
  
  if (goal.userId.toString() !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  if (goal.completed) {
    throw new AppError('Goal is already completed', 400);
  }
  
  goal.completed = true;
  goal.completedAt = new Date();
  goal.status = 'completed';
  goal.completionPercentage = 100;
  
  await goal.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Goal completed successfully',
    data: { goal }
  });
}));

module.exports = router;