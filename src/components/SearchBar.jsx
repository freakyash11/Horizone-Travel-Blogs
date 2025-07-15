import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '../context/SearchContext';
import SearchResults from './SearchResults';

function SearchBar({ className = '', mobile = false }) {
  const { searchQuery, handleSearch, clearSearch } = useSearch();
  const [inputValue, setInputValue] = useState(searchQuery);
  const searchTimeout = useRef(null);
  const inputRef = useRef(null);

  // Update local input when searchQuery changes
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Debounce search input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set new timeout for search
    searchTimeout.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  // Clear search on escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search destination..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-accent-blue ${
            mobile
              ? 'bg-secondary-white bg-opacity-20 text-secondary-white placeholder-secondary-lightGray'
              : 'bg-secondary-white bg-opacity-90 text-primary-dark placeholder-secondary-darkGray'
          }`}
        />
        <div className={`absolute inset-y-0 ${mobile ? 'left-3' : 'right-3'} flex items-center`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${mobile ? 'text-secondary-white' : 'text-primary-slate'}`}
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
        {inputValue && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-10 flex items-center"
            aria-label="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${mobile ? 'text-secondary-white' : 'text-primary-slate'}`}
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