import React, { useRef } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  HeartIcon, 
  TrophyIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { motion, useInView } from 'framer-motion';

const Benefits: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 }); // Trigger when 30% of section is visible

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const benefits = [
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: 'Track Progress',
      description: 'Monitor your fitness journey with detailed analytics, progress tracking, and personalized insights.',
      color: 'bg-blue-500',
    },
    {
      icon: <AcademicCapIcon className="h-8 w-8" />,
      title: 'Expert Guidance',
      description: 'Get personalized advice from certified fitness professionals and nutritionists.',
      color: 'bg-green-500',
    },
    {
      icon: <HeartIcon className="h-8 w-8" />,
      title: 'Custom Plans',
      description: 'Receive tailored workout and nutrition plans based on your goals and preferences.',
      color: 'bg-red-500',
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: 'Community Support',
      description: 'Connect with like-minded individuals and get motivation from our supportive community.',
      color: 'bg-purple-500',
    },
    {
      icon: <TrophyIcon className="h-8 w-8" />,
      title: 'Achievement System',
      description: 'Stay motivated with our gamified achievement system and milestone celebrations.',
      color: 'bg-yellow-500',
    },
    {
      icon: <ClockIcon className="h-8 w-8" />,
      title: 'Flexible Scheduling',
      description: 'Work out on your schedule with 24/7 access to workouts and flexible timing.',
      color: 'bg-indigo-500',
    },
  ];

  

  return (
    <section 
      id="benefits" 
      ref={sectionRef}
      className="py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={cardVariants}
          transition={{ duration: 0.5 }}
          className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-accent text-darkText rounded-full text-sm font-medium mb-4">
            🌟 Why Choose FitLife?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-darkText mb-6">
            Everything You Need to
            <span className="text-primary block mt-2">Succeed in Fitness</span>
          </h2>
          <p className="text-lg text-primary max-w-3xl mx-auto">
            Discover the comprehensive suite of tools and features designed to make your fitness journey 
            enjoyable, sustainable, and incredibly effective.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }} // Staggered delay
              className="bg-lightBg rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${benefit.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {benefit.icon}
              </div>
              
              <h3 className="text-xl font-bold text-darkText mb-4 group-hover:text-primary transition-colors duration-300">
                {benefit.title}
              </h3>
              
              <p className="text-primary leading-relaxed">
                {benefit.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-darkText/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={cardVariants}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary to-darkText rounded-3xl p-8 sm:p-12 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Transform Your Life?
            </h3>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied members who have already started their fitness transformation 
              with FitLife. Your journey begins with a single click.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-darkText px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-darkText transform hover:scale-105 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;