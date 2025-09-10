
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
  onGetStartedClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onGetStartedClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-5 left-1/2 transform -translate-x-1/2 w-[calc(100%-40px)] max-w-6xl z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg scale-98' 
        : 'bg-white/85 backdrop-blur-sm shadow-md scale-100'
    } rounded-2xl px-6 py-4`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-brand-dark">FitLife</h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-brand-medium hover:text-brand-dark transition-colors duration-200">
            Home
          </Link>
          <div className="relative group">
            <button className="text-brand-medium hover:text-brand-dark transition-colors duration-200">Pages</button>
            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-2 py-2 w-48">
              <Link to="/auth/register" className="block px-4 py-2 text-brand-dark hover:bg-gray-100">Register</Link>
              <Link to="/auth/login" className="block px-4 py-2 text-brand-dark hover:bg-gray-100">Login</Link>
              <Link to="/auth/profile" className="block px-4 py-2 text-brand-dark hover:bg-gray-100">Profile</Link>
              <Link to="/goals" className="block px-4 py-2 text-brand-dark hover:bg-gray-100">Goals</Link>
              <Link to="/notifications" className="block px-4 py-2 text-brand-dark hover:bg-gray-100">Notifications</Link>
              <Link to="/users/1/dashboard" className="block px-4 py-2 text-brand-dark hover:bg-gray-100">Dashboard</Link>
              <Link to="/workouts" className="block px-4 py-2 text-brand-dark hover:bg-gray-100">Workouts</Link>
            </div>
          </div>
          <button 
            onClick={onGetStartedClick}
            className="bg-brand-light text-white px-6 py-2 rounded-xl font-semibold hover:bg-brand-dark transform hover:scale-105 transition-all duration-200"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-brand-dark p-2"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 py-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg animate-fadeInUp">
          <div className="flex flex-col space-y-4 px-4">
            <Link to="/" className="text-brand-medium hover:text-brand-dark transition-colors duration-200 py-2 text-left">
              Home
            </Link>
            <Link to="/auth/register" className="text-brand-medium hover:text-brand-dark transition-colors duration-200 py-2 text-left">Register</Link>
            <Link to="/auth/login" className="text-brand-medium hover:text-brand-dark transition-colors duration-200 py-2 text-left">Login</Link>
            <Link to="/auth/profile" className="text-brand-medium hover:text-brand-dark transition-colors duration-200 py-2 text-left">Profile</Link>
            <Link to="/goals" className="text-brand-medium hover:text-brand-dark transition-colors duration-200 py-2 text-left">Goals</Link>
            <Link to="/notifications" className="text-brand-medium hover:text-brand-dark transition-colors duration-200 py-2 text-left">Notifications</Link>
            <Link to="/users/1/dashboard" className="text-brand-medium hover:text-brand-dark transition-colors duration-200 py-2 text-left">Dashboard</Link>
            <Link to="/workouts" className="text-brand-medium hover:text-brand-dark transition-colors duration-200 py-2 text-left">Workouts</Link>
            <button 
              onClick={onGetStartedClick}
              className="bg-brand-light text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-dark transform hover:scale-105 transition-all duration-200 mt-4"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
