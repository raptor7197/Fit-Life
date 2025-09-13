import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data.data.user);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchUserDetails();
  }, [id]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!user) {
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
        className="text-2xl font-bold mb-4">User Details</motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Age:</strong> {user.age}</p>
        <p><strong>Height:</strong> {user.profile?.height} cm</p>
        <p><strong>Weight:</strong> {user.profile?.weight} kg</p>
        <p><strong>Fitness Level:</strong> {user.profile?.fitnessLevel}</p>
        <p><strong>Fitness Goals:</strong> {user.profile?.fitnessGoals?.join(', ')}</p>
        <p><strong>Preferred Workout Types:</strong> {user.profile?.preferredWorkoutTypes?.join(', ')}</p>
      </motion.div>
    </motion.div>
  );
};

export default UserDetails;