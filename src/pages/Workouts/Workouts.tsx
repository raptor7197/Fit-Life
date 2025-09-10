import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Workouts = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decodedToken: { userId: string } = jwtDecode(token);
        const userId = decodedToken.userId;

        const response = await axios.get(`/api/workouts/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWorkouts(response.data.data.workouts);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchWorkouts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <Link to="/workouts/create" className="bg-blue-500 text-white p-2 rounded">
          Create Workout
        </Link>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        {workouts.map((workout) => (
          <div key={workout._id} className="p-4 border border-gray-300 rounded mb-4">
            <h2 className="text-xl font-bold">{workout.title}</h2>
            <p>{workout.description}</p>
            <p><strong>Type:</strong> {workout.type}</p>
            <p><strong>Duration:</strong> {workout.durationMinutes} minutes</p>
            <p><strong>Intensity:</strong> {workout.intensity}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workouts;