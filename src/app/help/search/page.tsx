'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, ArrowLeft } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import HelpSearch from '@/components/HelpSearch';
import { searchHelpArticles, HelpArticle } from '@/data/helpData';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
        const searchResults = searchHelpArticles(query);
        setResults(searchResults);
        setIsLoading(false);
      }, 300);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [query]);

  const handleNewSearch = () => {
    // The search component will handle navigation
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb 
            items={[
              { label: 'Help Center', href: '/help' },
              { label: 'Search' }
            ]} 
            className="mb-8" 
          />
          
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Help Center</h1>
            <p className="text-gray-600 mb-8">Enter a search term to find help articles</p>
            
            <div className="max-w-2xl mx-auto">
              <HelpSearch 
                placeholder="Ex. where's my order" 
                onResultClick={handleNewSearch}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Help Center', href: '/help' },
            { label: `Search Results for "${query}"` }
          ]} 
          className="mb-8" 
        />

        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Search Results for &quot;{query}&quot;
              </h1>
              {!isLoading && (
                <p className="text-gray-600">
                  {results.length} search results for {query}
                </p>
              )}
            </div>
            
            <Link
              href="/help"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <HelpSearch 
              placeholder="Ex. where's my order" 
              onResultClick={handleNewSearch}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-full mb-1"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              {results.map((article, index) => (
                <div key={article.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <Link
                    href={article.url}
                    className="block group hover:bg-gray-50 rounded-lg p-4 -m-4 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-blue-600 group-hover:text-blue-800 mb-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {article.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            {article.category}
                          </span>
                          <span>Last updated: {article.lastUpdated}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0 group-hover:text-gray-600" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No results found for &quot;{query}&quot;
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Try different keywords or browse our help topics below
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <Link
                  href="/help/track-order"
                  className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-1">Track an Order</h3>
                  <p className="text-sm text-gray-600">Find your order status</p>
                </Link>
                
                <Link
                  href="/help/return-policy"
                  className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-1">Returns & Refunds</h3>
                  <p className="text-sm text-gray-600">Return policy and process</p>
                </Link>
                
                <Link
                  href="/help/payment-methods"
                  className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-1">Payment Methods</h3>
                  <p className="text-sm text-gray-600">Manage payment options</p>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Chat Section */}
        {!isLoading && (
          <div className="mt-16 text-center">
            <div className="p-6 bg-gray-50 rounded-lg max-w-md mx-auto">
              <h4 className="font-medium text-gray-900 mb-2">Didn&apos;t find what you were looking for?</h4>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Chat with us
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchResultsContent />
    </Suspense>
  );
}
