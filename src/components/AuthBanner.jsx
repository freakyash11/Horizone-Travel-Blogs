import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import blogLogo from '../assets/logo.png';

const AuthBanner = () => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Background image options - travel-themed
  const bgImages = [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  ];

  // Select a random background image
  const randomBgImage = bgImages[Math.floor(Math.random() * bgImages.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${randomBgImage})` }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark to-transparent opacity-70"></div>
      </div>

      {/* Content container */}
      <div 
        className={`relative z-10 max-w-4xl w-full mx-4 flex flex-col md:flex-row items-stretch bg-secondary-white dark:bg-primary-charcoal rounded-xl shadow-xl overflow-hidden transform transition-all duration-700 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      >
        {/* Left side - Image/Illustration */}
        <div className="w-full md:w-2/5 bg-[#3182ce] p-6 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block">
              <img 
                src={blogLogo} 
                alt="Blog Logo" 
                className="h-20 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary-white mb-2">Horizone Travel</h3>
            <p className="text-secondary-lightGray text-sm md:text-base">Discover amazing destinations and travel experiences</p>
          </div>
        </div>

        {/* Right side - Content */}
        <div className="w-full md:w-3/5 p-6 md:p-8 bg-secondary-white dark:bg-primary-charcoal">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-dark dark:text-secondary-white mb-3">
              Sign in Required
            </h2>
            <div className="w-16 h-1 bg-accent-blue mb-6"></div>
            <p className="text-primary-slate dark:text-secondary-mediumGray mb-6">
              To access our exclusive content and features, please sign in or create an account. Join our community of travelers today!
            </p>
          
            <div className="space-y-4">
              <Link
                to="/signup"
                className="block w-full px-6 py-3 bg-accent-blue text-white font-semibold rounded-lg hover:bg-accent-teal transition-colors duration-300 text-center"
              >
                Create an Account
              </Link>
              <Link
                to="/login"
                className="block w-full px-6 py-3 border border-accent-blue text-accent-blue font-semibold rounded-lg hover:bg-accent-blue hover:text-white transition-colors duration-300 text-center"
              >
                Sign In
              </Link>
            </div>
          
            <div className="mt-6 pt-6 border-t border-secondary-mediumGray dark:border-primary-slate">
              <p className="text-sm text-secondary-darkGray dark:text-secondary-mediumGray text-center">
                By signing up, you agree to our <a href="#" className="text-accent-blue hover:underline">Terms of Service</a> and <a href="#" className="text-accent-blue hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthBanner; 