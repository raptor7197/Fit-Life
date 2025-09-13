import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';

const Goals = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decodedToken: { userId: string } = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await axios.get(`/api/goals/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGoals(response.data.data.goals);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchGoals();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Goals</h1>
        <Link to="/goals/create" className="bg-primary text-white p-2 rounded">
          Create Goal
        </Link>
      </motion.div>
      {error && <p className="text-red-500">{error}</p>}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}>
        {goals.map((goal, index) => (
          <motion.div
            key={goal._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            className="p-4 border border-secondary rounded mb-4">
            <h2 className="text-xl font-bold">{goal.title}</h2>
            <p>{goal.description}</p>
            <p><strong>Category:</strong> {goal.category}</p>
            <p><strong>Type:</strong> {goal.type}</p>
            <p><strong>Target:</strong> {goal.targetValue} {goal.unit}</p>
            <p><strong>Deadline:</strong> {new Date(goal.deadline).toLocaleDateString()}</p>
          </motion.div>
        ))}
        <div className="mt-4 flex justify-center space-x-4">
          <Link to="/goals/stats" className="bg-primary text-white p-2 rounded">
            View Goal Stats
          </Link>
          <Link to="/goals/recommendations" className="bg-primary text-white p-2 rounded">
            Get Goal Recommendations
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Goals;
