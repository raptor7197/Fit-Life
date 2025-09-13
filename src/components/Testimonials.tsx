import React, { useState, useEffect } from 'react';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const Testimonials: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Executive',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=400&h=400&fit=crop&crop=face',
      rating: 5,
      text: 'FitLife completely transformed my approach to fitness. The personalized workouts and nutrition guidance helped me lose 30 pounds in 4 months. The community support is incredible!',
      achievement: 'Lost 30 lbs',
    },
    {
      name: 'Mike Chen',
      role: 'Software Developer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      rating: 5,
      text: 'As someone who works long hours, I thought I\'d never have time for fitness. FitLife\'s flexible scheduling and quick workouts fit perfectly into my busy lifestyle.',
      achievement: 'Built muscle mass',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Teacher',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      rating: 5,
      text: 'The expert guidance and progressive tracking kept me motivated throughout my journey. I went from barely being able to run a mile to completing my first marathon!',
      achievement: 'Marathon finisher',
    },
    {
      name: 'David Thompson',
      role: 'Entrepreneur',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      rating: 5,
      text: 'FitLife isn\'t just about physical transformation - it changed my mindset. The achievement system and community support made fitness fun and sustainable for me.',
      achievement: 'Improved strength 200%',
    },
    {
      name: 'Lisa Park',
      role: 'Nurse',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      rating: 5,
      text: 'Working night shifts made it hard to maintain a routine. FitLife\'s 24/7 availability and personalized plans worked perfectly with my irregular schedule.',
      achievement: 'Consistent routine',
    },
    {
      name: 'James Wilson',
      role: 'Retired Veteran',
      image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face',
      rating: 5,
      text: 'After my military service, I needed help getting back in shape. FitLife\'s expert trainers understood my needs and created a perfect rehabilitation program.',
      achievement: 'Full recovery',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentReview = testimonials[currentTestimonial];

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-accent via-white to-accent/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-primary text-white rounded-full text-sm font-medium mb-4">
            💬 Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-darkText mb-6">
            What Our Members
            <span className="text-primary block mt-2">Are Saying</span>
          </h2>
          <p className="text-lg text-primary max-w-3xl mx-auto">
            Join thousands of satisfied members who have transformed their lives with FitLife.
            Here are some of their inspiring success stories.
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial} // Key changes to trigger animation
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 relative overflow-hidden"
            >

              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full translate-y-12 -translate-x-12" />
              
              <div className="relative z-10">
                {/* Rating Stars */}
                <div className="flex justify-center mb-6">
                  {[...Array(currentReview.rating)].map((_, index) => (
                    <StarIcon key={index} className="h-6 w-6 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-lg sm:text-xl text-darkText text-center leading-relaxed mb-8 italic">
                  "{currentReview.text}"
                </blockquote>

                {/* User Info */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <img
                    src={currentReview.image}
                    alt={currentReview.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-primary"
                  />
                  <div className="text-center sm:text-left">
                    <h4 className="font-bold text-darkText text-lg">{currentReview.name}</h4>
                    <p className="text-primary">{currentReview.role}</p>
                    <p className="text-primary font-semibold text-sm mt-1">
                      🏆 {currentReview.achievement}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button 
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-primary text-white p-3 rounded-full hover:bg-darkText transition-colors duration-200 shadow-lg"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              <button 
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary text-white p-3 rounded-full hover:bg-darkText transition-colors duration-200 shadow-lg"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${ index === currentTestimonial 
                  ? 'bg-primary scale-125' 
                  : 'bg-primary/30 hover:bg-primary/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-darkText mb-2">10,000+</div>
            <div className="text-primary text-sm">Happy Members</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-darkText mb-2">98%</div>
            <div className="text-primary text-sm">Success Rate</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-darkText mb-2">4.9</div>
            <div className="text-primary text-sm">Average Rating</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-darkText mb-2">2M+</div>
            <div className="text-primary text-sm">Workouts Completed</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
