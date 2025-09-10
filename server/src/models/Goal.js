const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const goalSchema = new mongoose.Schema({
  goalId: {
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
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Goal category is required'],
    enum: [
      'weight-loss', 'weight-gain', 'muscle-gain', 'endurance', 'strength', 
      'flexibility', 'habit-building', 'nutrition', 'sleep', 'steps', 
      'water-intake', 'workout-frequency', 'distance', 'time-based'
    ]
  },
  type: {
    type: String,
    required: [true, 'Goal type is required'],
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'one-time'],
    default: 'daily'
  },
  targetValue: {
    type: Number,
    required: [true, 'Target value is required'],
    min: [0.1, 'Target value must be greater than 0']
  },
  currentValue: {
    type: Number,
    default: 0,
    min: [0, 'Current value cannot be negative']
  },
  progressValue: {
    type: Number,
    default: 0,
    min: [0, 'Progress value cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: [
      'kg', 'lbs', 'minutes', 'hours', 'steps', 'km', 'miles', 
      'calories', 'glasses', 'workouts', 'days', 'reps', 'sets',
      'percentage', 'count', 'sessions'
    ]
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
    validate: {
      validator: function(deadline) {
        return deadline > this.startDate;
      },
      message: 'Deadline must be after start date'
    }
  },
  completedAt: {
    type: Date
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging', 'expert'],
    default: 'moderate'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'failed', 'cancelled'],
    default: 'active'
  },
  milestones: [{
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Milestone title cannot exceed 100 characters']
    },
    targetValue: {
      type: Number,
      required: true,
      min: [0, 'Milestone target value cannot be negative']
    },
    completedAt: Date,
    completed: {
      type: Boolean,
      default: false
    },
    reward: {
      type: String,
      maxlength: [200, 'Reward description cannot exceed 200 characters']
    }
  }],
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily'
    },
    time: {
      type: String,
      default: '09:00',
      validate: {
        validator: function(time) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        },
        message: 'Time must be in HH:MM format'
      }
    },
    customDays: {
      type: [String],
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: []
    }
  },
  streak: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Current streak cannot be negative']
    },
    longest: {
      type: Number,
      default: 0,
      min: [0, 'Longest streak cannot be negative']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  progressHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    value: {
      type: Number,
      required: true,
      min: [0, 'Progress value cannot be negative']
    },
    notes: {
      type: String,
      maxlength: [200, 'Progress notes cannot exceed 200 characters']
    },
    mood: {
      type: String,
      enum: ['excellent', 'good', 'okay', 'poor', 'terrible']
    }
  }],
  tags: {
    type: [String],
    validate: {
      validator: function(tags) {
        return tags.length <= 10;
      },
      message: 'Cannot have more than 10 tags'
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  linkedWorkouts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout'
  }],
  reward: {
    type: String,
    maxlength: [200, 'Reward description cannot exceed 200 characters']
  },
  motivation: {
    type: String,
    maxlength: [500, 'Motivation cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ goalId: 1 });
goalSchema.index({ deadline: 1 });
goalSchema.index({ completed: 1 });
goalSchema.index({ category: 1 });
goalSchema.index({ type: 1 });
goalSchema.index({ priority: 1 });
goalSchema.index({ tags: 1 });

// Virtual for completion percentage
goalSchema.virtual('completionPercentage').get(function() {
  if (this.targetValue === 0) return 0;
  const percentage = (this.progressValue / this.targetValue) * 100;
  return Math.min(Math.round(percentage * 10) / 10, 100);
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for days since start
goalSchema.virtual('daysSinceStart').get(function() {
  const today = new Date();
  const start = new Date(this.startDate);
  const diffTime = today - start;
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
});

// Virtual for average daily progress
goalSchema.virtual('averageDailyProgress').get(function() {
  const days = this.daysSinceStart || 1;
  return Math.round((this.progressValue / days) * 100) / 100;
});

// Virtual for required daily progress
goalSchema.virtual('requiredDailyProgress').get(function() {
  const daysRemaining = this.daysRemaining || 1;
  const remainingProgress = this.targetValue - this.progressValue;
  return Math.max(0, Math.round((remainingProgress / daysRemaining) * 100) / 100);
});

// Virtual for goal health status
goalSchema.virtual('healthStatus').get(function() {
  const completion = this.completionPercentage;
  const timeProgress = (this.daysSinceStart / (this.daysSinceStart + this.daysRemaining)) * 100;
  
  if (this.completed) return 'completed';
  if (this.daysRemaining === 0) return 'overdue';
  if (completion >= timeProgress + 10) return 'ahead';
  if (completion >= timeProgress - 10) return 'on-track';
  return 'behind';
});

// Pre-save middleware to update completion status
goalSchema.pre('save', function(next) {
  // Update completion status
  if (this.progressValue >= this.targetValue && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
    this.status = 'completed';
  }
  
  // Update streak
  if (this.isModified('progressValue') && this.progressValue > this.currentValue) {
    const today = new Date().toDateString();
    const lastUpdate = new Date(this.streak.lastUpdated).toDateString();
    
    if (today !== lastUpdate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      if (lastUpdate === yesterdayStr) {
        this.streak.current += 1;
      } else {
        this.streak.current = 1;
      }
      
      if (this.streak.current > this.streak.longest) {
        this.streak.longest = this.streak.current;
      }
      
      this.streak.lastUpdated = new Date();
    }
  }
  
  // Auto-fail overdue goals
  if (this.daysRemaining === 0 && !this.completed && this.status === 'active') {
    this.status = 'failed';
  }
  
  this.currentValue = this.progressValue;
  next();
});

// Instance method to update progress
goalSchema.methods.updateProgress = async function(value, notes = '', mood = null) {
  const previousValue = this.progressValue;
  this.progressValue = Math.min(value, this.targetValue);
  
  // Add to progress history
  this.progressHistory.push({
    date: new Date(),
    value: this.progressValue,
    notes,
    mood
  });
  
  // Check milestones
  this.milestones.forEach(milestone => {
    if (!milestone.completed && this.progressValue >= milestone.targetValue) {
      milestone.completed = true;
      milestone.completedAt = new Date();
    }
  });
  
  // Update user goal stats if completed
  if (this.completed && previousValue < this.targetValue) {
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);
    if (user) {
      await user.updateGoalStats();
    }
  }
  
  return await this.save();
};

// Instance method to add milestone
goalSchema.methods.addMilestone = function(title, targetValue, reward = '') {
  this.milestones.push({
    title,
    targetValue,
    reward,
    completed: this.progressValue >= targetValue,
    completedAt: this.progressValue >= targetValue ? new Date() : null
  });
  
  // Sort milestones by target value
  this.milestones.sort((a, b) => a.targetValue - b.targetValue);
};

// Instance method to extend deadline
goalSchema.methods.extendDeadline = function(days) {
  const newDeadline = new Date(this.deadline);
  newDeadline.setDate(newDeadline.getDate() + days);
  this.deadline = newDeadline;
  
  if (this.status === 'failed') {
    this.status = 'active';
  }
};

// Static method to find goals by status
goalSchema.statics.findByStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ priority: -1, deadline: 1 });
};

