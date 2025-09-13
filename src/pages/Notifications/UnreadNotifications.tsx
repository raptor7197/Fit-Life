import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-bold">Unread Notifications</motion.h1>
        <Link to="/notifications" className="bg-primary text-white p-2 rounded">
          View All
        </Link>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            className="p-4 border border-primary rounded mb-4">
            <p>{notification.message}</p>
            <p className="text-sm text-darkText">{new Date(notification.createdAt).toLocaleString()}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default UnreadNotifications;