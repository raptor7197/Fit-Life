const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  age: {
    type: Number,
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age must be less than 120']
  },
  habits: {
    type: [String],
    default: [],
    validate: {
      validator: function(habits) {
        return habits.length <= 20;
      },
      message: 'Cannot have more than 20 habits'
    }
  },
  dailyGoals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  profile: {
    height: {
      type: Number,
      min: [50, 'Height must be at least 50cm'],
      max: [300, 'Height must be less than 300cm']
    },
    weight: {
      type: Number,
      min: [20, 'Weight must be at least 20kg'],
      max: [500, 'Weight must be less than 500kg']
    },
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'athlete'],
      default: 'beginner'
    },
    fitnessGoals: {
      type: [String],
      enum: ['weight-loss', 'muscle-gain', 'endurance', 'strength', 'flexibility', 'general-fitness'],
      default: ['general-fitness']
    },
    preferredWorkoutTypes: {
      type: [String],
      enum: ['cardio', 'strength', 'yoga', 'pilates', 'crossfit', 'swimming', 'running', 'cycling'],
      default: []
    }
  },
  preferences: {
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String,
      default: '20:00',
      validate: {
        validator: function(time) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        },
        message: 'Time must be in HH:MM format'
      }
    },
    weeklyGoal: {
      type: Number,
      default: 3,
      min: [1, 'Weekly goal must be at least 1'],
      max: [7, 'Weekly goal cannot exceed 7 days']
    }
  },
  stats: {
    totalWorkouts: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalMinutesExercised: {
      type: Number,
      default: 0
    },
    averageWorkoutDuration: {
      type: Number,
      default: 0
    },
    goalsCompleted: {
      type: Number,
      default: 0
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActive: -1 });

// Virtual for BMI calculation
userSchema.virtual('bmi').get(function() {
  if (this.profile.height && this.profile.weight) {
    const heightInMeters = this.profile.height / 100;
    return Math.round((this.profile.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }
  return null;
});

// Virtual for fitness level progress
userSchema.virtual('fitnessProgress').get(function() {
  const levels = ['beginner', 'intermediate', 'advanced', 'athlete'];
  const currentIndex = levels.indexOf(this.profile.fitnessLevel);
  return {
    current: this.profile.fitnessLevel,
    progress: (currentIndex + 1) / levels.length,
    next: currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
  };
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) return next();

  try {
    // Hash password with cost of 10
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update stats
userSchema.pre('save', function(next) {
  if (this.isModified('lastActive')) {
    this.lastActive = new Date();
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to update workout stats
userSchema.methods.updateWorkoutStats = async function(workoutDurationMinutes) {
  this.stats.totalWorkouts += 1;
  this.stats.totalMinutesExercised += workoutDurationMinutes;
  this.stats.averageWorkoutDuration = Math.round(
    this.stats.totalMinutesExercised / this.stats.totalWorkouts
  );
  
  // Update streak logic
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWorkout = new Date(this.lastActive);
  const isConsecutive = lastWorkout.toDateString() === yesterday.toDateString();
  
  if (isConsecutive) {
    this.stats.currentStreak += 1;
  } else {
    this.stats.currentStreak = 1;
  }
  
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
  
  this.lastActive = today;
  await this.save();
};

// Instance method to update goal completion stats
userSchema.methods.updateGoalStats = async function() {
  this.stats.goalsCompleted += 1;
  await this.save();
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Static method to find users who need reminders
userSchema.statics.findUsersNeedingReminders = function() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return this.find({
    isActive: true,
    'preferences.notificationsEnabled': true,
    lastActive: { $lt: yesterday }
  });
};

module.exports = mongoose.model('User', userSchema);