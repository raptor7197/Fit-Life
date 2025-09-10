import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decodedToken: { userId: string } = jwtDecode(token);
      const userId = decodedToken.userId;

      const response = await axios.get(`/api/notifications/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data.data.notifications);
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notifications/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchNotifications(); // Refresh notifications
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/notifications/mark-all-read', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchNotifications(); // Refresh notifications
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchNotifications(); // Refresh notifications
    } catch (err: any) {
      setError(err.response.data.message || 'Something went wrong');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={handleMarkAllAsRead} className="bg-blue-500 text-white p-2 rounded">
          Mark All as Read
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        {notifications.map((notification) => (
          <div key={notification._id} className={`p-4 border rounded mb-4 ${notification.status === 'read' ? 'border-gray-300' : 'border-blue-500'}`}>
            <p>{notification.message}</p>
            <p className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
            <div className="mt-2">
              {notification.status !== 'read' && (
                <button onClick={() => handleMarkAsRead(notification._id)} className="bg-green-500 text-white p-1 rounded mr-2">Mark as Read</button>
              )}
              <button onClick={() => handleDelete(notification._id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;