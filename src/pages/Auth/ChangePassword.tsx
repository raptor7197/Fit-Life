import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/change-password', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess('Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

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
        className="text-2xl font-bold mb-4">Change Password</motion.h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-primary">{success}</p>}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-darkText">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full p-2 border border-secondary rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-darkText">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full p-2 border border-secondary rounded"
            required
          />
        </div>
        <button type="submit" className="bg-primary text-white p-2 rounded">
          Change Password
        </button>
      </motion.form>
    </motion.div>
  );
};

export default ChangePassword;