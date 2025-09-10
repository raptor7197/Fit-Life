import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Goals</h1>
        <Link to="/goals/create" className="bg-blue-500 text-white p-2 rounded">
          Create Goal
        </Link>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        {goals.map((goal) => (
          <div key={goal._id} className="p-4 border border-gray-300 rounded mb-4">
            <h2 className="text-xl font-bold">{goal.title}</h2>
            <p>{goal.description}</p>
            <p><strong>Category:</strong> {goal.category}</p>
            <p><strong>Type:</strong> {goal.type}</p>
            <p><strong>Target:</strong> {goal.targetValue} {goal.unit}</p>
            <p><strong>Deadline:</strong> {new Date(goal.deadline).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Goals;