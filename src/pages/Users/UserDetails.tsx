import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Age:</strong> {user.age}</p>
      <p><strong>Height:</strong> {user.profile?.height} cm</p>
      <p><strong>Weight:</strong> {user.profile?.weight} kg</p>
      <p><strong>Fitness Level:</strong> {user.profile?.fitnessLevel}</p>
      <p><strong>Fitness Goals:</strong> {user.profile?.fitnessGoals?.join(', ')}</p>
      <p><strong>Preferred Workout Types:</strong> {user.profile?.preferredWorkoutTypes?.join(', ')}</p>
    </div>
  );
};

export default UserDetails;