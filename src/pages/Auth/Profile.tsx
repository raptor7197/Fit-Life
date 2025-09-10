
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data.data.user);
        setFormData(response.data.data.user);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({ ...formData, [parent]: { ...formData[parent], [child]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/auth/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data.data.user);
      setEditMode(false);
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div>
          <button onClick={() => setEditMode(!editMode)} className="bg-blue-500 text-white p-2 rounded mr-2">
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
            Logout
          </button>
        </div>
      </div>

      {editMode ? (
        <form onSubmit={handleSubmit}>
          {/* Add form fields for all user properties */}
          <button type="submit" className="bg-green-500 text-white p-2 rounded mt-4">Save Changes</button>
        </form>
      ) : (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Age:</strong> {user.age}</p>
          <p><strong>Height:</strong> {user.profile?.height} cm</p>
          <p><strong>Weight:</strong> {user.profile?.weight} kg</p>
          <p><strong>Fitness Level:</strong> {user.profile?.fitnessLevel}</p>
          <p><strong>Fitness Goals:</strong> {user.profile?.fitnessGoals?.join(', ')}</p>
          <p><strong>Preferred Workout Types:</strong> {user.profile?.preferredWorkoutTypes?.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
