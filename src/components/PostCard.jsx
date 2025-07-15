import React from 'react'
import appwriteService from "../appwrite/config"
import {Link} from 'react-router-dom'

function PostCard({$id, title, featuredImage, content, $createdAt, category}) {
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
              src={appwriteService.getFilePreview(featuredImage)} 
              alt={title}
              className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
              loading="lazy"
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