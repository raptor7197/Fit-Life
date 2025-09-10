import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const GoalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<any>(null);
  const [error, setError] = useState('');
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/goals/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGoal(response.data.data.goal);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchGoal();
  }, [id]);

  const handleUpdateProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/goals/${id}/progress`, { value: progressValue }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh goal data
      const response = await axios.get(`/api/goals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoal(response.data.data.goal);
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  const handleCompleteGoal = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/goals/${id}/complete`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/goals');
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  const handleDeleteGoal = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/goals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/goals');
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!goal) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{goal.title}</h1>
      <p>{goal.description}</p>
      <p><strong>Category:</strong> {goal.category}</p>
      <p><strong>Type:</strong> {goal.type}</p>
      <p><strong>Target:</strong> {goal.targetValue} {goal.unit}</p>
      <p><strong>Progress:</strong> {goal.progressValue} / {goal.targetValue} {goal.unit}</p>
      <p><strong>Deadline:</strong> {new Date(goal.deadline).toLocaleDateString()}</p>
      <p><strong>Status:</strong> {goal.status}</p>

      <div className="mt-4">
        <h2 className="text-xl font-bold">Update Progress</h2>
        <input
          type="number"
          value={progressValue}
          onChange={(e) => setProgressValue(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded"
        />
        <button onClick={handleUpdateProgress} className="bg-blue-500 text-white p-2 rounded ml-2">
          Update
        </button>
      </div>

      <div className="mt-4">
        <button onClick={handleCompleteGoal} className="bg-green-500 text-white p-2 rounded mr-2">
          Mark as Complete
        </button>
        <button onClick={() => navigate(`/goals/edit/${id}`)} className="bg-yellow-500 text-white p-2 rounded mr-2">
          Edit Goal
        </button>
        <button onClick={handleDeleteGoal} className="bg-red-500 text-white p-2 rounded">
          Delete Goal
        </button>
      </div>
    </div>
  );
};

export default GoalDetails;