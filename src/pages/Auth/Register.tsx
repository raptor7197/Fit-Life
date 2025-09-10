
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    height: '',
    weight: '',
    fitnessLevel: 'beginner',
    fitnessGoals: [],
    preferredWorkoutTypes: [],
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { name, email, password, age, height, weight, fitnessLevel, fitnessGoals, preferredWorkoutTypes } = formData;
      const profile = {
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        fitnessLevel,
        fitnessGoals,
        preferredWorkoutTypes,
      };
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        age: age ? Number(age) : undefined,
        profile,
      });
      console.log(response.data);
      navigate('/auth/login');
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Height (cm)</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Fitness Level</label>
          <select
            name="fitnessLevel"
            value={formData.fitnessLevel}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="athlete">Athlete</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Fitness Goals</label>
          <select
            multiple
            name="fitnessGoals"
            value={formData.fitnessGoals}
            onChange={handleMultiSelectChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="weight-loss">Weight Loss</option>
            <option value="muscle-gain">Muscle Gain</option>
            <option value="endurance">Endurance</option>
            <option value="strength">Strength</option>
            <option value="flexibility">Flexibility</option>
            <option value="general-fitness">General Fitness</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Preferred Workout Types</label>
          <select
            multiple
            name="preferredWorkoutTypes"
            value={formData.preferredWorkoutTypes}
            onChange={handleMultiSelectChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
            <option value="yoga">Yoga</option>
            <option value="pilates">Pilates</option>
            <option value="crossfit">Crossfit</option>
            <option value="swimming">Swimming</option>
            <option value="running">Running</option>
            <option value="cycling">Cycling</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
