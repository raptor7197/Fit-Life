import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-bold">Welcome, {dashboardData.user.name}</h2>
          <p><strong>Fitness Level:</strong> {dashboardData.user.fitnessLevel}</p>
          <p><strong>Current Streak:</strong> {dashboardData.user.currentStreak} days</p>
        </div>

        <div className="p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-bold">Today's Summary</h2>
          <p><strong>Workouts Completed:</strong> {dashboardData.today.completedWorkouts}</p>
          <p><strong>Total Minutes:</strong> {dashboardData.today.totalMinutes}</p>
        </div>

        <div className="p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-bold">This Week's Progress</h2>
          <p>{dashboardData.thisWeek.workoutsCompleted} / {dashboardData.thisWeek.goalWorkouts} workouts completed</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${dashboardData.thisWeek.progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link to="/workouts/create" className="bg-blue-500 text-white p-2 rounded">Start Workout</Link>
          <Link to="/goals/create" className="bg-green-500 text-white p-2 rounded">Set New Goal</Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Upcoming Goal Deadlines</h2>
        {dashboardData.goals.upcoming.map((goal: any) => (
          <div key={goal._id} className="p-4 border border-gray-300 rounded mb-4">
            <h3 className="font-bold">{goal.title}</h3>
            <p><strong>Deadline:</strong> {new Date(goal.deadline).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Achievements</h2>
        {dashboardData.achievements.map((achievement: any) => (
          <div key={achievement._id} className="p-4 border border-gray-300 rounded mb-4">
            <h3 className="font-bold">{achievement.title}</h3>
            <p><strong>Completed:</strong> {new Date(achievement.completedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;