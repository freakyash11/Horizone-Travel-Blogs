import React, { createContext, useState, useContext } from 'react';
import appwriteService from '../appwrite/config';

// Create context
const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query, maxResults = 50) => {
    setSearchQuery(query);
    
    if (!query || query.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      setError(null);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    setShowResults(true);
    setError(null);
    
    try {
      const results = await appwriteService.searchPosts(query);
      // Limit the number of results if maxResults is provided
      const limitedResults = results.documents?.length > maxResults 
        ? results.documents.slice(0, maxResults) 
        : (results.documents || []);
        
      setSearchResults(limitedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setError('Failed to complete search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setError(null);
    setIsSearching(false);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearching,
        showResults,
        error,
        handleSearch,
        clearSearch,
        setShowResults
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook to use the search context
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export default SearchContext; 