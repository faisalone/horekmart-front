'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchHelpArticles, HelpArticle } from '@/data/helpData';

interface HelpSearchProps {
  placeholder?: string;
  onResultClick?: () => void;
  className?: string;
  showViewAllResults?: boolean;
}

export default function HelpSearch({ 
  placeholder = "Ex. where's my order", 
  onResultClick,
  className = "",
  showViewAllResults = true
}: HelpSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HelpArticle[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        setIsLoading(true);
        // Simulate API delay
        setTimeout(() => {
          const searchResults = searchHelpArticles(query);
          setResults(searchResults);
          setIsOpen(true);
          setIsLoading(false);
        }, 200);
      } else {
        setResults([]);
        setIsOpen(false);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleResultClick = () => {
    setIsOpen(false);
    onResultClick?.();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/help/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleViewAllResults = () => {
    if (query.trim()) {
      router.push(`/help/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            
            <button 
              type="submit"
              className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  Search Results for &quot;{query}&quot;
                </p>
                <p className="text-xs text-gray-500">
                  {results.length} search results for {query}
                </p>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {results.slice(0, 5).map((article, index) => (
                  <Link
                    key={article.id}
                    href={article.url}
                    onClick={handleResultClick}
                    className="block p-4 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {article.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>

              {(results.length > 5 || showViewAllResults) && (
                <div className="p-3 text-center border-t border-gray-100">
                  <button
                    onClick={handleViewAllResults}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all {results.length} results →
                  </button>
                </div>
              )}
            </>
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                No results found
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Try different keywords or browse our help topics
              </p>
              {showViewAllResults && (
                <button
                  onClick={handleViewAllResults}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View search page →
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
