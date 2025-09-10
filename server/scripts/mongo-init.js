// MongoDB Initialization Script for FitLife Gym Buddy
print('🚀 Initializing FitLife MongoDB database...');

// Switch to the fitlife database
db = db.getSiblingDB('fitlife');

// Create application user with read/write permissions
db.createUser({
  user: 'fitlife_app',
  pwd: 'fitlife_app_password_change_in_production',
  roles: [
    {
      role: 'readWrite',
      db: 'fitlife'
    }
  ]
});

print('✅ Created application user: fitlife_app');

// Create indexes for better performance
print('📊 Creating database indexes...');

// Users collection indexes
db.users.createIndex({ 'userId': 1 }, { unique: true });
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'isActive': 1 });
db.users.createIndex({ 'createdAt': -1 });
db.users.createIndex({ 'lastActive': -1 });
print('✅ Users collection indexes created');

// Workouts collection indexes
db.workouts.createIndex({ 'workoutId': 1 }, { unique: true });
db.workouts.createIndex({ 'userId': 1 });
db.workouts.createIndex({ 'userId': 1, 'date': -1 });
db.workouts.createIndex({ 'userId': 1, 'completed': 1 });
db.workouts.createIndex({ 'type': 1 });
db.workouts.createIndex({ 'date': -1 });
db.workouts.createIndex({ 'completed': 1, 'completedAt': -1 });
print('✅ Workouts collection indexes created');

// Goals collection indexes
db.goals.createIndex({ 'goalId': 1 }, { unique: true });
db.goals.createIndex({ 'userId': 1 });
db.goals.createIndex({ 'userId': 1, 'status': 1 });
db.goals.createIndex({ 'userId': 1, 'deadline': 1 });
db.goals.createIndex({ 'category': 1 });
db.goals.createIndex({ 'type': 1 });
db.goals.createIndex({ 'deadline': 1 });
db.goals.createIndex({ 'completed': 1, 'completedAt': -1 });
print('✅ Goals collection indexes created');

// Notifications collection indexes
db.notifications.createIndex({ 'notificationId': 1 }, { unique: true });
db.notifications.createIndex({ 'userId': 1 });
db.notifications.createIndex({ 'userId': 1, 'status': 1 });
db.notifications.createIndex({ 'userId': 1, 'createdAt': -1 });
db.notifications.createIndex({ 'type': 1 });
db.notifications.createIndex({ 'status': 1 });
db.notifications.createIndex({ 'createdAt': -1 });
db.notifications.createIndex({ 'expiresAt': 1 }, { expireAfterSeconds: 0 });
print('✅ Notifications collection indexes created');

// Insert sample data for development (optional)
if (process.env.NODE_ENV !== 'production') {
  print('📝 Inserting sample development data...');
  
  // Sample user (password is 'password123')
  db.users.insertOne({
    userId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Demo User',
    email: 'demo@fitlife.com',
    passwordHash: '$2b$10$K8gJvxvkqI.H2zQCfB3J0e3nKnXfF4lJ5nRyMrY8QZz5mN8Dz4M/6',
    age: 25,
    profile: {
      height: 175,
      weight: 70,
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
    stats: {
      currentStreak: 0,
      longestStreak: 0,
      totalWorkouts: 0,
      totalMinutesExercised: 0,
      totalCaloriesBurned: 0,
      averageWorkoutDuration: 0,
      goalsCompleted: 0
    },
    isActive: true,
    createdAt: new Date(),
    lastActive: new Date()
  });
  
  print('✅ Sample development data inserted');
}

// Create collection validation schemas
print('🔒 Setting up collection validation schemas...');

// Users collection validation
db.runCommand({
  collMod: 'users',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'name', 'email', 'passwordHash'],
      properties: {
        userId: { bsonType: 'string' },
        name: { bsonType: 'string', minLength: 1, maxLength: 100 },
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        passwordHash: { bsonType: 'string' },
        age: { bsonType: 'int', minimum: 13, maximum: 120 },
        isActive: { bsonType: 'bool' }
      }
    }
  },
  validationAction: 'warn', // Use 'error' for strict validation
  validationLevel: 'moderate'
});

print('✅ Users collection validation schema set');

print('🎉 FitLife MongoDB initialization complete!');
print('📍 Database: fitlife');
print('👤 App User: fitlife_app');
print('🔍 Indexes: Created for all collections');
print('🛡️  Validation: Schema validation enabled');

// Print collection statistics
print('\n📈 Collection Statistics:');
print('Users:', db.users.countDocuments());
print('Workouts:', db.workouts.countDocuments());
print('Goals:', db.goals.countDocuments());
print('Notifications:', db.notifications.countDocuments());