import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Goal Recommendations</h1>
      {error && <p className="text-red-500">{error}</p>}
      {recommendations.length > 0 ? (
        <div>
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 border border-gray-300 rounded mb-4">
              <h2 className="text-xl font-bold">{rec.title}</h2>
              <p>{rec.description}</p>
              <p><strong>Category:</strong> {rec.category}</p>
              <p><strong>Target:</strong> {rec.targetValue} {rec.unit}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading recommendations...</p>
      )}
    </div>
  );
};

export default GoalRecommendations;