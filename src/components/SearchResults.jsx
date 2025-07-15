import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import appwriteService from '../appwrite/config';

function SearchResults() {
  const { searchResults, isSearching, showResults, searchQuery, setShowResults } = useSearch();
  const resultsRef = useRef(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowResults]);

  if (!showResults) return null;

  return (
    <div 
      ref={resultsRef}
      className="absolute top-full left-0 right-0 mt-2 bg-secondary-white dark:bg-primary-charcoal rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      {isSearching ? (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent-blue"></div>
          <p className="mt-2 text-secondary-darkGray dark:text-secondary-mediumGray">Searching...</p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="p-4 text-center text-secondary-darkGray dark:text-secondary-mediumGray">
          {searchQuery ? 'No results found' : 'Start typing to search'}
        </div>
      ) : (
        <div>
          <div className="p-3 border-b border-secondary-mediumGray dark:border-primary-slate">
            <p className="text-sm text-secondary-darkGray dark:text-secondary-mediumGray">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <ul>
            {searchResults.map((post) => (
              <li key={post.$id} className="border-b border-secondary-mediumGray dark:border-primary-slate last:border-0">
                <Link 
                  to={`/post/${post.$id}`}
                  className="block p-3 hover:bg-secondary-lightGray dark:hover:bg-primary-slate transition-colors"
                  onClick={() => setShowResults(false)}
                >
                  <div className="flex items-start">
                    {post.featuredImage && (
                      <div className="w-16 h-16 mr-3 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={appwriteService.getFilePreview(post.featuredImage)} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-primary-dark dark:text-secondary-white mb-1">{post.title}</h4>
                      <p className="text-sm text-secondary-darkGray dark:text-secondary-mediumGray line-clamp-2">
                        {post.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="p-3 border-t border-secondary-mediumGray dark:border-primary-slate">
            <Link 
              to={`/search?q=${encodeURIComponent(searchQuery)}`}
              className="block text-center text-accent-blue hover:text-accent-teal transition-colors"
              onClick={() => setShowResults(false)}
            >
              View all results
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults; 