import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decodedToken: { userId: string } = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await axios.get(`/api/users/${userId}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDashboardData(response.data.data.dashboard);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!dashboardData) {
    return <p>Loading...</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold mb-4">Dashboard</motion.h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border border-secondary rounded">
          <h2 className="text-xl font-bold">Welcome, {dashboardData.user.name}</h2>
          <p><strong>Fitness Level:</strong> {dashboardData.user.fitnessLevel}</p>
          <p><strong>Current Streak:</strong> {dashboardData.user.currentStreak} days</p>
        </div>

        <div className="p-4 border border-secondary rounded">
          <h2 className="text-xl font-bold">Today's Summary</h2>
          <p><strong>Workouts Completed:</strong> {dashboardData.today.completedWorkouts}</p>
          <p><strong>Total Minutes:</strong> {dashboardData.today.totalMinutes}</p>
        </div>

        <div className="p-4 border border-secondary rounded">
          <h2 className="text-xl font-bold">This Week's Progress</h2>
          <p>{dashboardData.thisWeek.workoutsCompleted} / {dashboardData.thisWeek.goalWorkouts} workouts completed</p>
          <div className="w-full bg-lightBg rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${dashboardData.thisWeek.progress}%` }}></div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link to="/workouts/create" className="bg-primary text-white p-2 rounded">Start Workout</Link>
          <Link to="/goals/create" className="bg-primary text-white p-2 rounded">Set New Goal</Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8">
        <h2 className="text-xl font-bold mb-4">Upcoming Goal Deadlines</h2>
        {dashboardData.goals.upcoming.map((goal: any, index: number) => (
          <motion.div
            key={goal._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
            className="p-4 border border-secondary rounded mb-4">
            <h3 className="font-bold">{goal.title}</h3>
            <p><strong>Deadline:</strong> {new Date(goal.deadline).toLocaleDateString()}</p>
          </motion.div>
        ))}
        <div className="mt-4 text-center">
          <Link to="/goals" className="bg-primary text-white p-2 rounded">
            View All Goals
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Achievements</h2>
        {dashboardData.achievements.map((achievement: any, index: number) => (
          <motion.div
            key={achievement._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 + index * 0.1, duration: 0.5 }}
            className="p-4 border border-secondary rounded mb-4">
            <h3 className="font-bold">{achievement.title}</h3>
            <p><strong>Completed:</strong> {new Date(achievement.completedAt).toLocaleDateString()}</p>
          </motion.div>
        ))}
        <div className="mt-4 text-center">
          <Link to={`/users/${dashboardData.user._id}/profile`} className="bg-primary text-white p-2 rounded">
            View All Achievements
          </Link>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default Dashboard;
