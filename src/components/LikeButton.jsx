import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import appwriteService from '../appwrite/config';

function LikeButton({ postId, initialLikeCount = 0, initialLiked = false, className = "" }) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const authStatus = useSelector(state => state.auth.status);
  const userData = useSelector(state => state.auth.userData);
  const navigate = useNavigate();

  // Check if the current user has liked this post
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (authStatus && userData && postId) {
        try {
          const hasLiked = await appwriteService.hasUserLiked(postId, userData.$id);
          setLiked(hasLiked);
        } catch (error) {
          console.error("Error checking like status:", error);
        }
      }
    };

    checkLikeStatus();
  }, [postId, authStatus, userData]);

  const handleLike = async () => {
    // If user is not logged in, redirect to login page
    if (!authStatus) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const updatedPost = await appwriteService.toggleLike(postId, userData.$id);
      
      // Update state based on the response
      setLiked(!liked);
      setLikeCount(updatedPost.likeCount || 0);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-1 focus:outline-none ${className}`}
      aria-label={liked ? "Unlike this post" : "Like this post"}
    >
      <span className={`transform transition-transform duration-200 ${liked ? 'scale-110' : ''}`}>
        {liked ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
      </span>
      <span className={`text-sm font-medium ${liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
        {likeCount > 0 ? likeCount : ''}
      </span>
    </button>
  );
}

export default LikeButton; 