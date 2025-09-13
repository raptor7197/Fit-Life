
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-bold">Profile</motion.h1>
        <div>
          <button onClick={() => setEditMode(!editMode)} className="bg-primary text-white p-2 rounded mr-2">
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
          <Link to="/auth/change-password" className="bg-primary text-white p-2 rounded mr-2">
            Change Password
          </Link>
          <button onClick={handleLogout} className="bg-red-600 text-white p-2 rounded">
            Logout
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {editMode ? (
          <motion.form
            key="editForm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}>
            {/* Add form fields for all user properties */}
            <button type="submit" className="bg-primary text-white p-2 rounded mt-4">Save Changes</button>
          </motion.form>
        ) : (
          <motion.div
            key="profileDisplay"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Age:</strong> {user.age}</p>
            <p><strong>Height:</strong> {user.profile?.height} cm</p>
            <p><strong>Weight:</strong> {user.profile?.weight} kg</p>
            <p><strong>Fitness Level:</strong> {user.profile?.fitnessLevel}</p>
            <p><strong>Fitness Goals:</strong> {user.profile?.fitnessGoals?.join(', ')}</p>
            <p><strong>Preferred Workout Types:</strong> {user.profile?.preferredWorkoutTypes?.join(', ')}</p>
            <div className="mt-4">
              <Link to={`/users/${user._id}/public-profile`} className="bg-primary text-white p-2 rounded">
                View Public Profile
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
