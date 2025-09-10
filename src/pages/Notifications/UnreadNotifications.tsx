import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UnreadNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('/api/notifications/unread', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(response.data.data.notifications);
      } catch (err: any) {
        setError(err.response.data.message || 'Something went wrong');
      }
    };

    fetchUnreadNotifications();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Unread Notifications</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        {notifications.map((notification) => (
          <div key={notification._id} className="p-4 border border-blue-500 rounded mb-4">
            <p>{notification.message}</p>
            <p className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnreadNotifications;