import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const WorkoutDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/workouts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWorkout(response.data.data.workout);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchWorkout();
  }, [id]);

  const handleCompleteWorkout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/workouts/${id}/complete`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/workouts');
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  const handleDeleteWorkout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/workouts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/workouts');
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!workout) {
    return <p>Loading...</p>;
  }

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
        className="text-2xl font-bold mb-4">{workout.title}</motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}>
        <p>{workout.description}</p>
        <p><strong>Type:</strong> {workout.type}</p>
        <p><strong>Duration:</strong> {workout.durationMinutes} minutes</p>
        <p><strong>Intensity:</strong> {workout.intensity}</p>
        <p><strong>Completed:</strong> {workout.completed ? 'Yes' : 'No'}</p>

        <div className="mt-4">
          {!workout.completed && (
            <button onClick={handleCompleteWorkout} className="bg-primary text-white p-2 rounded mr-2">
              Mark as Complete
            </button>
          )}
          <button onClick={() => navigate(`/workouts/edit/${id}`)} className="bg-accent text-white p-2 rounded mr-2">
            Edit Workout
          </button>
          <button onClick={handleDeleteWorkout} className="bg-red-600 text-white p-2 rounded">
            Delete Workout
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WorkoutDetails;