const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const workoutSchema = new mongoose.Schema({
  workoutId: {
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
    required: [true, 'Workout title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Workout type is required'],
    enum: ['cardio', 'strength', 'yoga', 'pilates', 'crossfit', 'swimming', 'running', 'cycling', 'stretching', 'sports', 'dance', 'martial-arts']
  },
  category: {
    type: String,
    enum: ['endurance', 'strength', 'flexibility', 'balance', 'coordination', 'power'],
    default: 'endurance'
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  intensity: {
    type: String,
    required: [true, 'Intensity level is required'],
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  caloriesBurned: {
    type: Number,
    min: [0, 'Calories cannot be negative'],
    max: [2000, 'Calories seem too high for a single workout']
  },
  exercises: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Exercise name cannot exceed 100 characters']
    },
    sets: {
      type: Number,
      min: [1, 'Sets must be at least 1'],
      max: [20, 'Sets cannot exceed 20']
    },
    reps: {
      type: Number,
      min: [1, 'Reps must be at least 1'],
      max: [1000, 'Reps cannot exceed 1000']
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
      max: [500, 'Weight seems too high']
    },
    duration: {
      type: Number,
      min: [1, 'Exercise duration must be at least 1 second'],
      max: [3600, 'Exercise duration cannot exceed 1 hour']
    },
    distance: {
      type: Number,
      min: [0.01, 'Distance must be at least 0.01km'],
      max: [100, 'Distance cannot exceed 100km']
    },
    restTime: {
      type: Number,
      min: [0, 'Rest time cannot be negative'],
      max: [600, 'Rest time cannot exceed 10 minutes'],
      default: 60
    },
    notes: {
      type: String,
      maxlength: [200, 'Exercise notes cannot exceed 200 characters']
    }
  }],
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  date: {
    type: Date,
    required: [true, 'Workout date is required'],
    default: Date.now,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Workout date cannot be in the future'
    }
  },
  location: {
    type: String,
    enum: ['gym', 'home', 'outdoor', 'studio', 'pool', 'track', 'other'],
    default: 'home'
  },
  equipment: {
    type: [String],
    enum: ['dumbbells', 'barbell', 'kettlebell', 'resistance-bands', 'treadmill', 'bike', 'rowing-machine', 'yoga-mat', 'bench', 'pull-up-bar', 'none'],
    default: []
  },
  muscleGroups: {
    type: [String],
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'abs', 'legs', 'glutes', 'calves', 'cardio', 'full-body'],
    default: []
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5']
  },
  personalRecords: [{
    exercise: String,
    metric: {
      type: String,
      enum: ['weight', 'reps', 'duration', 'distance']
    },
    value: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  tags: {
    type: [String],
    validate: {
      validator: function(tags) {
        return tags.length <= 10;
      },
      message: 'Cannot have more than 10 tags'
    }
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    trim: true,
    maxlength: [100, 'Template name cannot exceed 100 characters']
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
workoutSchema.index({ userId: 1, date: -1 });
workoutSchema.index({ workoutId: 1 });
workoutSchema.index({ completed: 1 });
workoutSchema.index({ type: 1 });
workoutSchema.index({ date: -1 });
workoutSchema.index({ isTemplate: 1 });
workoutSchema.index({ isPublic: 1 });
workoutSchema.index({ tags: 1 });

// Virtual for total workout volume
workoutSchema.virtual('totalVolume').get(function() {
  if (!this.exercises || this.exercises.length === 0) return 0;
  
  return this.exercises.reduce((total, exercise) => {
    if (exercise.weight && exercise.sets && exercise.reps) {
      return total + (exercise.weight * exercise.sets * exercise.reps);
    }
    return total;
  }, 0);
});

// Virtual for estimated calories based on intensity and duration
workoutSchema.virtual('estimatedCalories').get(function() {
  if (this.caloriesBurned) return this.caloriesBurned;
  
  const baseCaloriesPerMinute = {
    low: 5,
    medium: 8,
    high: 12
  };
  
  return Math.round(this.durationMinutes * baseCaloriesPerMinute[this.intensity]);
});

// Virtual for workout efficiency score
workoutSchema.virtual('efficiencyScore').get(function() {
  if (!this.completed || !this.rating) return null;
  
  const durationScore = Math.min(this.durationMinutes / 60, 1); // Max 1 for 60+ minutes
  const intensityScore = { low: 0.5, medium: 0.75, high: 1 }[this.intensity];
  const ratingScore = this.rating / 5;
  
  return Math.round(((durationScore + intensityScore + ratingScore) / 3) * 100);
});

// Pre-save middleware to auto-complete if all exercises are done
workoutSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Auto-populate muscle groups based on exercise names
  if (this.exercises && this.exercises.length > 0 && this.muscleGroups.length === 0) {
    const muscleGroupKeywords = {
      chest: ['push-up', 'bench', 'chest', 'press', 'fly'],
      back: ['pull-up', 'row', 'lat', 'back', 'deadlift'],
      shoulders: ['shoulder', 'press', 'raise', 'shrug'],
      biceps: ['curl', 'bicep'],
      triceps: ['tricep', 'dip', 'extension'],
      abs: ['crunch', 'plank', 'abs', 'sit-up', 'core'],
      legs: ['squat', 'lunge', 'leg', 'calf'],
      glutes: ['glute', 'hip', 'bridge'],
      cardio: ['run', 'bike', 'cardio', 'treadmill']
    };
    
    const detectedGroups = new Set();
    this.exercises.forEach(exercise => {
      const exerciseName = exercise.name.toLowerCase();
      Object.entries(muscleGroupKeywords).forEach(([group, keywords]) => {
        if (keywords.some(keyword => exerciseName.includes(keyword))) {
          detectedGroups.add(group);
        }
      });
    });
    
    this.muscleGroups = Array.from(detectedGroups);
  }
  
  next();
});

// Instance method to mark as completed
workoutSchema.methods.markCompleted = async function(rating = null) {
  this.completed = true;
  this.completedAt = new Date();
  if (rating) this.rating = rating;
  
  // Update user stats
  const User = mongoose.model('User');
  const user = await User.findById(this.userId);
  if (user) {
    await user.updateWorkoutStats(this.durationMinutes);
  }
  
  return await this.save();
};

// Instance method to add personal record
workoutSchema.methods.addPersonalRecord = function(exercise, metric, value) {
  const existingRecord = this.personalRecords.find(
    pr => pr.exercise === exercise && pr.metric === metric
  );
  
  if (!existingRecord || value > existingRecord.value) {
    if (existingRecord) {
      existingRecord.value = value;
      existingRecord.date = new Date();
    } else {
      this.personalRecords.push({
        exercise,
        metric,
        value,
        date: new Date()
      });
    }
  }
};

// Static method to find workouts by date range
workoutSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: -1 });
};

