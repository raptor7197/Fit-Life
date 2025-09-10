const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Sample user data for testing
const sampleUsers = [
  {
    userId: uuidv4(),
    name: 'John Doe',
    email: 'john.doe@example.com',
    passwordHash: '$2b$10$K8gJvxvkqI.H2zQCfB3J0e3nKnXfF4lJ5nRyMrY8QZz5mN8Dz4M/6', // "password123"
    age: 28,
    profile: {
      height: 175,
      weight: 75,
      fitnessLevel: 'intermediate',
      fitnessGoals: ['muscle-gain', 'strength'],
      preferredWorkoutTypes: ['strength', 'cardio']
    },
    preferences: {
      notificationsEnabled: true,
      emailNotifications: true,
      reminderTime: '08:00',
      weeklyGoal: 4
    },
    isActive: true
  },
  {
    userId: uuidv4(),
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    passwordHash: '$2b$10$K8gJvxvkqI.H2zQCfB3J0e3nKnXfF4lJ5nRyMrY8QZz5mN8Dz4M/6', // "password123"
    age: 25,
    profile: {
      height: 165,
      weight: 60,
      fitnessLevel: 'beginner',
      fitnessGoals: ['weight-loss', 'general-fitness'],
      preferredWorkoutTypes: ['yoga', 'cardio']
    },
    preferences: {
      notificationsEnabled: true,
      emailNotifications: false,
      reminderTime: '07:30',
      weeklyGoal: 3
    },
    isActive: true
  },
  {
    userId: uuidv4(),
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash: '$2b$10$K8gJvxvkqI.H2zQCfB3J0e3nKnXfF4lJ5nRyMrY8QZz5mN8Dz4M/6', // "password123"
    age: 35,
    profile: {
      height: 180,
      weight: 80,
      fitnessLevel: 'advanced',
      fitnessGoals: ['strength', 'endurance'],
      preferredWorkoutTypes: ['strength', 'crossfit']
    },
    preferences: {
      notificationsEnabled: true,
      emailNotifications: true,
      reminderTime: '06:00',
      weeklyGoal: 6
    },
    isActive: true,
    isAdmin: true
  }
];

// Generate sample workout data
const generateSampleWorkouts = (userIds) => {
  const workoutTypes = ['cardio', 'strength', 'yoga', 'running'];
  const intensities = ['low', 'medium', 'high'];
  
  const workouts = [];
  
  userIds.forEach((userId, userIndex) => {
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 2));
      
      workouts.push({
        workoutId: uuidv4(),
        userId,
        title: `Sample ${workoutTypes[i % workoutTypes.length]} workout ${i + 1}`,
        description: `Test workout description ${i + 1}`,
        type: workoutTypes[i % workoutTypes.length],
        durationMinutes: 30 + (i * 15),
        intensity: intensities[i % intensities.length],
        date,
        completed: i < 3, // First 3 are completed
        completedAt: i < 3 ? date : null,
        exercises: [
          {
            name: 'Sample Exercise 1',
            sets: 3,
            reps: 12,
            weight: 20
          },
          {
            name: 'Sample Exercise 2',
            duration: 60,
            distance: 1.5
          }
        ],
        rating: i < 3 ? Math.floor(Math.random() * 5) + 1 : null,
        caloriesBurned: i < 3 ? 200 + (i * 50) : null
      });
    }
  });
  
  return workouts;
};

// Generate sample goals data
const generateSampleGoals = (userIds) => {
  const categories = ['weight-loss', 'muscle-gain', 'endurance', 'strength'];
  const types = ['weekly', 'monthly', 'daily'];
  const units = ['kg', 'minutes', 'workouts', 'km'];
  
  const goals = [];
  
  userIds.forEach((userId, userIndex) => {
    for (let i = 0; i < 3; i++) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (30 + (i * 10)));
      
      goals.push({
        goalId: uuidv4(),
        userId,
        title: `Sample Goal ${i + 1}`,
        description: `Test goal description ${i + 1}`,
        category: categories[i % categories.length],
        type: types[i % types.length],
        targetValue: 10 + (i * 5),
        progressValue: i * 2,
        unit: units[i % units.length],
        deadline,
        status: i === 0 ? 'completed' : 'active',
        completed: i === 0,
        completedAt: i === 0 ? new Date() : null,
        milestones: [
          {
            value: 5,
            achieved: true,
            achievedAt: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))
          }
        ]
      });
    }
  });
  
  return goals;
};

// Generate sample notifications
const generateSampleNotifications = (userIds) => {
  const types = ['reminder', 'achievement', 'goal-deadline', 'system'];
  const categories = ['workout', 'achievement', 'goal', 'system'];
  const priorities = ['low', 'normal', 'high'];
  
  const notifications = [];
  
  userIds.forEach((userId, userIndex) => {
    for (let i = 0; i < 4; i++) {
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - (i * 6));
      
      notifications.push({
        notificationId: uuidv4(),
        userId,
        type: types[i % types.length],
        category: categories[i % categories.length],
        title: `Test Notification ${i + 1}`,
        message: `This is a test notification message ${i + 1}`,
        priority: priorities[i % priorities.length],
        status: i < 2 ? 'read' : 'delivered',
        channels: ['in-app'],
        readAt: i < 2 ? createdAt : null,
        createdAt,
        metadata: {
          actionUrl: '/test',
          actionLabel: 'Test Action'
        }
      });
    }
  });
  
  return notifications;
};

module.exports = {
  sampleUsers,
  generateSampleWorkouts,
  generateSampleGoals,
  generateSampleNotifications
};