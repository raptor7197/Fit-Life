const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const { connectDB, clearDB, closeDB } = require('../../setup');

describe('User Model', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  describe('Schema Validation', () => {
    it('should create a valid user with required fields', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword123',
        age: 25
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.userId).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.createdAt).toBeDefined();
    });

    it('should fail validation with missing required fields', async () => {
      const user = new User({});

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.passwordHash).toBeDefined();
    });

    it('should fail validation with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        passwordHash: 'hashedpassword123',
        age: 25
      };

      const user = new User(userData);

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should enforce unique email constraint', async () => {
      const userData1 = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword123',
        age: 25
      };

      const userData2 = {
        name: 'Jane Doe',
        email: 'john@example.com', // Same email
        passwordHash: 'hashedpassword456',
        age: 28
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);

      let error;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    it('should validate age constraints', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword123',
        age: 12 // Below minimum age
      };

      const user = new User(userData);

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.age).toBeDefined();
    });
  });

  describe('Virtual Properties', () => {
    it('should calculate BMI correctly', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword123',
        age: 25,
        profile: {
          height: 175, // cm
          weight: 70   // kg
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();

      // BMI = weight / (height/100)^2
      const expectedBMI = 70 / Math.pow(175/100, 2);
      expect(savedUser.bmi).toBeCloseTo(expectedBMI, 1);
    });

    it('should return null BMI when height or weight is missing', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword123',
        age: 25,
        profile: {
          height: 175
          // weight missing
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.bmi).toBeNull();
    });
  });

  describe('Instance Methods', () => {
    it('should compare password correctly with comparePassword method', async () => {
      const bcrypt = require('bcrypt');
      const plainPassword = 'testpassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: hashedPassword,
        age: 25
      };

      const user = new User(userData);
      const savedUser = await user.save();

      const isValidPassword = await savedUser.comparePassword(plainPassword);
      const isInvalidPassword = await savedUser.comparePassword('wrongpassword');

      expect(isValidPassword).toBe(true);
      expect(isInvalidPassword).toBe(false);
    });

    it('should update workout stats correctly', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword123',
        age: 25
      };

      const user = new User(userData);
      const savedUser = await user.save();

      await savedUser.updateWorkoutStats(45, 300); // 45 minutes, 300 calories

      expect(savedUser.stats.totalWorkouts).toBe(1);
      expect(savedUser.stats.totalMinutesExercised).toBe(45);
      expect(savedUser.stats.totalCaloriesBurned).toBe(300);
      expect(savedUser.stats.averageWorkoutDuration).toBe(45);
    });

    it('should update streak correctly', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword123',
        age: 25
      };

      const user = new User(userData);
      const savedUser = await user.save();

      await savedUser.updateStreak(true); // Continue/start streak

      expect(savedUser.stats.currentStreak).toBe(1);
      expect(savedUser.stats.longestStreak).toBe(1);

      await savedUser.updateStreak(false); // Break streak

      expect(savedUser.stats.currentStreak).toBe(0);
      expect(savedUser.stats.longestStreak).toBe(1);
    });
  });

  describe('Pre-save Middleware', () => {
    it('should hash password on save', async () => {
      const plainPassword = 'testpassword123';
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: plainPassword,
        age: 25
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.passwordHash).not.toBe(plainPassword);
      expect(savedUser.passwordHash.startsWith('$2b$')).toBe(true);
    });

    it('should set default values', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword123',
        age: 25
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.isActive).toBe(true);
      expect(savedUser.profile.fitnessLevel).toBe('beginner');
      expect(savedUser.preferences.notificationsEnabled).toBe(true);
      expect(savedUser.preferences.weeklyGoal).toBe(3);
      expect(savedUser.stats.currentStreak).toBe(0);
      expect(savedUser.stats.totalWorkouts).toBe(0);
    });
  });

  describe('JSON Output', () => {
    it('should exclude sensitive fields in toJSON', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword123',
        age: 25
      };

      const user = new User(userData);
      const savedUser = await user.save();
      const userJSON = savedUser.toJSON();

      expect(userJSON.passwordHash).toBeUndefined();
      expect(userJSON.name).toBe(userData.name);
      expect(userJSON.email).toBe(userData.email);
    });
  });

  describe('Static Methods', () => {
    it('should find active users', async () => {
      const activeUser = new User({
        name: 'Active User',
        email: 'active@example.com',
        passwordHash: 'hashedpassword123',
        age: 25,
        isActive: true
      });

      const inactiveUser = new User({
        name: 'Inactive User',
        email: 'inactive@example.com',
        passwordHash: 'hashedpassword123',
        age: 25,
        isActive: false
      });

      await activeUser.save();
      await inactiveUser.save();

      const activeUsers = await User.find({ isActive: true });

      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0].name).toBe('Active User');
    });
  });
});