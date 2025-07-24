import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearch } from '../context/SearchContext';
import SearchResults from './SearchResults';

function SearchBar({ className = '', mobile = false, maxResultsToShow = 50 }) {
  const { searchQuery, handleSearch, clearSearch } = useSearch();
  const [inputValue, setInputValue] = useState(searchQuery);
  const searchTimeout = useRef(null);
  const inputRef = useRef(null);

  // Update local input when searchQuery changes
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Debounced search handler with useCallback to prevent unnecessary recreations
  const debouncedSearch = useCallback((value) => {
    // Don't search with very short queries
    if (value.trim().length < 1) {
      clearSearch();
      return;
    }
    
    handleSearch(value, maxResultsToShow);
  }, [handleSearch, clearSearch, maxResultsToShow]);
  
  // Debounce search input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Clear search if input is empty
    if (!value.trim()) {
      clearSearch();
      return;
    }
    
    // Set new timeout for search with a 400ms debounce
    searchTimeout.current = setTimeout(() => {
      debouncedSearch(value);
    }, 400);
  };

  // Clear search on escape key or when input is cleared
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
      setInputValue('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className={`absolute inset-y-0 ${mobile ? 'left-3' : 'left-3'} flex items-center`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${
              mobile 
                ? 'text-secondary-white dark:text-primary-dark' 
                : 'text-primary-slate dark:text-primary-slate'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search blogs"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-full py-2 px-4 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-accent-blue ${
            mobile
              ? 'bg-secondary-white bg-opacity-20 text-secondary-white dark:bg-primary-dark dark:bg-opacity-20 dark:text-primary-dark placeholder-secondary-lightGray dark:placeholder-primary-slate'
              : 'bg-secondary-white bg-opacity-90 text-primary-dark dark:bg-secondary-mediumGray dark:text-primary-dark placeholder-secondary-darkGray'
          }`}
          aria-label="Search"
        />
        {inputValue && (
          <button
            onClick={() => {
              clearSearch();
              setInputValue('');
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-3 flex items-center"
            aria-label="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${
                mobile 
                  ? 'text-secondary-white dark:text-primary-dark' 
                  : 'text-primary-slate dark:text-primary-slate'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <SearchResults />
    </div>
  );
}

export default SearchBar; 