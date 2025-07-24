'use client';

import AnimatedElement from '@/components/AnimatedElement';
import ProductCard from '@/components/ProductCard';

const CategoryPageSkeleton = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section Skeleton */}
      <AnimatedElement animation="fadeIn">
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100">
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 lg:py-20">
            {/* Breadcrumb Skeleton */}
            <div className="mb-8">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <div className="max-w-4xl">
              <div className="space-y-6">
                <div>
                  {/* Category Title Skeleton */}
                  <div className="h-12 md:h-16 w-96 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="w-24 h-1 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                
                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Products Count Skeleton */}
                <div className="flex items-center space-x-6 pt-4">
                  <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-200/50 shadow-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded mr-2 animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements skeleton */}
          <div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-32 h-32 bg-gray-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-8 left-8 w-24 h-24 bg-gray-200/20 rounded-full blur-2xl animate-pulse"></div>
          
          {/* Bottom fade-out effect */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </div>
      </AnimatedElement>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Sorting Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left side skeleton */}
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mr-2"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Right side skeleton */}
              <div className="flex items-center gap-4">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Additional info skeleton */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex items-center gap-4">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCard key={i} isLoading={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPageSkeleton;