// Static method to find overdue goals
goalSchema.statics.findOverdue = function(userId = null) {
  const query = {
    deadline: { $lt: new Date() },
    completed: false,
    status: 'active'
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query);
};

// Static method to find goals needing reminders
goalSchema.statics.findNeedingReminders = function() {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return this.find({
    'reminders.enabled': true,
    'reminders.time': currentTime,
    status: 'active',
    completed: false
  }).populate('userId', 'name email preferences');
};

// Static method to get goal statistics
goalSchema.statics.getGoalStats = function(userId, days = 30) {
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
        totalGoals: { $sum: 1 },
        completedGoals: {
          $sum: { $cond: ['$completed', 1, 0] }
        },
        activeGoals: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        overdueGoals: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        avgCompletionRate: { $avg: '$completionPercentage' },
        categories: { $push: '$category' },
        totalStreak: { $sum: '$streak.current' }
      }
    },
    {
      $project: {
        totalGoals: 1,
        completedGoals: 1,
        activeGoals: 1,
        overdueGoals: 1,
        completionRate: { $round: ['$avgCompletionRate', 1] },
        totalStreak: 1,
        mostCommonCategory: {
          $arrayElemAt: [
            {
              $map: {
                input: { $setUnion: '$categories' },
                as: 'category',
                in: {
                  category: '$$category',
                  count: {
                    $size: {
                      $filter: {
                        input: '$categories',
                        cond: { $eq: ['$$this', '$$category'] }
                      }
                    }
                  }
                }
              }
            },
            0
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Goal', goalSchema);