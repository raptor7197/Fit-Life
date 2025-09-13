import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';

const WorkoutRecommendations = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decodedToken: { userId: string } = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await axios.get(`/api/workouts/recommendations/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRecommendations(response.data.data.recommendation);
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
        className="text-2xl font-bold mb-4">Workout Recommendations</motion.h1>
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
              <p><strong>Type:</strong> {rec.type}</p>
              <p><strong>Duration:</strong> {rec.durationMinutes} minutes</p>
              <p><strong>Intensity:</strong> {rec.intensity}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p>Loading recommendations...</p>
      )}
    </motion.div>
  );
};

export default WorkoutRecommendations;