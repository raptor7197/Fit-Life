import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Workout Recommendations</h1>
      {error && <p className="text-red-500">{error}</p>}
      {recommendations.length > 0 ? (
        <div>
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 border border-gray-300 rounded mb-4">
              <h2 className="text-xl font-bold">{rec.title}</h2>
              <p>{rec.description}</p>
              <p><strong>Type:</strong> {rec.type}</p>
              <p><strong>Duration:</strong> {rec.durationMinutes} minutes</p>
              <p><strong>Intensity:</strong> {rec.intensity}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading recommendations...</p>
      )}
    </div>
  );
};

export default WorkoutRecommendations;