import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
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

// import PrivateRoute from './components/PrivateRoute';

// Get Clerk publishable key from environment variables
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
};

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
      {PUBLISHABLE_KEY ? (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
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

                {/* Protected routes */}
                <Route path="/auth/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/auth/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/auth/deactivate" element={<ProtectedRoute><Deactivate /></ProtectedRoute>} />

                <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
                <Route path="/goals/create" element={<ProtectedRoute><CreateGoal /></ProtectedRoute>} />
                <Route path="/goals/stats" element={<ProtectedRoute><GoalStats /></ProtectedRoute>} />
                <Route path="/goals/recommendations" element={<ProtectedRoute><GoalRecommendations /></ProtectedRoute>} />
                <Route path="/goals/:id" element={<ProtectedRoute><GoalDetails /></ProtectedRoute>} />
                <Route path="/goals/edit/:id" element={<ProtectedRoute><EditGoal /></ProtectedRoute>} />

                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/notifications/unread" element={<ProtectedRoute><UnreadNotifications /></ProtectedRoute>} />

                <Route path="/users/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="/users/stats/:id" element={<ProtectedRoute><UserStats /></ProtectedRoute>} />
                <Route path="/users/dashboard/:id" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/users/public-profile/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
                <Route path="/users/:id" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />

                <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
                <Route path="/workouts/create" element={<ProtectedRoute><CreateWorkout /></ProtectedRoute>} />
                <Route path="/workouts/stats" element={<ProtectedRoute><WorkoutStats /></ProtectedRoute>} />
                <Route path="/workouts/recommendations" element={<ProtectedRoute><WorkoutRecommendations /></ProtectedRoute>} />
                <Route path="/workouts/:id" element={<ProtectedRoute><WorkoutDetails /></ProtectedRoute>} />
                <Route path="/workouts/edit/:id" element={<ProtectedRoute><EditWorkout /></ProtectedRoute>} />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />

            <OnboardingModal
              isOpen={isOnboardingOpen}
              onClose={handleOnboardingClose}
            />
          </div>
        </ClerkProvider>
      ) : (
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

              {/* Protected routes */}
              <Route path="/auth/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/auth/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
              <Route path="/auth/deactivate" element={<ProtectedRoute><Deactivate /></ProtectedRoute>} />

              <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
              <Route path="/goals/create" element={<ProtectedRoute><CreateGoal /></ProtectedRoute>} />
              <Route path="/goals/stats" element={<ProtectedRoute><GoalStats /></ProtectedRoute>} />
              <Route path="/goals/recommendations" element={<ProtectedRoute><GoalRecommendations /></ProtectedRoute>} />
              <Route path="/goals/:id" element={<ProtectedRoute><GoalDetails /></ProtectedRoute>} />
              <Route path="/goals/edit/:id" element={<ProtectedRoute><EditGoal /></ProtectedRoute>} />

              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/notifications/unread" element={<ProtectedRoute><UnreadNotifications /></ProtectedRoute>} />

              <Route path="/users/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/users/stats/:id" element={<ProtectedRoute><UserStats /></ProtectedRoute>} />
              <Route path="/users/dashboard/:id" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/users/public-profile/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
              <Route path="/users/:id" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />

              <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
              <Route path="/workouts/create" element={<ProtectedRoute><CreateWorkout /></ProtectedRoute>} />
              <Route path="/workouts/stats" element={<ProtectedRoute><WorkoutStats /></ProtectedRoute>} />
              <Route path="/workouts/recommendations" element={<ProtectedRoute><WorkoutRecommendations /></ProtectedRoute>} />
              <Route path="/workouts/:id" element={<ProtectedRoute><WorkoutDetails /></ProtectedRoute>} />
              <Route path="/workouts/edit/:id" element={<ProtectedRoute><EditWorkout /></ProtectedRoute>} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />

          <OnboardingModal
            isOpen={isOnboardingOpen}
            onClose={handleOnboardingClose}
          />
        </div>
      )}
    </Router>
  );
}

export default App;