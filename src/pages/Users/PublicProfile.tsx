import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{profile.name}'s Profile</h1>
      <p><strong>Fitness Level:</strong> {profile.fitnessLevel}</p>
      <p><strong>Member Since:</strong> {new Date(profile.memberSince).toLocaleDateString()}</p>
      <p><strong>Current Streak:</strong> {profile.stats.currentStreak}</p>
      <p><strong>Total Workouts:</strong> {profile.stats.totalWorkouts}</p>

      <h2 className="text-xl font-bold mt-4">Recent Activity</h2>
      {profile.recentActivity.map((activity: any) => (
        <div key={activity._id} className="p-4 border border-gray-300 rounded mb-4">
          <p><strong>{activity.title}</strong> ({activity.type})</p>
          <p>{activity.durationMinutes} minutes on {new Date(activity.completedAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default PublicProfile;