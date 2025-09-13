import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const EditGoal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/goals/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormData(response.data.data.goal);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchGoal();
  }, [id]);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/goals/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate(`/goals/${id}`);
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!formData) {
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
        className="text-2xl font-bold mb-4">Edit Goal</motion.h1>
      {error && <p className="text-red-500">{error}</p>}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg px-8 pt-6 pb-8 mb-4">
        {/* Form fields are similar to CreateGoal, pre-filled with formData */}
        <button type="submit" className="bg-primary hover:bg-darkText text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
          Save Changes
        </button>
      </motion.form>
    </motion.div>
  );
};

export default EditGoal;