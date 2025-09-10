const express = require('express');
const joi = require('joi');
const Notification = require('../models/Notification');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification
 * @access  Private
 */
router.post('/', asyncHandler(async (req, res) => {
  const notification = new Notification({
    ...req.body,
    userId: req.userId
  });
  
  await notification.save();
  
  res.status(201).json({
    status: 'success',
    message: 'Notification created successfully',
    data: { notification }
  });
}));

/**
 * @route   GET /api/notifications/user/:userId
 * @desc    Get all notifications for a user
 * @access  Private
 */
router.get('/user/:userId', asyncHandler(async (req, res) => {
  if (req.params.userId !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  const { status, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;
  
  const query = { userId: req.userId };
  if (status) query.status = status;
  
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Notification.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: {
      notifications,
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
 * @route   GET /api/notifications/unread
 * @desc    Get unread notifications for user
 * @access  Private
 */
router.get('/unread', asyncHandler(async (req, res) => {
  const notifications = await Notification.findUnread(req.userId, 20);
  
  res.status(200).json({
    status: 'success',
    data: { notifications }
  });
}));

/**
 * @route   PUT /api/notifications/:id
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  
  if (notification.userId.toString() !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  await notification.markAsRead();
  
  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read',
    data: { notification }
  });
}));

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', asyncHandler(async (req, res) => {
  const unreadNotifications = await Notification.find({
    userId: req.userId,
    status: { $in: ['pending', 'sent', 'delivered'] }
  });
  
  const notificationIds = unreadNotifications.map(n => n.notificationId);
  
  await Notification.markMultipleAsRead(req.userId, notificationIds);
  
  res.status(200).json({
    status: 'success',
    message: `${unreadNotifications.length} notifications marked as read`
  });
}));

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  
  if (notification.userId.toString() !== req.userId.toString()) {
    throw new AppError('Access denied', 403);
  }
  
  await notification.deleteOne();
  
  res.status(200).json({
    status: 'success',
    message: 'Notification deleted successfully'
  });
}));

module.exports = router;