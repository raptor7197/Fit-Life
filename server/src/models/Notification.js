const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'reminder', 'achievement', 'recommendation', 'goal-deadline',
      'workout-streak', 'milestone', 'encouragement', 'warning',
      'system', 'social', 'challenge', 'tip'
    ]
  },
  category: {
    type: String,
    enum: ['workout', 'goal', 'health', 'social', 'system', 'achievement'],
    default: 'system'
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  channels: {
    type: [String],
    enum: ['in-app', 'email', 'push', 'sms'],
    default: ['in-app']
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  sentAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: function() {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30); // Default 30 days
      return expires;
    }
  },
  metadata: {
    relatedId: {
      type: String // Can be workoutId, goalId, etc.
    },
    relatedModel: {
      type: String,
      enum: ['Workout', 'Goal', 'User', 'Achievement']
    },
    actionUrl: {
      type: String,
      maxlength: [200, 'Action URL cannot exceed 200 characters']
    },
    actionLabel: {
      type: String,
      maxlength: [50, 'Action label cannot exceed 50 characters']
    },
    imageUrl: {
      type: String,
      maxlength: [200, 'Image URL cannot exceed 200 characters']
    },
    customData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  personalization: {
    userName: String,
    currentStreak: Number,
    goalProgress: Number,
    workoutCount: Number,
    achievementLevel: String
  },
  template: {
    templateId: {
      type: String,
      maxlength: [50, 'Template ID cannot exceed 50 characters']
    },
    variables: {
      type: Map,
      of: String
    }
  },
  delivery: {
    attempts: {
      type: Number,
      default: 0,
      max: [5, 'Cannot exceed 5 delivery attempts']
    },
    lastAttempt: Date,
    errors: [{
      channel: {
        type: String,
        enum: ['in-app', 'email', 'push', 'sms']
      },
      error: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    deliveryStatus: {
      'in-app': {
        type: String,
        enum: ['pending', 'delivered', 'failed'],
        default: 'pending'
      },
      email: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'bounced', 'failed']
      },
      push: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed']
      },
      sms: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed']
      }
    }
  },
  analytics: {
    opened: {
      type: Boolean,
      default: false
    },
    clicked: {
      type: Boolean,
      default: false
    },
    actionTaken: {
      type: Boolean,
      default: false
    },
    openedAt: Date,
    clickedAt: Date,
    actionTakenAt: Date
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringConfig: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
    },
    interval: {
      type: Number,
      min: [1, 'Interval must be at least 1']
    },
    daysOfWeek: {
      type: [Number],
      validate: {
        validator: function(days) {
          return days.every(day => day >= 0 && day <= 6);
        },
        message: 'Days must be between 0 (Sunday) and 6 (Saturday)'
      }
    },
    endDate: Date,
    nextScheduled: Date
  },
  tags: {
    type: [String],
    validate: {
      validator: function(tags) {
        return tags.length <= 10;
      },
      message: 'Cannot have more than 10 tags'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ notificationId: 1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ readAt: 1 });
notificationSchema.index({ 'metadata.relatedId': 1 });
notificationSchema.index({ tags: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Virtual for isExpired
notificationSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for isOverdue (scheduled but not sent)
notificationSchema.virtual('isOverdue').get(function() {
  return new Date() > this.scheduledFor && this.status === 'pending';
});

// Virtual for delivery success rate
notificationSchema.virtual('deliverySuccessRate').get(function() {
  const totalChannels = this.channels.length;
  if (totalChannels === 0) return 0;
  
  let successfulDeliveries = 0;
  this.channels.forEach(channel => {
    if (this.delivery.deliveryStatus[channel] === 'delivered') {
      successfulDeliveries++;
    }
  });
  
  return (successfulDeliveries / totalChannels) * 100;
});

// Pre-save middleware to set default values and validate
notificationSchema.pre('save', function(next) {
  // Set sentAt when status changes to sent
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  
  // Set deliveredAt when status changes to delivered
  if (this.isModified('status') && this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  
  // Set readAt when status changes to read
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
    this.analytics.opened = true;
    this.analytics.openedAt = new Date();
  }
  
  // Auto-expire old notifications
  if (this.isExpired && this.status === 'pending') {
    this.status = 'failed';
  }
  
  // Set next scheduled time for recurring notifications
  if (this.isRecurring && this.recurringConfig.frequency && !this.recurringConfig.nextScheduled) {
    const next = new Date(this.scheduledFor);
    
    switch (this.recurringConfig.frequency) {
      case 'daily':
        next.setDate(next.getDate() + (this.recurringConfig.interval || 1));
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 * (this.recurringConfig.interval || 1)));
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + (this.recurringConfig.interval || 1));
        break;
    }
    
    this.recurringConfig.nextScheduled = next;
  }
  
  next();
});

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.status = 'read';
  this.readAt = new Date();
  this.analytics.opened = true;
  this.analytics.openedAt = new Date();
  return await this.save();
};

