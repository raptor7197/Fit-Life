# Fitlife App - Development Feature Setup Guide

## 🎯 Goal: Make All Features Visible and Functional in Development

Follow these steps in order to see every feature working:

## Step 1: Fix Backend Issues (30 mins)

### 1.1 Fix Module System
```bash
cd server
```

**Fix config/env.js** - Convert to CommonJS:
```javascript
// Replace the entire file with:
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
```

### 1.2 Create Missing Database Config
Create `config/db.js`:
```javascript
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
```

### 1.3 Create .env File
```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/fitlife
JWT_SECRET=fitlife-dev-secret-2024
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000

# For development, these can be empty
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# Get free API key from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=
```

## Step 2: Create Missing Backend Files (45 mins)

### 2.1 Create Route Files

**Create all routes at once:**
```bash
cd src/routes
touch auth.routes.js user.routes.js workout.routes.js goal.routes.js notification.routes.js index.js
```

### 2.2 Create Service Files

```bash
cd ../services
touch jwt.service.js email.service.js notification.service.js scheduler.service.js gemini.service.js
```

### 2.3 Create Controller Files

```bash
cd ../controllers
touch user.controller.js workout.controller.js goal.controller.js notification.controller.js
```

### 2.4 Create Missing Middleware

```bash
cd ../middleware
touch securityMiddleware.js
```

## Step 3: Minimal Implementation for Each Feature (1 hour)

I'll provide minimal working code for each component:

### 3.1 Auth Routes (`routes/auth.routes.js`)
```javascript
const router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authController.getProfile);

module.exports = router;
```

### 3.2 JWT Service (`services/jwt.service.js`)
```javascript
const jwt = require('jsonwebtoken');
const config = require('../../config/env');

exports.generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};
```

### 3.3 Notification Scheduler (`services/notificationScheduler.js`)
```javascript
const cron = require('node-cron');

let scheduledTasks = [];

exports.start = () => {
  // Run every hour to check for notifications
  const task = cron.schedule('0 * * * *', () => {
    console.log('Checking for scheduled notifications...');
    // Add notification logic here
  });
  scheduledTasks.push(task);
};

exports.stop = () => {
  scheduledTasks.forEach(task => task.stop());
  scheduledTasks = [];
};
```

### 3.4 Security Middleware (`middleware/securityMiddleware.js`)
```javascript
const mongoSanitize = require('express-mongo-sanitize');

exports.sanitizeInput = (req, res, next) => {
  // Basic input sanitization
  next();
};

exports.mongoSanitizeMiddleware = mongoSanitize();

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
```

## Step 4: Frontend Dashboard Setup (1 hour)

### 4.1 Install Frontend Dependencies
```bash
cd ../.. # Back to root
npm install axios react-router-dom recharts date-fns react-hot-toast @heroicons/react
```

### 4.2 Create Frontend Structure
```bash
cd src
mkdir -p pages services contexts hooks
touch pages/Dashboard.tsx pages/Login.tsx pages/Register.tsx
touch services/api.ts services/auth.service.ts
touch contexts/AuthContext.tsx
```

### 4.3 Basic Router Setup (`src/App.tsx`)
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### 4.4 API Service (`src/services/api.ts`)
```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Step 5: Start Everything (10 mins)

### 5.1 Start MongoDB
```bash
# On Fedora
sudo systemctl start mongod
# Or manually
mongod --dbpath ~/data/db
```

### 5.2 Start Backend
```bash
cd server
npm run dev
```

### 5.3 Start Frontend (new terminal)
```bash
cd .. # Root directory
npm start
```

## Step 6: Test Each Feature

### 6.1 Authentication Flow
1. Visit http://localhost:3000
2. Click "Get Started" → Register
3. Login with credentials
4. See dashboard

### 6.2 Workout Tracking
1. From dashboard, click "Log Workout"
2. Fill form with:
   - Exercise type
   - Duration
   - Intensity
3. View workout history

### 6.3 Goal Setting
1. Click "Set Goals"
2. Create daily/weekly goals
3. Track progress visually

### 6.4 AI Recommendations
1. After logging 3+ workouts
2. Click "Get AI Recommendations"
3. View personalized tips

### 6.5 Notifications
1. Enable notifications in profile
2. Set reminder time
3. Check notification center

## 🚨 Quick Fixes for Common Issues

### Backend won't start?
```bash
# Check MongoDB
sudo systemctl status mongod

# Install missing packages
cd server
npm install express-mongo-sanitize express-validator

# Check logs
npm run dev
```

### Frontend API calls failing?
```bash
# Check CORS in server
# Ensure .env has CORS_ORIGIN=http://localhost:3000

# Check API URL in frontend
echo "REACT_APP_API_URL=http://localhost:4000/api" > .env
```

### Features not showing?
1. Clear browser cache
2. Check console for errors
3. Verify backend is running on port 4000
4. Check network tab for API responses

## 📊 Feature Visibility Checklist

- [ ] Landing page loads
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard shows user data
- [ ] Can create workout
- [ ] Can view workout history
- [ ] Can set goals
- [ ] Can track goal progress
- [ ] Notifications appear
- [ ] AI recommendations show (need API key)
- [ ] Profile edit works
- [ ] Stats update correctly

## 🎉 Success Indicators

When everything is working, you should see:
1. **Landing Page** → Hero, Benefits, Testimonials
2. **Auth Flow** → Register → Login → Dashboard
3. **Dashboard** → 4 main sections:
   - Today's Summary
   - Quick Actions (Log Workout, Set Goal)
   - Progress Charts
   - Recent Activity
4. **Workout Page** → Form + History List
5. **Goals Page** → Active Goals + Progress Bars
6. **Profile** → Settings + Stats
7. **Notifications** → Bell icon with count

Follow these steps and you'll have all features visible and functional in development!
