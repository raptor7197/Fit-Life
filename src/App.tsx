import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Testimonials from './components/Testimonials';
import OnboardingModal from './components/OnboardingModal';
import Footer from './components/Footer';

import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import Profile from './pages/Auth/Profile';
import ChangePassword from './pages/Auth/ChangePassword';
import Deactivate from './pages/Auth/Deactivate';

import Goals from './pages/Goals/Goals';
import GoalDetails from './pages/Goals/GoalDetails';
import CreateGoal from './pages/Goals/CreateGoal';
import EditGoal from './pages/Goals/EditGoal';
import GoalStats from './pages/Goals/GoalStats';
import GoalRecommendations from './pages/Goals/GoalRecommendations';

import Notifications from './pages/Notifications/Notifications';
import UnreadNotifications from './pages/Notifications/UnreadNotifications';

import UserDetails from './pages/Users/UserDetails';
import UserStats from './pages/Users/UserStats';
import Dashboard from './pages/Users/Dashboard';
import Search from './pages/Users/Search';
import PublicProfile from './pages/Users/PublicProfile';

import Workouts from './pages/Workouts/Workouts';
import WorkoutDetails from './pages/Workouts/WorkoutDetails';
import CreateWorkout from './pages/Workouts/CreateWorkout';
import EditWorkout from './pages/Workouts/EditWorkout';
import WorkoutStats from './pages/Workouts/WorkoutStats';
import WorkoutRecommendations from './pages/Workouts/WorkoutRecommendations';

import PrivateRoute from './components/PrivateRoute';

function App() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const handleGetStartedClick = () => {
    setIsOnboardingOpen(true);
  };

  const handleOnboardingClose = () => {
    setIsOnboardingOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-white font-poppins">
        <Navbar onGetStartedClick={handleGetStartedClick} />
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Hero onGetStartedClick={handleGetStartedClick} />
                <Benefits />
                <Testimonials />
              </>
            } />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/auth/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
            <Route path="/auth/deactivate" element={<PrivateRoute><Deactivate /></PrivateRoute>} />

            <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
            <Route path="/goals/create" element={<PrivateRoute><CreateGoal /></PrivateRoute>} />
            <Route path="/goals/stats" element={<PrivateRoute><GoalStats /></PrivateRoute>} />
            <Route path="/goals/recommendations" element={<PrivateRoute><GoalRecommendations /></PrivateRoute>} />
            <Route path="/goals/:id" element={<PrivateRoute><GoalDetails /></PrivateRoute>} />
            <Route path="/goals/edit/:id" element={<PrivateRoute><EditGoal /></PrivateRoute>} />

            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/notifications/unread" element={<PrivateRoute><UnreadNotifications /></PrivateRoute>} />

            <Route path="/users/search" element={<PrivateRoute><Search /></PrivateRoute>} />
            <Route path="/users/stats/:id" element={<PrivateRoute><UserStats /></PrivateRoute>} />
            <Route path="/users/dashboard/:id" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/users/public-profile/:id" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />
            <Route path="/users/:id" element={<PrivateRoute><UserDetails /></PrivateRoute>} />

            <Route path="/workouts" element={<PrivateRoute><Workouts /></PrivateRoute>} />
            <Route path="/workouts/create" element={<PrivateRoute><CreateWorkout /></PrivateRoute>} />
            <Route path="/workouts/stats" element={<PrivateRoute><WorkoutStats /></PrivateRoute>} />
            <Route path="/workouts/recommendations" element={<PrivateRoute><WorkoutRecommendations /></PrivateRoute>} />
            <Route path="/workouts/:id" element={<PrivateRoute><WorkoutDetails /></PrivateRoute>} />
            <Route path="/workouts/edit/:id" element={<PrivateRoute><EditWorkout /></PrivateRoute>} />
          </Routes>
        </main>
        <Footer />
        
        <OnboardingModal 
          isOpen={isOnboardingOpen} 
          onClose={handleOnboardingClose}
        />
      </div>
    </Router>
  );
}

export default App;