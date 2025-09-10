const axios = require('axios');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Goal = require('../models/Goal');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-pro';
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    
    if (!this.apiKey) {
      console.warn('⚠️ Gemini API key not provided. AI recommendations will be disabled.');
    }
  }

  /**
   * Make a request to Gemini API
   */
  async makeGeminiRequest(prompt) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/models/${this.model}:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
            stopSequences: []
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          params: {
            key: this.apiKey
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (response.data.candidates && response.data.candidates.length > 0) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response from Gemini API');
      }
    } catch (error) {
      if (error.response) {
        console.error('Gemini API Error:', error.response.data);
        throw new Error(`Gemini API Error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
      } else {
        console.error('Gemini Request Error:', error.message);
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  /**
   * Analyze user's workout and goal completion history
   */
  async analyzeUserProgress(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get last 30 days of data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentWorkouts = await Workout.find({
        userId,
        date: { $gte: thirtyDaysAgo }
      }).sort({ date: -1 });

      const recentGoals = await Goal.find({
        userId,
        createdAt: { $gte: thirtyDaysAgo }
      }).sort({ createdAt: -1 });

      // Prepare data for analysis
      const analysisData = {
        user: {
          name: user.name,
          fitnessLevel: user.profile.fitnessLevel,
          fitnessGoals: user.profile.fitnessGoals,
          currentStreak: user.stats.currentStreak,
          totalWorkouts: user.stats.totalWorkouts,
          averageWorkoutDuration: user.stats.averageWorkoutDuration,
          preferredWorkoutTypes: user.profile.preferredWorkoutTypes
        },
        recentWorkouts: recentWorkouts.map(workout => ({
          title: workout.title,
          type: workout.type,
          duration: workout.durationMinutes,
          intensity: workout.intensity,
          completed: workout.completed,
          date: workout.date,
          rating: workout.rating
        })),
        recentGoals: recentGoals.map(goal => ({
          title: goal.title,
          category: goal.category,
          type: goal.type,
          progress: goal.completionPercentage,
          status: goal.status,
          deadline: goal.deadline
        })),
        stats: {
          workoutsThisMonth: recentWorkouts.filter(w => w.completed).length,
          completedGoals: recentGoals.filter(g => g.completed).length,
          mostCommonWorkoutType: this.getMostCommonWorkoutType(recentWorkouts),
          averageWorkoutRating: this.getAverageRating(recentWorkouts)
        }
      };

      return analysisData;
    } catch (error) {
      console.error('Error analyzing user progress:', error);
      throw error;
    }
  }

  /**
   * Generate personalized recommendations using Gemini
   */
  async generateRecommendations(userId) {
    if (!this.apiKey) {
      return this.getFallbackRecommendations();
    }

    try {
      const analysisData = await this.analyzeUserProgress(userId);
      
      const prompt = `
You are a professional fitness coach analyzing a user's workout and goal data. Based on the following information, provide personalized fitness recommendations.

User Profile:
- Name: ${analysisData.user.name}
- Fitness Level: ${analysisData.user.fitnessLevel}
- Fitness Goals: ${analysisData.user.fitnessGoals.join(', ')}
- Current Streak: ${analysisData.user.currentStreak} days
- Total Workouts: ${analysisData.user.totalWorkouts}
- Average Workout Duration: ${analysisData.user.averageWorkoutDuration} minutes
- Preferred Workout Types: ${analysisData.user.preferredWorkoutTypes.join(', ')}

Recent Performance (Last 30 days):
- Workouts Completed: ${analysisData.stats.workoutsThisMonth}
- Goals Completed: ${analysisData.stats.completedGoals}
- Most Common Workout Type: ${analysisData.stats.mostCommonWorkoutType}
- Average Workout Rating: ${analysisData.stats.averageWorkoutRating}/5

Please provide:
1. 2-3 specific workout recommendations
2. 1-2 goal suggestions
3. General motivational advice
4. Areas for improvement

Keep the response motivational, practical, and under 300 words. Focus on actionable advice.
`;

      const response = await this.makeGeminiRequest(prompt);
      
      return {
        type: 'ai_generated',
        content: response,
        generatedAt: new Date(),
        source: 'gemini'
      };
    } catch (error) {
      console.error('Error generating Gemini recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  /**
   * Generate workout suggestions based on user preferences
   */
  async generateWorkoutSuggestion(userId, workoutType = null) {
    if (!this.apiKey) {
      return this.getFallbackWorkoutSuggestion(workoutType);
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const targetType = workoutType || user.profile.preferredWorkoutTypes[0] || 'cardio';
      
      const prompt = `
Create a ${targetType} workout plan for a ${user.profile.fitnessLevel} level fitness enthusiast.

User Details:
- Fitness Level: ${user.profile.fitnessLevel}
- Fitness Goals: ${user.profile.fitnessGoals.join(', ')}
- Average Workout Duration: ${user.stats.averageWorkoutDuration} minutes

Please provide:
1. Workout title
2. 5-8 specific exercises with sets/reps/duration
3. Estimated total duration
4. Difficulty level
5. Equipment needed (if any)

Format as JSON with this structure:
{
  "title": "workout title",
  "type": "${targetType}",
  "exercises": [
    {
      "name": "exercise name",
      "sets": 3,
      "reps": 12,
      "duration": 30,
      "notes": "form tips"
    }
  ],
  "estimatedDuration": 30,
  "difficulty": "intermediate",
  "equipment": ["dumbbells", "yoga mat"]
}
`;

      const response = await this.makeGeminiRequest(prompt);
      
      try {
        const workoutPlan = JSON.parse(response);
        return {
          ...workoutPlan,
          source: 'gemini',
          generatedAt: new Date()
        };
      } catch (parseError) {
        // If JSON parsing fails, return raw response
        return {
          title: `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} Workout`,
          description: response,
          source: 'gemini',
          generatedAt: new Date()
        };
      }
    } catch (error) {
      console.error('Error generating workout suggestion:', error);
      return this.getFallbackWorkoutSuggestion(workoutType);
    }
  }

  /**
   * Analyze workout completion patterns and provide insights
   */
  async analyzeWorkoutPatterns(userId) {
    try {
      const user = await User.findById(userId);
      const last60Days = new Date();
      last60Days.setDate(last60Days.getDate() - 60);

      const workouts = await Workout.find({
        userId,
        date: { $gte: last60Days }
      }).sort({ date: 1 });

      if (workouts.length < 5) {
        return {
          insight: "Not enough workout data for pattern analysis. Keep logging your workouts to get personalized insights!",
          recommendations: ["Log at least 5 workouts to unlock pattern analysis"]
        };
      }

      const prompt = `
Analyze the following workout data and provide insights about patterns, consistency, and recommendations:

${workouts.map(w => `
Date: ${w.date.toISOString().split('T')[0]}
Type: ${w.type}
Duration: ${w.durationMinutes} minutes
Intensity: ${w.intensity}
Completed: ${w.completed}
Rating: ${w.rating || 'N/A'}
`).join('\n')}

Provide insights about:
1. Workout consistency patterns
2. Preferred workout types and times
3. Performance trends
4. Recommendations for improvement

Keep response under 200 words and focus on actionable insights.
`;

      const response = await this.makeGeminiRequest(prompt);
      
      return {
        insight: response,
        analysisDate: new Date(),
        source: 'gemini'
      };
    } catch (error) {
      console.error('Error analyzing workout patterns:', error);
      return {
        insight: "Unable to analyze patterns at this time. Please try again later.",
        recommendations: ["Continue logging workouts regularly"]
      };
    }
  }

  /**
   * Helper methods
   */
  getMostCommonWorkoutType(workouts) {
    if (!workouts.length) return 'None';
    
    const typeCounts = {};
    workouts.forEach(workout => {
      typeCounts[workout.type] = (typeCounts[workout.type] || 0) + 1;
    });
    
    return Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);
  }

  getAverageRating(workouts) {
    const ratedWorkouts = workouts.filter(w => w.rating);
    if (!ratedWorkouts.length) return 0;
    
    const sum = ratedWorkouts.reduce((sum, w) => sum + w.rating, 0);
    return Math.round((sum / ratedWorkouts.length) * 10) / 10;
  }

  /**
   * Fallback recommendations when Gemini API is not available
   */
  getFallbackRecommendations() {
    const recommendations = [
      "Stay consistent with your workout routine - consistency is key to success!",
      "Try incorporating different types of exercises to work all muscle groups.",
      "Set realistic goals and celebrate small victories along the way.",
      "Listen to your body and ensure adequate rest between intense workouts.",
      "Track your progress regularly to stay motivated and see improvements."
    ];

    return {
      type: 'fallback',
      content: recommendations[Math.floor(Math.random() * recommendations.length)],
      generatedAt: new Date(),
      source: 'fallback'
    };
  }

  getFallbackWorkoutSuggestion(workoutType = 'cardio') {
    const workouts = {
      cardio: {
        title: "Quick Cardio Blast",
        exercises: ["Jumping Jacks", "High Knees", "Burpees", "Mountain Climbers"],
        duration: 20
      },
      strength: {
        title: "Strength Training Session",
        exercises: ["Push-ups", "Squats", "Lunges", "Plank"],
        duration: 30
      },
      yoga: {
        title: "Relaxing Yoga Flow",
        exercises: ["Sun Salutation", "Warrior Pose", "Tree Pose", "Savasana"],
        duration: 25
      }
    };

    const workout = workouts[workoutType] || workouts.cardio;
    
    return {
      ...workout,
      type: workoutType,
      source: 'fallback',
      generatedAt: new Date()
    };
  }
}

module.exports = new GeminiService();