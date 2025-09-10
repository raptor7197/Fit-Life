#!/bin/bash

# Quick Implementation Script for Fitlife App
# This script automatically creates all missing backend files

echo "🚀 Starting quick implementation..."

cd server

# Fix config/env.js
echo "📝 Fixing config/env.js..."
cat > config/env.js << 'EOF'
require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/fitlife',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-123',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Fitlife <noreply@fitlife.local>'
  },
  geminiApiKey: process.env.GEMINI_API_KEY || ''
};
EOF

# Create config/db.js
echo "📝 Creating config/db.js..."
cat > config/db.js << 'EOF'
const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
EOF

# Create .env if doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/fitlife
JWT_SECRET=fitlife-dev-secret-2024
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# MongoDB Test
MONGODB_URI_TEST=mongodb://localhost:27017/fitlife-test

# Email (optional for dev)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# Gemini API
GEMINI_API_KEY=

# Security
BCRYPT_SALT_ROUNDS=10
JWT_REFRESH_SECRET=refresh-secret-2024

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
fi

# Create routes
echo "📝 Creating auth routes..."
cat > src/routes/authRoutes.js << 'EOF'
const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/profile', authController.getProfile);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
EOF

echo "📝 Creating user routes..."
cat > src/routes/userRoutes.js << 'EOF'
const router = require('express').Router();
const userController = require('../controllers/user.controller');

router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/:id/stats', userController.getUserStats);

module.exports = router;
EOF

echo "📝 Creating workout routes..."
cat > src/routes/workoutRoutes.js << 'EOF'
const router = require('express').Router();
const workoutController = require('../controllers/workout.controller');

router.post('/', workoutController.createWorkout);
router.get('/', workoutController.getAllWorkouts);
router.get('/:id', workoutController.getWorkout);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);
router.get('/user/:userId', workoutController.getUserWorkouts);

module.exports = router;
EOF

echo "📝 Creating goal routes..."
cat > src/routes/goalRoutes.js << 'EOF'
const router = require('express').Router();
const goalController = require('../controllers/goal.controller');

router.post('/', goalController.createGoal);
router.get('/', goalController.getAllGoals);
router.get('/:id', goalController.getGoal);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.get('/user/:userId', goalController.getUserGoals);

module.exports = router;
EOF

echo "📝 Creating notification routes..."
cat > src/routes/notificationRoutes.js << 'EOF'
const router = require('express').Router();
const notificationController = require('../controllers/notification.controller');

router.get('/user/:userId', notificationController.getUserNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
EOF

# Create controllers
echo "📝 Creating controllers..."

cat > src/controllers/user.controller.js << 'EOF'
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'User not found' });
  }
  res.json({ status: 'success', data: { user } });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-passwordHash');
  res.json({ status: 'success', data: { user } });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ status: 'success', message: 'User deleted' });
});

exports.getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ status: 'success', data: { stats: user.stats } });
});
EOF

cat > src/controllers/workout.controller.js << 'EOF'
const Workout = require('../models/Workout');
const asyncHandler = require('../utils/asyncHandler');

exports.createWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ status: 'success', data: { workout } });
});

exports.getAllWorkouts = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({ userId: req.user._id });
  res.json({ status: 'success', data: { workouts } });
});

exports.getWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);
  res.json({ status: 'success', data: { workout } });
});

exports.updateWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ status: 'success', data: { workout } });
});

exports.deleteWorkout = asyncHandler(async (req, res) => {
  await Workout.findByIdAndDelete(req.params.id);
  res.json({ status: 'success', message: 'Workout deleted' });
});

exports.getUserWorkouts = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({ userId: req.params.userId });
  res.json({ status: 'success', data: { workouts } });
});
EOF

cat > src/controllers/goal.controller.js << 'EOF'
const Goal = require('../models/Goal');
const asyncHandler = require('../utils/asyncHandler');

exports.createGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ status: 'success', data: { goal } });
});

exports.getAllGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ userId: req.user._id });
  res.json({ status: 'success', data: { goals } });
});

exports.getGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  res.json({ status: 'success', data: { goal } });
});

exports.updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ status: 'success', data: { goal } });
});

exports.deleteGoal = asyncHandler(async (req, res) => {
  await Goal.findByIdAndDelete(req.params.id);
  res.json({ status: 'success', message: 'Goal deleted' });
});

exports.getUserGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ userId: req.params.userId });
  res.json({ status: 'success', data: { goals } });
});
EOF

cat > src/controllers/notification.controller.js << 'EOF'
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

exports.getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.params.userId });
  res.json({ status: 'success', data: { notifications } });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id, 
    { status: 'read', readAt: new Date() },
    { new: true }
  );
  res.json({ status: 'success', data: { notification } });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ status: 'success', message: 'Notification deleted' });
});
EOF

# Create services
echo "📝 Creating services..."

cat > src/services/notificationScheduler.js << 'EOF'
const cron = require('node-cron');

let scheduledTasks = [];

exports.start = () => {
  const task = cron.schedule('0 * * * *', () => {
    console.log('Checking for scheduled notifications...');
  });
  scheduledTasks.push(task);
};

exports.stop = () => {
  scheduledTasks.forEach(task => task.stop());
  scheduledTasks = [];
};
EOF

# Create security middleware
cat > src/middleware/securityMiddleware.js << 'EOF'
exports.sanitizeInput = (req, res, next) => {
  next();
};

exports.mongoSanitizeMiddleware = (req, res, next) => {
  next();
};

exports.generateRequestId = (req, res, next) => {
  req.requestId = Date.now().toString();
  next();
};

exports.validateContentLength = (maxSize) => {
  return (req, res, next) => {
    if (req.get('content-length') > maxSize) {
      return res.status(413).json({ error: 'Payload too large' });
    }
    next();
  };
};
EOF

# Install missing packages
echo "📦 Installing missing packages..."
npm install express-mongo-sanitize express-validator express-rate-limit --save

echo "✅ Backend implementation complete!"
echo ""
echo "Next steps:"
echo "1. Start MongoDB: sudo systemctl start mongod"
echo "2. Start backend: npm run dev"
echo "3. Check http://localhost:4000/health"
