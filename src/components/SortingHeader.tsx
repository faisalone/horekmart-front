'use client';

import AnimatedElement from '@/components/AnimatedElement';
import { ListDropdown } from '@/components/ui/ListDropdown';

interface SortingHeaderProps {
  totalProducts: number;
  filteredProducts: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions: Array<{ value: string; label: string }>;
  categoryName?: string;
  showAdditionalInfo?: boolean;
  className?: string;
  isLoading?: boolean;
}

const SortingHeader = ({ 
  totalProducts, 
  filteredProducts, 
  sortBy, 
  onSortChange, 
  sortOptions,
  categoryName,
  showAdditionalInfo = true,
  className = '',
  isLoading = false
}: SortingHeaderProps) => {
  return (
    <AnimatedElement animation="slideUp" delay={200}>
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left side - Results and info */}
        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-theme-secondary rounded-full mr-3 animate-pulse"></div>
            <span className="text-gray-700 font-medium">
              {isLoading ? (
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mr-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <span className="text-2xl font-bold text-theme-secondary mr-2">{filteredProducts}</span>
                  products found
                  {totalProducts !== filteredProducts && (
                    <span className="text-gray-500 ml-2">of {totalProducts} total</span>
                  )}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Right side - Enhanced sorting controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Sort by:</span>
          </div>
          
          <ListDropdown
            value={sortBy}
            onValueChange={onSortChange}
            options={sortOptions}
            variant="light"
            className="min-w-[220px]"
          />
        </div>
      </div>
      
      {/* Additional filter info */}
      {showAdditionalInfo && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {categoryName ? 
                `Showing results for "${categoryName}" category` : 
                'Showing all products'
              }
            </span>
          </div>
        </div>
      )}
    </div>
    </AnimatedElement>
  );
};

export default SortingHeader;