// Instance method to mark as clicked
notificationSchema.methods.markAsClicked = async function() {
  this.analytics.clicked = true;
  this.analytics.clickedAt = new Date();
  return await this.save();
};

// Instance method to mark action taken
notificationSchema.methods.markActionTaken = async function() {
  this.analytics.actionTaken = true;
  this.analytics.actionTakenAt = new Date();
  return await this.save();
};

// Instance method to record delivery attempt
notificationSchema.methods.recordDeliveryAttempt = function(channel, success, error = null) {
  this.delivery.attempts += 1;
  this.delivery.lastAttempt = new Date();
  
  if (success) {
    this.delivery.deliveryStatus[channel] = 'delivered';
    if (this.status === 'pending' || this.status === 'sent') {
      this.status = 'delivered';
      this.deliveredAt = new Date();
    }
  } else {
    this.delivery.deliveryStatus[channel] = 'failed';
    this.delivery.errors.push({
      channel,
      error: error || 'Unknown error',
      timestamp: new Date()
    });
    
    // Mark as failed if all channels failed or max attempts reached
    if (this.delivery.attempts >= 5) {
      this.status = 'failed';
    }
  }
};

// Instance method to create recurring notification
notificationSchema.methods.createRecurringInstance = async function() {
  if (!this.isRecurring || !this.recurringConfig.nextScheduled) {
    return null;
  }
  
  // Check if we should stop recurring (past end date)
  if (this.recurringConfig.endDate && new Date() > this.recurringConfig.endDate) {
    return null;
  }
  
  const Notification = this.constructor;
  const newNotification = new Notification({
    userId: this.userId,
    type: this.type,
    category: this.category,
    title: this.title,
    message: this.message,
    priority: this.priority,
    channels: this.channels,
    scheduledFor: this.recurringConfig.nextScheduled,
    metadata: this.metadata,
    personalization: this.personalization,
    template: this.template,
    isRecurring: true,
    recurringConfig: {
      ...this.recurringConfig,
      nextScheduled: null // Will be calculated on save
    },
    tags: this.tags
  });
  
  return await newNotification.save();
};

// Static method to find pending notifications
notificationSchema.statics.findPending = function(limit = 100) {
  return this.find({
    status: 'pending',
    scheduledFor: { $lte: new Date() },
    expiresAt: { $gt: new Date() }
  })
  .limit(limit)
  .sort({ priority: -1, scheduledFor: 1 });
};

// Static method to find notifications by user and status
notificationSchema.statics.findByUserAndStatus = function(userId, status, limit = 50) {
  return this.find({ userId, status })
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to find unread notifications
notificationSchema.statics.findUnread = function(userId, limit = 20) {
  return this.find({
    userId,
    status: { $in: ['pending', 'sent', 'delivered'] },
    expiresAt: { $gt: new Date() }
  })
  .limit(limit)
  .sort({ priority: -1, scheduledFor: -1 });
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
    status: { $nin: ['read'] } // Keep read notifications for analytics
  });
};

// Static method to get notification analytics
notificationSchema.statics.getAnalytics = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        readNotifications: {
          $sum: { $cond: ['$analytics.opened', 1, 0] }
        },
        clickedNotifications: {
          $sum: { $cond: ['$analytics.clicked', 1, 0] }
        },
        actionTaken: {
          $sum: { $cond: ['$analytics.actionTaken', 1, 0] }
        },
        byType: {
          $push: '$type'
        },
        byPriority: {
          $push: '$priority'
        }
      }
    },
    {
      $project: {
        totalNotifications: 1,
        readNotifications: 1,
        clickedNotifications: 1,
        actionTaken: 1,
        openRate: {
          $round: [
            { $multiply: [
              { $divide: ['$readNotifications', '$totalNotifications'] },
              100
            ]},
            1
          ]
        },
        clickRate: {
          $round: [
            { $multiply: [
              { $divide: ['$clickedNotifications', '$readNotifications'] },
              100
            ]},
            1
          ]
        },
        actionRate: {
          $round: [
            { $multiply: [
              { $divide: ['$actionTaken', '$clickedNotifications'] },
              100
            ]},
            1
          ]
        }
      }
    }
  ]);
};

// Static method for batch operations
notificationSchema.statics.markMultipleAsRead = function(userId, notificationIds) {
  return this.updateMany(
    {
      userId,
      notificationId: { $in: notificationIds },
      status: { $ne: 'read' }
    },
    {
      $set: {
        status: 'read',
        readAt: new Date(),
        'analytics.opened': true,
        'analytics.openedAt': new Date()
      }
    }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);