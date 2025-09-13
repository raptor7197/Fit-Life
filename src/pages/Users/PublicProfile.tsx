import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/users/${id}/public-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data.data.profile);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchPublicProfile();
  }, [id]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!profile) {
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
        className="text-2xl font-bold mb-4">{profile.name}'s Profile</motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}>
        <p><strong>Fitness Level:</strong> {profile.fitnessLevel}</p>
        <p><strong>Member Since:</strong> {new Date(profile.memberSince).toLocaleDateString()}</p>
        <p><strong>Current Streak:</strong> {profile.stats.currentStreak}</p>
        <p><strong>Total Workouts:</strong> {profile.stats.totalWorkouts}</p>

        <h2 className="text-xl font-bold mt-4">Recent Activity</h2>
        {profile.recentActivity.map((activity: any, index: number) => (
          <motion.div
            key={activity._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            className="p-4 border border-secondary rounded mb-4">
            <p><strong>{activity.title}</strong> ({activity.type})</p>
            <p>{activity.durationMinutes} minutes on {new Date(activity.completedAt).toLocaleDateString()}</p>
          </motion.div>
        ))}
        <div className="mt-4 text-center">
          <Link to={`/users/${profile._id}/dashboard`} className="bg-primary text-white p-2 rounded">
            View All Activity
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PublicProfile;
