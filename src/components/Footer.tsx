import React from 'react';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#benefits' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  const services = [
    { name: 'Personal Training' },
    { name: 'Nutrition Coaching' },
    { name: 'Group Classes' },
    { name: 'Online Workouts' },
    { name: 'Meal Planning' },
    { name: 'Progress Tracking' },
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: '📘' },
    { name: 'Instagram', href: '#', icon: '📸' },
    { name: 'Twitter', href: '#', icon: '🐦' },
    { name: 'YouTube', href: '#', icon: '📺' },
    { name: 'LinkedIn', href: '#', icon: '💼' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-br from-darkText via-primary to-darkText text-white">
      
      {/* Main Footer Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-4">FitLife</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                Transform your life with personalized fitness solutions. Join thousands who\'ve 
                achieved their health and fitness goals with our expert guidance and community support.
              </p>
            </div>
            
            {/* Social Media */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Follow Us</h3>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-200 text-sm"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}>
            <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors duration-200 hover:underline"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li>
<button onClick={() => alert('Privacy Policy link clicked')} className="text-white/80 hover:text-white transition-colors duration-200 hover:underline">
                  Privacy Policy
                </button>
              </li>
              <li>
<button onClick={() => alert('Terms of Service link clicked')} className="text-white/80 hover:text-white transition-colors duration-200 hover:underline">
                  Terms of Service
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}>
            <h3 className="font-semibold mb-4 text-lg">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index} className="text-white/80 flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  {service.name}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}>
            <h3 className="font-semibold mb-4 text-lg">Get in Touch</h3>
            <div className="space-y-4">
              
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                <div className="text-white/80">
                  <p>123 Fitness Street</p>
                  <p>Health District, NY 10001</p>
                  <p>United States</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-accent flex-shrink-0" />
                <div className="text-white/80">
                  <p>+1 (555) 123-4567</p>
                  <p className="text-sm text-white/60">24/7 Support Available</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-accent flex-shrink-0" />
                <div className="text-white/80">
                  <p>support@fitlife.com</p>
                  <p className="text-sm text-white/60">We reply within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <ClockIcon className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                <div className="text-white/80 text-sm">
                  <p><strong>Gym Hours:</strong></p>
                  <p>Mon-Fri: 5:00 AM - 11:00 PM</p>
                  <p>Sat-Sun: 6:00 AM - 10:00 PM</p>
                  <p className="text-accent mt-1">Online: 24/7 Available</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 pt-8 border-t border-white/20">
          <div className="max-w-2xl">
            <h3 className="font-semibold mb-4 text-lg">Stay Updated</h3>
            <p className="text-white/80 mb-4">
              Get the latest fitness tips, workout plans, and exclusive offers delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-accent transition-colors duration-200"
              />
              <button className="bg-accent text-darkText px-6 py-3 rounded-xl font-semibold hover:bg-secondary transform hover:scale-105 transition-all duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white/60 text-sm">
              © {currentYear} FitLife. All rights reserved. | Transforming lives since 2020.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-white/60">
<button onClick={() => alert('Privacy Policy link clicked')} className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </button>
              <span>•</span>
<button onClick={() => alert('Terms of Service link clicked')} className="hover:text-white transition-colors duration-200">
                Terms of Service
              </button>
              <span>•</span>
<button onClick={() => alert('Cookie Policy link clicked')} className="hover:text-white transition-colors duration-200">
                Cookie Policy
              </button>
            </div>
          </div>
          
          {/* Certification & Awards */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <div className="flex flex-wrap justify-center items-center space-x-6 text-white/40 text-xs">
              <div className="flex items-center space-x-1">
                <span>🏆</span>
                <span>Best Fitness App 2024</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⭐</span>
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>✅</span>
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🔒</span>
                <span>SSL Secured</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;