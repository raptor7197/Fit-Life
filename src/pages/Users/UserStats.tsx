import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const UserStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decodedToken: { userId: string } = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await axios.get(`/api/users/${userId}/stats?days=${days}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data.data.stats);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchStats();
  }, [days]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Statistics</h1>
      <div className="mb-4">
        <label>Select Period:</label>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {stats ? (
        <div>
          <h2 className="text-xl font-bold mt-4">Overview</h2>
          <p><strong>Total Workouts:</strong> {stats.overview.totalWorkouts}</p>
          <p><strong>Current Streak:</strong> {stats.overview.currentStreak}</p>
          <p><strong>Goals Completed:</strong> {stats.overview.goalsCompleted}</p>

          <h2 className="text-xl font-bold mt-4">Recent Workouts</h2>
          <p><strong>Total Workouts:</strong> {stats.recent.workouts.totalWorkouts}</p>
          <p><strong>Total Minutes:</strong> {stats.recent.workouts.totalMinutes}</p>

          <h2 className="text-xl font-bold mt-4">Recent Goals</h2>
          <p><strong>Completed Goals:</strong> {stats.recent.goals.completedGoals}</p>
          <p><strong>Completion Rate:</strong> {stats.recent.goals.completionRate}%</p>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}
    </div>
  );
};

export default UserStats;