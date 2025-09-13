import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const GoalRecommendations = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decodedToken: { userId: string } = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await axios.get(`/api/goals/recommendations/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRecommendations(response.data.data.recommendations);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchRecommendations();
  }, []);

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
        className="text-2xl font-bold mb-4">Goal Recommendations</motion.h1>
      {error && <p className="text-red-500">{error}</p>}
      {recommendations.length > 0 ? (
        <div>
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              className="p-4 border border-secondary rounded mb-4">
              <h2 className="text-xl font-bold">{rec.title}</h2>
              <p>{rec.description}</p>
              <p><strong>Category:</strong> {rec.category}</p>
              <p><strong>Target:</strong> {rec.targetValue} {rec.unit}</p>
            </motion.div>
          ))}
          <div className="mt-4 text-center">
            <Link to="/goals/create" className="bg-primary text-white p-2 rounded">
              Create New Goal
            </Link>
          </div>
        </div>
      ) : (
        <p>Loading recommendations...</p>
      )}
    </motion.div>
  );
};

export default GoalRecommendations;