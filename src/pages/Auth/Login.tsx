
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', response.data.data.tokens.accessToken);
      navigate('/auth/profile');
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-md">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold mb-6 text-center">Login</motion.h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-darkText text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-darkText text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border border-secondary rounded-md w-full py-2 px-3 text-darkText mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="bg-primary hover:bg-darkText text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
              Sign In
            </button>
            <Link to="/auth/register" className="inline-block align-baseline font-bold text-sm text-primary hover:text-darkText">
              Don't have an account?
            </Link>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default Login;
