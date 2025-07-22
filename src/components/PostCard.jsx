import React, { useState, useEffect } from 'react'
import appwriteService from "../appwrite/config"
import {Link} from 'react-router-dom'
import conf from "../conf/conf.js"
import authService from "../appwrite/auth"
import { LikeButton } from './'

// Profile images for users
const profileImages = [
  
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
];

// Fallback names for when user name is not available
const fallbackNames = ["John Doe", "Jane Smith", "Alex Johnson", "Sam Wilson", "Taylor Swift", "Morgan Freeman", "Chris Evans", "Emma Watson", "Robert Downey"];

// Default placeholder avatar
const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'%3E%3C/path%3E%3C/svg%3E";

// Function to strip HTML tags from content
const stripHtmlTags = (html) => {
  if (!html) return '';
  
  // Create a temporary DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get the text content
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Remove extra whitespace
  return textContent.replace(/\s+/g, ' ').trim();
};

// Function to create excerpt with specified length
const createExcerpt = (text, maxLength = 120) => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find a good breakpoint near the maxLength
  const breakpoint = text.lastIndexOf(' ', maxLength);
  const cutoff = breakpoint > maxLength * 0.8 ? breakpoint : maxLength;
  
  return text.substring(0, cutoff) + '...';
};

function PostCard({$id, title, featuredImage, content, $createdAt, category, userId, readTime, views = 0, likeCount = 0, likes = []}) {
  const [imageError, setImageError] = useState(false);
  const [author, setAuthor] = useState({
    name: '',
    avatar: defaultAvatar
  });
  
  useEffect(() => {
    // Fetch user details if userId is available
    if (userId) {
      const fetchUserDetails = async () => {
        try {
          // Check if current user matches the post userId
          const currentUser = await authService.getCurrentUser();
          
          // Generate a consistent hash from the user's ID for deterministic avatar selection
          const userIdHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const avatarIndex = userIdHash % profileImages.length;
          
          if (currentUser && currentUser.$id === userId) {
            // If it's the current user, use their actual name
            const userName = currentUser.name || fallbackNames[avatarIndex];
            
            // Check if the user is Yash Singh Kuwarbi and use the specific image from public folder
            if (userName === "Yash Singh Kuwarbi") {
              setAuthor({
                name: userName,
                avatar: "/WhatsApp Image 2025-07-21 at 15.07.29_ff90baa4.jpg"
              });
            } else {
              setAuthor({
                name: userName,
                avatar: profileImages[avatarIndex]
              });
            }
          } else {
            // Try to get user info from Appwrite
            try {
              // Note: This would require a getUser method in authService
              // Since we don't have direct access to other users' data in Appwrite without admin privileges,
              // we'll use a deterministic approach for the name based on userId
              const fallbackIndex = userIdHash % fallbackNames.length;
              const userName = fallbackNames[fallbackIndex];
              
              // Check if the generated name is Yash Singh Kuwarbi
              if (userName === "Yash Singh Kuwarbi") {
                setAuthor({
                  name: userName,
                  avatar: "/WhatsApp Image 2025-07-21 at 15.07.29_ff90baa4.jpg"
                });
              } else {
                setAuthor({
                  name: userName,
                  avatar: profileImages[avatarIndex]
                });
              }
            } catch (userError) {
              console.log("Could not fetch specific user details:", userError);
              const fallbackIndex = userIdHash % fallbackNames.length;
              const userName = fallbackNames[fallbackIndex];
              
              // Check if the generated name is Yash Singh Kuwarbi
              if (userName === "Yash Singh Kuwarbi") {
                setAuthor({
                  name: userName,
                  avatar: "/WhatsApp Image 2025-07-21 at 15.07.29_ff90baa4.jpg"
                });
              } else {
                setAuthor({
                  name: userName,
                  avatar: profileImages[avatarIndex]
                });
              }
            }
          }
        } catch (error) {
          console.log("Error fetching user details:", error);
          // In case of error, use a deterministic fallback
          const userIdHash = (userId?.length || 0) + (userId?.split('') || []).reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const avatarIndex = userIdHash % profileImages.length;
          const fallbackIndex = userIdHash % fallbackNames.length;
          
          setAuthor({
            name: fallbackNames[fallbackIndex],
            avatar: profileImages[avatarIndex] || defaultAvatar
          });
        }
      };
      
      fetchUserDetails();
    } else {
      // If no userId, use a deterministic approach based on post ID
      const postIdHash = $id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const avatarIndex = postIdHash % profileImages.length;
      const fallbackIndex = postIdHash % fallbackNames.length;
      const userName = fallbackNames[fallbackIndex];
      
      // Check if the generated name is Yash Singh Kuwarbi
      if (userName === "Yash Singh Kuwarbi") {
        setAuthor({
          name: userName,
          avatar: "/WhatsApp Image 2025-07-21 at 15.07.29_ff90baa4.jpg"
        });
      } else {
        setAuthor({
          name: userName,
          avatar: profileImages[avatarIndex] || defaultAvatar
        });
      }
    }
  }, [userId, $id]);
  
  // Format date (DD MMM YYYY)
  const formattedDate = new Date($createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  // Use stored readTime or provide a fallback
  const displayReadTime = readTime || 5; // Default to 5 minutes if not provided
  
  // Create excerpt from content - strip HTML tags and limit length
  const plainTextContent = stripHtmlTags(content);
  const excerpt = createExcerpt(plainTextContent, 120);
  
  // Generate direct URL for image
  const generateDirectImageUrl = (fileId) => {
    if (!fileId) return '';
    return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
  };
  
  // Get image URL - use direct URL first
  const [imageLoading, setImageLoading] = useState(true);
  const imageUrl = featuredImage ? generateDirectImageUrl(featuredImage) : '';
  
  return (
    <div className='w-full bg-secondary-white dark:bg-primary-charcoal rounded-xl overflow-hidden shadow-md'>
      <Link to={`/post/${$id}`} className="block">
        <div className='relative'>
          {/* Category Tag */}
          {category && (
            <span className='absolute top-4 left-4 bg-secondary-white dark:bg-primary-slate bg-opacity-70 text-primary-dark dark:text-secondary-white text-xs font-medium px-3 py-1 rounded-full z-10'>
              {category}
            </span>
          )}
          
          {/* Featured Image */}
          <div className='w-full aspect-[16/9] overflow-hidden relative'>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary-lightGray dark:bg-primary-slate">
                <div className="animate-pulse text-accent-blue opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
            <img 
              src={imageUrl} 
              alt={title}
              className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                if (!imageError) {
                  // If direct URL fails, try the appwrite service URL as fallback
                  setImageError(true);
                  setImageLoading(false);
                  e.target.src = appwriteService.getFilePreview(featuredImage);
                } else {
                  // If both fail, use a placeholder
                  setImageLoading(false);
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='400' y='200' font-family='Arial' font-size='32' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                }
              }}
            />
          </div>
        </div>
      </Link>
      
      {/* Content */}
      <div className='p-5'>
        {/* Date and Read Time */}
        <div className='flex items-center text-xs text-secondary-darkGray dark:text-secondary-mediumGray mb-2'>
          <span>{formattedDate}</span>
          <span className='mx-2'>•</span>
          <span>{displayReadTime} mins read</span>
          <span className='mx-2'>•</span>
          <span className='flex items-center'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {views} {views === 1 ? 'view' : 'views'}
          </span>
        </div>
        
        <Link to={`/post/${$id}`} className="block">
          {/* Title */}
          <h2 className='text-xl font-bold text-primary-dark dark:text-secondary-white mb-2 line-clamp-2'>{title}</h2>
          
          {/* Excerpt - now with plain text */}
          {excerpt && (
            <p className='text-secondary-darkGray dark:text-secondary-mediumGray text-base mb-4 line-clamp-3'>{excerpt}</p>
          )}
        </Link>
        
        {/* Footer with Author Info and Like Button */}
        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center'>
            <img 
              src={author.avatar} 
              alt={author.name}
              className='w-8 h-8 rounded-full object-cover'
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
            <span className='ml-2 text-sm font-medium text-primary-dark dark:text-secondary-white'>{author.name}</span>
          </div>
          
          {/* Like Button */}
          <LikeButton 
            postId={$id} 
            initialLikeCount={likeCount} 
            className="hover:scale-105 transition-transform duration-200"
          />
        </div>
      </div>
    </div>
  )
}

export default PostCard