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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const searchResults = await appwriteService.searchPosts(query);
        setResults(searchResults.documents || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
      // Update the search context
      handleSearch(query);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query, handleSearch]);

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
                <PostCard {...post} />
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

export default SearchPage; 