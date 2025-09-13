import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface HeroProps {
  onGetStartedClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStartedClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const trainingImages = [
    {
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=faces',
      title: 'Strength Training',
      description: 'Build muscle and increase power',
    },
    {
      url: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop&crop=faces',
      title: 'Cardio Workouts',
      description: 'Improve endurance and burn calories',
    },
    {
      url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&crop=faces',
      title: 'Yoga & Flexibility',
      description: 'Enhance mobility and mindfulness',
    },
    {
      url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&crop=faces',
      title: 'Group Classes',
      description: 'Train with like-minded individuals',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trainingImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [trainingImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trainingImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + trainingImages.length) % trainingImages.length);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      id="home" className="min-h-screen flex items-center pt-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="inline-block px-4 py-2 bg-accent text-darkText rounded-full text-sm font-medium mb-4">
                  ✨ Transform Your Life Today
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-darkText leading-tight">
                Transform Your
                <span className="text-primary block mt-2">Fitness Journey</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-lg sm:text-xl text-primary max-w-2xl leading-relaxed">
                Join thousands who\'ve achieved their fitness goals with personalized workouts, 
                nutrition tracking, and expert guidance. Your transformation starts here.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onGetStartedClick}
                className="bg-brand-dark text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary transform hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Start Your Journey</span>
                <span className="text-2xl">🚀</span>
              </button>
              
              <button className="border-2 border-primary text-darkText px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-300">
                Watch Demo
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-darkText">10K+</div>
                <div className="text-primary text-sm">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-darkText">500+</div>
                <div className="text-primary text-sm">Workout Plans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-darkText">98%</div>
                <div className="text-primary text-sm">Success Rate</div>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Image Carousel */}
          <div className="relative">
            <div className="relative h-[500px] sm:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              
              {/* Background Images */}
              {trainingImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ${
                    index === currentSlide 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-105'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ))}

              {/* Content Overlay */}
              <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                <h3 className="text-2xl font-bold mb-2 transform transition-all duration-500">
                  {trainingImages[currentSlide].title}
                </h3>
                <p className="text-white/90 transform transition-all duration-500">
                  {trainingImages[currentSlide].description}
                </p>
              </div>

              {/* Navigation Arrows */}
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all duration-200 z-20"
              >
                <ChevronLeftIcon className="h-6 w-6 text-white" />
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all duration-200 z-20"
              >
                <ChevronRightIcon className="h-6 w-6 text-white" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {trainingImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: ["0%", "20%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "loop" }}
              className="absolute -top-6 -right-6 w-24 h-24 bg-accent rounded-full flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </motion.div>
            
            <motion.div
              animate={{ y: ["0%", "-20%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "loop", delay: 2 }}
              className="absolute -bottom-6 -left-6 w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xl text-white">🏃‍♀️</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Hero;