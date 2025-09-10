import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Users</h1>
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Search by name or email"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">
          Search
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        {results.map((user) => (
          <div key={user._id} className="p-4 border border-gray-300 rounded mb-4">
            <Link to={`/users/${user._id}/public-profile`} className="text-xl font-bold">{user.name}</Link>
            <p><strong>Fitness Level:</strong> {user.profile.fitnessLevel}</p>
            <p><strong>Current Streak:</strong> {user.stats.currentStreak}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;