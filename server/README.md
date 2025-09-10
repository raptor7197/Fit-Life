# Fitlife App Backend

Gym Buddy backend built with Express.js, MongoDB, and Google Gemini AI integration.

## Features

- **User Management**: Registration, login, profile management
- **Workouts**: Create, track, and update workout sessions
- **Goals**: Set daily/weekly fitness goals with progress tracking
- **Notifications**: Smart reminders and achievement notifications
- **AI Recommendations**: Personalized tips powered by Google Gemini

## Tech Stack

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT
- **Testing**: Jest + Supertest
- **Scheduler**: node-cron
- **Email**: Nodemailer
- **Security**: Helmet, bcrypt, CORS

## Setup

1. Clone and navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. Start MongoDB locally or use MongoDB Atlas

5. Run development server:
   ```bash
   npm run dev
   ```

## Testing

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get logged-in user profile

### Users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Workouts
- `POST /workouts` - Create workout
- `GET /workouts/:id` - Get workout
- `GET /workouts/user/:userId` - Get user's workouts
- `PUT /workouts/:id` - Update workout
- `DELETE /workouts/:id` - Delete workout

### Goals
- `POST /goals` - Create goal
- `GET /goals/:id` - Get goal
- `GET /goals/user/:userId` - Get user's goals
- `PUT /goals/:id` - Update goal progress
- `DELETE /goals/:id` - Delete goal

### Notifications
- `POST /notifications` - Create notification
- `GET /notifications/user/:userId` - Get user's notifications
- `PUT /notifications/:id` - Mark as read
- `DELETE /notifications/:id` - Delete notification

## Docker

Build and run with Docker Compose:
```bash
docker-compose up
```
