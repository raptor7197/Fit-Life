import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/users/search?q=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setResults(response.data.data.users);
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
        className="text-2xl font-bold mb-4">Search Users</motion.h1>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        onSubmit={handleSearch}
        className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border border-secondary rounded"
          placeholder="Search by name or email"
        />
        <button type="submit" className="bg-primary text-white p-2 rounded mt-2">
          Search
        </button>
      </motion.form>
      {error && <p className="text-red-500">{error}</p>}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}>
        {results.map((user, index) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
            className="p-4 border border-secondary rounded mb-4">
            <Link to={`/users/${user._id}/public-profile`} className="text-xl font-bold">{user.name}</Link>
            <p><strong>Fitness Level:</strong> {user.profile.fitnessLevel}</p>
            <p><strong>Current Streak:</strong> {user.stats.currentStreak}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Search;