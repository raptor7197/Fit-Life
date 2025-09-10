import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const WorkoutStats = () => {
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

        const response = await axios.get(`/api/workouts/stats/${userId}?days=${days}`, {
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
      <h1 className="text-2xl font-bold mb-4">Workout Statistics</h1>
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
          <p><strong>Total Workouts:</strong> {stats.totalWorkouts}</p>
          <p><strong>Total Minutes:</strong> {stats.totalMinutes}</p>
          <p><strong>Total Calories Burned:</strong> {stats.totalCalories}</p>
          <p><strong>Average Duration:</strong> {stats.avgDuration} minutes</p>
          <p><strong>Average Rating:</strong> {stats.avgRating}</p>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}
    </div>
  );
};

export default WorkoutStats;