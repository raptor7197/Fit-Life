const cron = require('node-cron');
const User = require('../models/User');
const Goal = require('../models/Goal');
const Notification = require('../models/Notification');
const geminiService = require('./geminiService');
const emailService = require('./emailService');

class NotificationScheduler {
  constructor() {
    this.isRunning = false;
    this.jobs = new Map();
  }

  /**
   * Start all scheduled notification jobs
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Notification scheduler already running');
      return;
    }

    console.log('🚀 Starting notification scheduler...');
    
    // Daily reminder check - every hour
    this.jobs.set('dailyReminders', cron.schedule('0 * * * *', () => {
      this.checkDailyReminders();
    }, {
      scheduled: false
    }));

    // Goal deadline check - daily at 9 AM
    this.jobs.set('goalDeadlines', cron.schedule('0 9 * * *', () => {
      this.checkGoalDeadlines();
    }, {
      scheduled: false
    }));

    // Workout streak check - daily at 8 PM
    this.jobs.set('workoutStreaks', cron.schedule('0 20 * * *', () => {
      this.checkWorkoutStreaks();
    }, {
      scheduled: false
    }));

    // Weekly progress report - Sundays at 6 PM
    this.jobs.set('weeklyProgress', cron.schedule('0 18 * * 0', () => {
      this.sendWeeklyProgressReports();
    }, {
      scheduled: false
    }));

    // Motivational messages - daily at random times
    this.jobs.set('motivation', cron.schedule('0 10,14,18 * * *', () => {
      this.sendMotivationalMessages();
    }, {
      scheduled: false
    }));

    // Cleanup expired notifications - daily at 2 AM
    this.jobs.set('cleanup', cron.schedule('0 2 * * *', () => {
      this.cleanupExpiredNotifications();
    }, {
      scheduled: false
    }));

    // Start all jobs
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`✅ Started ${name} scheduler`);
    });

    this.isRunning = true;
    console.log('📅 All notification schedulers started successfully');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Notification scheduler not running');
      return;
    }

    console.log('⏹️  Stopping notification scheduler...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`🛑 Stopped ${name} scheduler`);
    });

    this.isRunning = false;
    console.log('📅 Notification scheduler stopped');
  }

  /**
   * Check for users who need daily workout reminders
   */
  async checkDailyReminders() {
    try {
      console.log('🔔 Checking daily reminders...');
      
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Find users whose reminder time matches current time (within 5 minutes)
      const users = await User.find({
        isActive: true,
        'preferences.notificationsEnabled': true,
        'preferences.reminderTime': {
          $gte: this.subtractMinutes(currentTime, 2),
          $lte: this.addMinutes(currentTime, 2)
        }
      });

      console.log(`Found ${users.length} users for reminders at ${currentTime}`);

      for (const user of users) {
        await this.createDailyReminder(user);
      }
    } catch (error) {
      console.error('Error checking daily reminders:', error);
    }
  }

  /**
   * Check for goals approaching deadlines
   */
  async checkGoalDeadlines() {
    try {
      console.log('🎯 Checking goal deadlines...');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      // Find goals due within 1 day or 1 week
      const upcomingGoals = await Goal.find({
        status: 'active',
        completed: false,
        deadline: { 
          $gte: new Date(), 
          $lte: nextWeek 
        }
      }).populate('userId', 'name email preferences');

      for (const goal of upcomingGoals) {
        if (!goal.userId.preferences.notificationsEnabled) continue;
        
        const daysRemaining = Math.ceil((goal.deadline - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining === 1) {
          await this.createGoalDeadlineNotification(goal, 'urgent');
        } else if (daysRemaining === 7) {
          await this.createGoalDeadlineNotification(goal, 'reminder');
        }
      }
    } catch (error) {
      console.error('Error checking goal deadlines:', error);
    }
  }

  /**
   * Check workout streaks and send encouragement
   */
  async checkWorkoutStreaks() {
    try {
      console.log('🔥 Checking workout streaks...');
      
      const users = await User.find({
        isActive: true,
        'preferences.notificationsEnabled': true
      });

      for (const user of users) {
        const streak = user.stats.currentStreak;
        
        // Send congratulations for streak milestones
        if (streak > 0 && streak % 7 === 0) { // Weekly milestones
          await this.createStreakCelebration(user, streak);
        }
        
        // Send encouragement for broken streaks
        if (streak === 0) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (user.lastActive < yesterday) {
            await this.createStreakRecoveryNotification(user);
          }
        }
      }
    } catch (error) {
      console.error('Error checking workout streaks:', error);
    }
  }

