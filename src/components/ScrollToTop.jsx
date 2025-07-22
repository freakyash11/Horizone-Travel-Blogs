import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const authStatus = useSelector((state) => state.auth.status);
  const location = useLocation();
  
  // Check if current page is AddPost
  const isAddPostPage = location.pathname === '/add-post';

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Plus button for Add Post - always visible if authenticated and not on AddPost page */}
      {authStatus && !isAddPostPage && (
        <Link
          to="/add-post"
          aria-label="Add new post"
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-accent-teal text-secondary-white shadow-lg hover:bg-accent-blue transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </Link>
      )}

      {/* Scroll to top button - only visible when scrolled down */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className={`fixed ${!authStatus || isAddPostPage ? 'bottom-8' : 'bottom-24'} right-8 z-50 p-3 rounded-full bg-accent-blue text-secondary-white shadow-lg hover:bg-accent-teal transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  );
}

export default ScrollToTop; 