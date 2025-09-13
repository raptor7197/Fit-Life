
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CreateWorkout = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'cardio',
    durationMinutes: 0,
    intensity: 'medium',
    exercises: [],
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/workouts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/workouts');
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
        className="text-2xl font-bold mb-4">Create Workout</motion.h1>
      {error && <p className="text-red-500">{error}</p>}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-darkText text-sm font-bold mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-darkText text-sm font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block text-darkText text-sm font-bold mb-2">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
            <option value="yoga">Yoga</option>
            <option value="pilates">Pilates</option>
            <option value="crossfit">Crossfit</option>
            <option value="swimming">Swimming</option>
            <option value="running">Running</option>
            <option value="cycling">Cycling</option>
            <option value="stretching">Stretching</option>
            <option value="sports">Sports</option>
            <option value="dance">Dance</option>
            <option value="martial-arts">Martial Arts</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-darkText text-sm font-bold mb-2">Duration (minutes)</label>
          <input
            type="number"
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={handleChange}
            className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-darkText text-sm font-bold mb-2">Intensity</label>
          <select
            name="intensity"
            value={formData.intensity}
            onChange={handleChange}
            className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit" className="bg-primary hover:bg-darkText text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
          Create Workout
        </button>
      </motion.form>
    </motion.div>
  );
};

export default CreateWorkout;
