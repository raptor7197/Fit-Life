import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';

const GoalStats = () => {
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

        const response = await axios.get(`/api/goals/stats/${userId}?days=${days}`, {
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
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold mb-4">Goal Statistics</motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}>
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
            <p><strong>Total Goals:</strong> {stats.totalGoals}</p>
            <p><strong>Completed Goals:</strong> {stats.completedGoals}</p>
            <p><strong>Active Goals:</strong> {stats.activeGoals}</p>
            <p><strong>Overdue Goals:</strong> {stats.overdueGoals}</p>
            <p><strong>Completion Rate:</strong> {stats.completionRate}%</p>
          </div>
        ) : (
          <p>Loading stats...</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GoalStats;