// Static method to find workout templates
workoutSchema.statics.findTemplates = function(userId = null) {
  const query = { isTemplate: true };
  if (userId) {
    query.$or = [
      { userId },
      { isPublic: true }
    ];
  } else {
    query.isPublic = true;
  }
  
  return this.find(query).populate('userId', 'name');
};

// Static method to get workout statistics
workoutSchema.statics.getWorkoutStats = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        completed: true,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalMinutes: { $sum: '$durationMinutes' },
        totalCalories: { $sum: '$caloriesBurned' },
        avgRating: { $avg: '$rating' },
        workoutTypes: { $push: '$type' },
        intensityLevels: { $push: '$intensity' }
      }
    },
    {
      $project: {
        totalWorkouts: 1,
        totalMinutes: 1,
        totalCalories: 1,
        avgRating: { $round: ['$avgRating', 1] },
        avgDuration: { 
          $round: [{ $divide: ['$totalMinutes', '$totalWorkouts'] }, 0]
        },
        mostCommonType: {
          $arrayElemAt: [
            {
              $map: {
                input: { $setUnion: '$workoutTypes' },
                as: 'type',
                in: {
                  type: '$$type',
                  count: {
                    $size: {
                      $filter: {
                        input: '$workoutTypes',
                        cond: { $eq: ['$$this', '$$type'] }
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

module.exports = mongoose.model('Workout', workoutSchema);