  /**
   * Send weekly progress reports
   */
  async sendWeeklyProgressReports() {
    try {
      console.log('📊 Sending weekly progress reports...');
      
      const users = await User.find({
        isActive: true,
        'preferences.notificationsEnabled': true
      });

      for (const user of users) {
        await this.createWeeklyProgressReport(user);
      }
    } catch (error) {
      console.error('Error sending weekly progress reports:', error);
    }
  }

  /**
   * Send motivational messages using AI
   */
  async sendMotivationalMessages() {
    try {
      console.log('💪 Sending motivational messages...');
      
      // Select a few random users to receive motivational messages
      const users = await User.aggregate([
        { 
          $match: { 
            isActive: true,
            'preferences.notificationsEnabled': true
          }
        },
        { $sample: { size: 50 } } // Random sample of 50 users
      ]);

      for (const user of users) {
        // Only send if user hasn't received a motivational message today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingNotification = await Notification.findOne({
          userId: user._id,
          type: 'encouragement',
          createdAt: { $gte: today }
        });

        if (!existingNotification) {
          await this.createMotivationalNotification(user);
        }
      }
    } catch (error) {
      console.error('Error sending motivational messages:', error);
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications() {
    try {
      console.log('🧹 Cleaning up expired notifications...');
      
      const result = await Notification.cleanupExpired();
      console.log(`🗑️  Cleaned up ${result.deletedCount} expired notifications`);
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }

  /**
   * Create daily workout reminder notification
   */
  async createDailyReminder(user) {
    try {
      const messages = [
        `Hi ${user.name}! Time for your daily workout. Your fitness goals are waiting! 💪`,
        `${user.name}, let's keep that ${user.stats.currentStreak}-day streak going! Time to exercise! 🔥`,
        `Ready for today's workout, ${user.name}? Your future self will thank you! 🏃‍♀️`,
        `${user.name}, consistency is key! Let's make today count with a great workout! ⚡`
      ];

      await Notification.create({
        userId: user._id,
        type: 'reminder',
        category: 'workout',
        title: 'Daily Workout Reminder',
        message: messages[Math.floor(Math.random() * messages.length)],
        priority: 'normal',
        channels: ['in-app', ...(user.preferences.emailNotifications ? ['email'] : [])],
        metadata: {
          actionUrl: '/workouts',
          actionLabel: 'Start Workout'
        }
      });

      console.log(`📝 Created daily reminder for ${user.name}`);
    } catch (error) {
      console.error(`Error creating daily reminder for user ${user._id}:`, error);
    }
  }

  /**
   * Create goal deadline notification
   */
  async createGoalDeadlineNotification(goal, urgency) {
    try {
      const daysRemaining = Math.ceil((goal.deadline - new Date()) / (1000 * 60 * 60 * 24));
      const isUrgent = urgency === 'urgent';
      
      const title = isUrgent ? '⏰ Goal Deadline Tomorrow!' : '📅 Goal Deadline Approaching';
      const message = isUrgent 
        ? `Your goal "${goal.title}" is due tomorrow! You're ${goal.completionPercentage}% complete.`
        : `Your goal "${goal.title}" is due in ${daysRemaining} days. You're ${goal.completionPercentage}% complete.`;

      await Notification.create({
        userId: goal.userId._id,
        type: 'goal-deadline',
        category: 'goal',
        title,
        message,
        priority: isUrgent ? 'high' : 'normal',
        channels: ['in-app', ...(goal.userId.preferences.emailNotifications ? ['email'] : [])],
        metadata: {
          relatedId: goal.goalId,
          relatedModel: 'Goal',
          actionUrl: `/goals/${goal._id}`,
          actionLabel: 'Update Goal'
        }
      });

      console.log(`🎯 Created ${urgency} goal deadline notification for ${goal.userId.name}`);
    } catch (error) {
      console.error(`Error creating goal deadline notification:`, error);
    }
  }

  /**
   * Create streak celebration notification
   */
  async createStreakCelebration(user, streak) {
    try {
      await Notification.create({
        userId: user._id,
        type: 'achievement',
        category: 'achievement',
        title: `🔥 ${streak} Day Streak!`,
        message: `Congratulations ${user.name}! You've maintained a ${streak}-day workout streak. Keep up the amazing work!`,
        priority: 'high',
        channels: ['in-app', ...(user.preferences.emailNotifications ? ['email'] : [])],
        metadata: {
          actionUrl: '/stats',
          actionLabel: 'View Stats',
          customData: {
            streakDays: streak,
            achievementType: 'streak'
          }
        }
      });

      console.log(`🏆 Created streak celebration for ${user.name} (${streak} days)`);
    } catch (error) {
      console.error(`Error creating streak celebration:`, error);
    }
  }

  /**
   * Create streak recovery notification
   */
  async createStreakRecoveryNotification(user) {
    try {
      await Notification.create({
        userId: user._id,
        type: 'encouragement',
        category: 'workout',
        title: 'Ready for a Fresh Start?',
        message: `${user.name}, every champion has setbacks. Let's get back on track and start a new streak today! 💪`,
        priority: 'normal',
        channels: ['in-app'],
        metadata: {
          actionUrl: '/workouts',
          actionLabel: 'Start Workout'
        }
      });

      console.log(`🎯 Created streak recovery notification for ${user.name}`);
    } catch (error) {
      console.error(`Error creating streak recovery notification:`, error);
    }
  }

  /**
   * Create weekly progress report
   */
  async createWeeklyProgressReport(user) {
    try {
      // This would typically include detailed analytics
      // For now, creating a simple progress notification
      
      await Notification.create({
        userId: user._id,
        type: 'system',
        category: 'system',
        title: '📊 Your Weekly Progress Report',
        message: `${user.name}, your weekly fitness report is ready! Check out your achievements and get personalized insights.`,
        priority: 'normal',
        channels: ['in-app', ...(user.preferences.emailNotifications ? ['email'] : [])],
        metadata: {
          actionUrl: '/stats?period=week',
          actionLabel: 'View Report'
        }
      });

      console.log(`📈 Created weekly progress report for ${user.name}`);
    } catch (error) {
      console.error(`Error creating weekly progress report:`, error);
    }
  }

  /**
   * Create AI-powered motivational notification
   */
  async createMotivationalNotification(user) {
    try {
      // Try to get AI-generated motivation, fallback to preset messages
      let motivationalMessage;
      
      try {
        const recommendation = await geminiService.generateRecommendations(user._id);
        motivationalMessage = recommendation.content.substring(0, 200) + '...';
      } catch (error) {
        const messages = [
          `${user.name}, every workout brings you closer to your goals! 🎯`,
          `Remember ${user.name}, progress not perfection. Keep moving forward! 🚀`,
          `${user.name}, your only competition is who you were yesterday! 💪`,
          `Small steps daily lead to big changes yearly, ${user.name}! 📈`
        ];
        motivationalMessage = messages[Math.floor(Math.random() * messages.length)];
      }

      await Notification.create({
        userId: user._id,
        type: 'encouragement',
        category: 'workout',
        title: 'Daily Motivation',
        message: motivationalMessage,
        priority: 'low',
        channels: ['in-app'],
        metadata: {
          actionUrl: '/workouts',
          actionLabel: 'Get Started'
        }
      });

      console.log(`✨ Created motivational notification for ${user.name}`);
    } catch (error) {
      console.error(`Error creating motivational notification:`, error);
    }
  }

  /**
   * Helper methods for time manipulation
   */
  subtractMinutes(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins - minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  addMinutes(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      nextRuns: Array.from(this.jobs.entries()).map(([name, job]) => ({
        name,
        nextRun: job.nextDates ? job.nextDates(1)[0] : null
      }))
    };
  }
}

module.exports = new NotificationScheduler();