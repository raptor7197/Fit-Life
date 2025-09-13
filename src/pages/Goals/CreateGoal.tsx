
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CreateGoal = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'weight-loss',
    type: 'daily',
    targetValue: 0,
    unit: 'kg',
    deadline: '',
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
      await axios.post('/api/goals', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/goals');
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
        className="text-2xl font-bold mb-4">Create Goal</motion.h1>
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
          <label className="block text-darkText text-sm font-bold mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            <option value="weight-loss">Weight Loss</option>
            <option value="weight-gain">Weight Gain</option>
            <option value="muscle-gain">Muscle Gain</option>
            <option value="endurance">Endurance</option>
            <option value="strength">Strength</option>
            <option value="flexibility">Flexibility</option>
            <option value="habit-building">Habit Building</option>
            <option value="nutrition">Nutrition</option>
            <option value="sleep">Sleep</option>
            <option value="steps">Steps</option>
            <option value="water-intake">Water Intake</option>
            <option value="workout-frequency">Workout Frequency</option>
            <option value="distance">Distance</option>
            <option value="time-based">Time-based</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-darkText text-sm font-bold mb-2">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="one-time">One-time</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-darkText text-sm font-bold mb-2">Target Value</label>
          <input
            type="number"
            name="targetValue"
            value={formData.targetValue}
            onChange={handleChange}
            className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-darkText text-sm font-bold mb-2">Unit</label>
          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-darkText text-sm font-bold mb-2">Deadline</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            required
          />
        </div>
        <button type="submit" className="bg-primary hover:bg-darkText text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
          Create Goal
        </button>
      </motion.form>
    </motion.div>
  );
};

export default CreateGoal;
