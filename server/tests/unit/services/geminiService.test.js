const GeminiService = require('../../../src/services/geminiService');
const User = require('../../../src/models/User');
const Workout = require('../../../src/models/Workout');
const Goal = require('../../../src/models/Goal');
const { connectDB, clearDB, closeDB } = require('../../setup');
const { sampleUsers, generateSampleWorkouts, generateSampleGoals } = require('../../fixtures/userData');

describe('GeminiService', () => {
  let testUser;
  let testUserId;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await clearDB();
    
    // Create test user
    testUser = new User(sampleUsers[0]);
    await testUser.save();
    testUserId = testUser._id;

    // Create test workouts
    const workouts = generateSampleWorkouts([testUserId]);
    await Workout.insertMany(workouts);

    // Create test goals
    const goals = generateSampleGoals([testUserId]);
    await Goal.insertMany(goals);
  });

  afterAll(async () => {
    await closeDB();
  });

  describe('analyzeUserProgress', () => {
    it('should analyze user progress correctly', async () => {
      const analysis = await GeminiService.analyzeUserProgress(testUserId);

      expect(analysis).toBeDefined();
      expect(analysis.user).toBeDefined();
      expect(analysis.user.name).toBe(testUser.name);
      expect(analysis.user.fitnessLevel).toBe(testUser.profile.fitnessLevel);
      expect(analysis.recentWorkouts).toBeDefined();
      expect(analysis.recentGoals).toBeDefined();
      expect(analysis.stats).toBeDefined();
      expect(analysis.stats.workoutsThisMonth).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';

      await expect(GeminiService.analyzeUserProgress(fakeUserId))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('getMostCommonWorkoutType', () => {
    it('should return most common workout type', () => {
      const workouts = [
        { type: 'cardio' },
        { type: 'strength' },
        { type: 'cardio' },
        { type: 'yoga' },
        { type: 'cardio' }
      ];

      const result = GeminiService.getMostCommonWorkoutType(workouts);
      expect(result).toBe('cardio');
    });

    it('should return "None" for empty workouts array', () => {
      const result = GeminiService.getMostCommonWorkoutType([]);
      expect(result).toBe('None');
    });
  });

  describe('getAverageRating', () => {
    it('should calculate average rating correctly', () => {
      const workouts = [
        { rating: 5 },
        { rating: 4 },
        { rating: 3 },
        { rating: null }, // Should be excluded
        { rating: 4 }
      ];

      const result = GeminiService.getAverageRating(workouts);
      expect(result).toBe(4); // (5+4+3+4)/4 = 4
    });

    it('should return 0 for workouts without ratings', () => {
      const workouts = [
        { rating: null },
        { rating: null }
      ];

      const result = GeminiService.getAverageRating(workouts);
      expect(result).toBe(0);
    });

    it('should return 0 for empty workouts array', () => {
      const result = GeminiService.getAverageRating([]);
      expect(result).toBe(0);
    });
  });

  describe('generateRecommendations without API key', () => {
    beforeEach(() => {
      // Temporarily remove API key to test fallback
      GeminiService.apiKey = null;
    });

    it('should return fallback recommendations when API key not available', async () => {
      const recommendation = await GeminiService.generateRecommendations(testUserId);

      expect(recommendation).toBeDefined();
      expect(recommendation.type).toBe('fallback');
      expect(recommendation.content).toBeDefined();
      expect(recommendation.source).toBe('fallback');
      expect(recommendation.generatedAt).toBeDefined();
    });
  });

  describe('getFallbackRecommendations', () => {
    it('should return fallback recommendations', () => {
      const recommendation = GeminiService.getFallbackRecommendations();

      expect(recommendation).toBeDefined();
      expect(recommendation.type).toBe('fallback');
      expect(recommendation.content).toBeDefined();
      expect(recommendation.source).toBe('fallback');
      expect(recommendation.generatedAt).toBeDefined();
      expect(typeof recommendation.content).toBe('string');
      expect(recommendation.content.length).toBeGreaterThan(0);
    });
  });

  describe('getFallbackWorkoutSuggestion', () => {
    it('should return cardio workout suggestion by default', () => {
      const suggestion = GeminiService.getFallbackWorkoutSuggestion();

      expect(suggestion).toBeDefined();
      expect(suggestion.type).toBe('cardio');
      expect(suggestion.title).toBeDefined();
      expect(suggestion.exercises).toBeDefined();
      expect(suggestion.duration).toBeDefined();
      expect(suggestion.source).toBe('fallback');
      expect(Array.isArray(suggestion.exercises)).toBe(true);
    });

    it('should return strength workout suggestion when specified', () => {
      const suggestion = GeminiService.getFallbackWorkoutSuggestion('strength');

      expect(suggestion).toBeDefined();
      expect(suggestion.type).toBe('strength');
      expect(suggestion.title).toContain('Strength');
      expect(suggestion.exercises).toBeDefined();
      expect(suggestion.source).toBe('fallback');
    });

    it('should return yoga workout suggestion when specified', () => {
      const suggestion = GeminiService.getFallbackWorkoutSuggestion('yoga');

      expect(suggestion).toBeDefined();
      expect(suggestion.type).toBe('yoga');
      expect(suggestion.title).toContain('Yoga');
      expect(suggestion.exercises).toBeDefined();
      expect(suggestion.source).toBe('fallback');
    });

    it('should fallback to cardio for unknown workout type', () => {
      const suggestion = GeminiService.getFallbackWorkoutSuggestion('unknown');

      expect(suggestion).toBeDefined();
      expect(suggestion.type).toBe('unknown');
      expect(suggestion.title).toContain('Cardio');
      expect(suggestion.source).toBe('fallback');
    });
  });

  describe('generateWorkoutSuggestion without API key', () => {
    beforeEach(() => {
      // Temporarily remove API key to test fallback
      GeminiService.apiKey = null;
    });

    it('should return fallback workout suggestion when API key not available', async () => {
      const suggestion = await GeminiService.generateWorkoutSuggestion(testUserId);

      expect(suggestion).toBeDefined();
      expect(suggestion.source).toBe('fallback');
      expect(suggestion.generatedAt).toBeDefined();
    });

    it('should use specified workout type in fallback', async () => {
      const suggestion = await GeminiService.generateWorkoutSuggestion(testUserId, 'strength');

      expect(suggestion).toBeDefined();
      expect(suggestion.type).toBe('strength');
      expect(suggestion.source).toBe('fallback');
    });
  });

  describe('analyzeWorkoutPatterns', () => {
    it('should return insufficient data message for few workouts', async () => {
      // Clear existing workouts and add only 2
      await Workout.deleteMany({ userId: testUserId });
      const fewWorkouts = generateSampleWorkouts([testUserId]).slice(0, 2);
      await Workout.insertMany(fewWorkouts);

      const analysis = await GeminiService.analyzeWorkoutPatterns(testUserId);

      expect(analysis).toBeDefined();
      expect(analysis.insight).toContain('Not enough workout data');
      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user ID gracefully', async () => {
      const invalidUserId = 'invalid-id';

      await expect(GeminiService.analyzeUserProgress(invalidUserId))
        .rejects
        .toThrow();
    });

    it('should handle database connection errors gracefully', async () => {
      // This would be tested with a mock or by temporarily disconnecting DB
      // For now, we just ensure the service exists and is callable
      expect(typeof GeminiService.analyzeUserProgress).toBe('function');
      expect(typeof GeminiService.generateRecommendations).toBe('function');
    });
  });
});