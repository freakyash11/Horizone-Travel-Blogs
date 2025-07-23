import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, PostCard } from '../components';
import appwriteService from '../appwrite/config';
import { useSearch } from '../context/SearchContext';

function SearchPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';
  
  const { handleSearch } = useSearch();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only start loading and make API call if there's a query
    if (!query) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const searchResults = await appwriteService.searchPosts(query);
        setResults(searchResults.documents || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('An error occurred while searching. Please try again later.');
        setResults([]);
      } finally {
        // Always set loading to false when done, regardless of success or error
        setLoading(false);
      }
    };

    fetchResults();
    // Update the search context only when query changes
    handleSearch(query);
    
  }, [query]);  // Remove handleSearch from dependencies to avoid potential loops

  return (
    <div className="py-16 bg-secondary-lightGray dark:bg-primary-dark min-h-screen">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-dark dark:text-secondary-white mb-4">
            Search Results
          </h1>
          {query && (
            <p className="text-lg text-secondary-darkGray dark:text-secondary-mediumGray">
              {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-lg text-red-500 dark:text-red-400 mb-4">{error}</p>
            <p className="text-secondary-darkGray dark:text-secondary-mediumGray">
              Please try again or modify your search terms.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-primary-dark dark:text-secondary-white mb-6">
              No results found
            </h2>
            <p className="text-lg text-secondary-darkGray dark:text-secondary-mediumGray mb-8 max-w-2xl mx-auto">
              {query
                ? `We couldn't find any posts matching "${query}". Try a different search term.`
                : 'Enter a search term to find posts.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((post) => (
              <div key={post.$id} data-animate="scale-up">
                <PostCard 
                  $id={post.$id} 
                  title={post.title} 
                  featuredImage={post.featuredImage} 
                  content={post.content} 
                  $createdAt={post.$createdAt} 
                  category={post.category} 
                  userId={post.userId}
                  readTime={post.readTime}
                  views={post.views || 0}
                />
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

export default SearchPage; 