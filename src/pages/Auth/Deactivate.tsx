import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Deactivate = () => {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/deactivate', { password, reason }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem('token');
      navigate('/auth/login');
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
        className="text-2xl font-bold mb-4">Deactivate Account</motion.h1>
      <p className="text-red-500 mb-4">Warning: This action is irreversible.</p>
      {error && <p className="text-red-500">{error}</p>}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-darkText">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-secondary rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-darkText">Reason for leaving (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border border-secondary rounded"
          />
        </div>
        <button type="submit" className="bg-red-600 text-white p-2 rounded">
          Deactivate Account
        </button>
      </motion.form>
    </motion.div>
  );
};

export default Deactivate;