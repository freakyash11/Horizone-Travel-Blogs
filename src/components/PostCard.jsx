import React, { useState, useEffect } from 'react'
import appwriteService from "../appwrite/config"
import {Link} from 'react-router-dom'
import conf from "../conf/conf.js"
import authService from "../appwrite/auth"

// Map author names to specific profile images for consistency
const authorProfiles = {
  "Seraphina Isabella": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  "Maximilian Bartholomew": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  "Anastasia Evangeline": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  "Nathaniel Reginald": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
  "Percival Thaddeus": "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
  "Sebastian Montgomery": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop",
  "Arabella Serenity": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop", 
  "Calista Gwendolyn": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
  "Benjamin Augustus": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
};

// List of author names for random assignment
const authorNames = Object.keys(authorProfiles);

// Default placeholder avatar
const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'%3E%3C/path%3E%3C/svg%3E";

function PostCard({$id, title, featuredImage, content, $createdAt, category, userId}) {
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
          
          if (currentUser && currentUser.$id === userId) {
            // If it's the current user, use their name and find matching profile
            const userName = currentUser.name || authorNames[0];
            setAuthor({
              name: userName,
              // If user name exists in our mapping, use that image; otherwise use a deterministic choice
              avatar: authorProfiles[userName] || authorProfiles[authorNames[userId.length % authorNames.length]]
            });
          } else {
            // For other users, create a deterministic mapping based on userId
            // This ensures the same user always gets the same author name and avatar
            const nameIndex = userId.length % authorNames.length;
            const selectedName = authorNames[nameIndex];
            
            setAuthor({
              name: selectedName,
              avatar: authorProfiles[selectedName] || defaultAvatar
            });
          }
        } catch (error) {
          console.log("Error fetching user details:", error);
          // In case of error, use a deterministic fallback
          const nameIndex = (userId.length || 0) % authorNames.length;
          const selectedName = authorNames[nameIndex];
          
          setAuthor({
            name: selectedName,
            avatar: authorProfiles[selectedName] || defaultAvatar
          });
        }
      };
      
      fetchUserDetails();
    } else {
      // If no userId, use a deterministic approach based on post ID
      const nameIndex = $id.length % authorNames.length;
      const selectedName = authorNames[nameIndex];
      
      setAuthor({
        name: selectedName,
        avatar: authorProfiles[selectedName] || defaultAvatar
      });
    }
  }, [userId, $id]);
  
  // Format date (DD MMM YYYY)
  const formattedDate = new Date($createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  // Calculate read time (rough estimate: 200 words per minute)
  const readTime = content ? Math.ceil(content.split(/\s+/).length / 200) : 1;
  
  // Create excerpt from content
  const excerpt = content ? `${content.substring(0, 120)}${content.length > 120 ? '...' : ''}` : '';
  
  // Generate direct URL for image
  const generateDirectImageUrl = (fileId) => {
    if (!fileId) return '';
    return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
  };
  
  // Get image URL - use direct URL first
  const imageUrl = featuredImage ? generateDirectImageUrl(featuredImage) : '';
  
  return (
    <Link to={`/post/${$id}`} className="block transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className='w-full bg-secondary-white dark:bg-primary-charcoal rounded-xl overflow-hidden shadow-md'>
        <div className='relative'>
          {/* Category Tag */}
          {category && (
            <span className='absolute top-4 left-4 bg-secondary-white dark:bg-primary-slate bg-opacity-70 text-primary-dark dark:text-secondary-white text-xs font-medium px-3 py-1 rounded-full z-10'>
              {category}
            </span>
          )}
          
          {/* Featured Image */}
          <div className='w-full aspect-[16/9] overflow-hidden'>
            <img 
              src={imageUrl} 
              alt={title}
              className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
              loading="lazy"
              onError={(e) => {
                if (!imageError) {
                  // If direct URL fails, try the appwrite service URL as fallback
                  setImageError(true);
                  e.target.src = appwriteService.getFilePreview(featuredImage);
                } else {
                  // If both fail, use a placeholder
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='400' y='200' font-family='Arial' font-size='32' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                }
              }}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className='p-5'>
          {/* Date and Read Time */}
          <div className='flex items-center text-xs text-secondary-darkGray dark:text-secondary-mediumGray mb-2'>
            <span>{formattedDate}</span>
            <span className='mx-2'>•</span>
            <span>{readTime} mins read</span>
          </div>
          
          {/* Title */}
          <h2 className='text-xl font-bold text-primary-dark dark:text-secondary-white mb-2 line-clamp-2'>{title}</h2>
          
          {/* Excerpt */}
          {excerpt && (
            <p className='text-secondary-darkGray dark:text-secondary-mediumGray text-base mb-4 line-clamp-3'>{excerpt}</p>
          )}
          
          {/* Author Info */}
          <div className='flex items-center mt-4'>
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
        </div>
      </div>
    </Link>
  )
}

export default PostCard