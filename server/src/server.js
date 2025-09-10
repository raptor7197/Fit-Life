const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const goalRoutes = require('./routes/goalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/authMiddleware');
const { generalLimiter } = require('./middleware/rateLimiter');
const {
  sanitizeInput,
  mongoSanitizeMiddleware,
  generateRequestId,
  validateContentLength
} = require('./middleware/securityMiddleware');

// Initialize notification scheduler
const notificationScheduler = require('./services/notificationScheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security Middleware (before body parsing)
app.use(generateRequestId);
app.use(validateContentLength(10 * 1024 * 1024)); // 10MB limit

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Input Sanitization and Security
app.use(mongoSanitizeMiddleware);
app.use(sanitizeInput);

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting
app.use('/api/', generalLimiter);

// Database Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_URI_TEST 
      : process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.log('⚠️  No MongoDB URI provided - running in mock mode');
      return;
    }
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    
    // Start notification scheduler after DB connection
    if (process.env.NODE_ENV !== 'test') {
      notificationScheduler.start();
      console.log('📅 Notification scheduler started');
    }
  } catch (error) {
    console.error('⚠️ MongoDB connection failed, running without database:', error.message);
    console.log('💡 To connect to MongoDB, set MONGODB_URI in your .env file');
  }
};

// Connect to Database
connectDB();

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'FitLife Gym Buddy API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/workouts', authMiddleware, workoutRoutes);
app.use('/api/goals', authMiddleware, goalRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

// API Documentation
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to FitLife Gym Buddy API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile'
      },
      users: {
        'GET /api/users/:id': 'Get user details',
        'PUT /api/users/:id': 'Update user info',
        'DELETE /api/users/:id': 'Delete user'
      },
      workouts: {
        'POST /api/workouts': 'Create workout',
        'GET /api/workouts/:id': 'Get workout',
        'GET /api/workouts/user/:userId': 'Get user workouts',
        'PUT /api/workouts/:id': 'Update workout',
        'DELETE /api/workouts/:id': 'Delete workout'
      },
      goals: {
        'POST /api/goals': 'Create goal',
        'GET /api/goals/:id': 'Get goal',
        'GET /api/goals/user/:userId': 'Get user goals',
        'PUT /api/goals/:id': 'Update goal',
        'DELETE /api/goals/:id': 'Delete goal'
      },
      notifications: {
        'POST /api/notifications': 'Create notification',
        'GET /api/notifications/user/:userId': 'Get user notifications',
        'PUT /api/notifications/:id': 'Mark as read',
        'DELETE /api/notifications/:id': 'Delete notification'
      }
    },
    documentation: 'Visit /health for system status'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down server...');
  
  try {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    
    notificationScheduler.stop();
    console.log('⏹️  Notification scheduler stopped');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  });
}

module.exports = app;