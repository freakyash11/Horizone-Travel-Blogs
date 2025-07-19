import React, { useState } from 'react'
import appwriteService from "../appwrite/config"
import {Link} from 'react-router-dom'
import conf from "../conf/conf.js"

function PostCard({$id, title, featuredImage, content, $createdAt, category}) {
  const [imageError, setImageError] = useState(false);
  
  // Format date
  const formattedDate = new Date($createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
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
            <span className='absolute top-4 left-4 bg-secondary-lightGray dark:bg-primary-slate bg-opacity-90 text-primary-slate dark:text-secondary-lightGray text-xs font-medium px-3 py-1 rounded-full z-10'>
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
                  console.log("Direct image URL failed, trying service URL for:", title);
                  e.target.src = appwriteService.getFilePreview(featuredImage);
                } else {
                  // If both fail, use a placeholder
                  console.log("Both image URLs failed for:", title);
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='400' y='200' font-family='Arial' font-size='32' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                }
              }}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className='p-5'>
          {/* Title */}
          <h2 className='text-xl font-bold text-primary-dark dark:text-secondary-white mb-2 line-clamp-2'>{title}</h2>
          
          {/* Excerpt */}
          {excerpt && (
            <p className='text-secondary-darkGray dark:text-secondary-mediumGray text-base mb-4 line-clamp-3'>{excerpt}</p>
          )}
          
          {/* Metadata */}
          <div className='flex items-center text-xs text-secondary-darkGray dark:text-secondary-mediumGray'>
            <span>{formattedDate}</span>
            <span className='mx-2'>•</span>
            <span>{readTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PostCard