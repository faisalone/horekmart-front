'use client';

import AnimatedElement from '@/components/AnimatedElement';
import { ListDropdown } from '@/components/ui/ListDropdown';
import { X } from 'lucide-react';

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
  searchInput?: string;
  onClearSearch?: () => void;
  onResetAll?: () => void;
  showClearButton?: boolean;
  appliedFilters?: {
    priceRange?: [number, number];
    seller?: string[];
    inStock?: boolean;
  };

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
  isLoading = false,
  searchInput = '',
  onClearSearch,
  onResetAll,
  showClearButton = true,
  appliedFilters = {}
}: SortingHeaderProps) => {
  // Enhanced helper function for better readable descriptions
  const getFilterDescription = () => {
    const filteredCount = filteredProducts;
    
    // Check if any filters are actually applied
    const hasFilters = appliedFilters.priceRange || 
                      (appliedFilters.seller && appliedFilters.seller.length > 0) || 
                      appliedFilters.inStock !== undefined;
    
    if (searchInput?.trim()) {
      // Search query applied: "100 Results for 'test'"
      return `${filteredCount.toLocaleString()} Results for "${searchInput.trim()}"`;
    }
    
    // Don't show sort in label since quick filters are visually active
    // Just show "X products" for any applied sorting
    
    // If other filters are applied, show filtered count
    if (hasFilters) {
      return `${filteredCount.toLocaleString()} products`;
    }
    
    // Default state: "Total 1,250 products" (using total count when no filters)
    return `Total ${totalProducts.toLocaleString()} products`;
  };

  // Simple helper function to get sort label
  const getSortLabel = () => {
    const currentSortOption = sortOptions.find(option => option.value === sortBy);
    if (!currentSortOption) return 'Best Match';
    return currentSortOption.label;
  };

  return (
    <AnimatedElement animation="slideUp" delay={200}>
      <div className={`bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-3 mb-3 ${className}`}>
        {/* Desktop Layout - Horizontal */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          {/* Left side - Dynamic results description */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="flex items-center">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <span className="text-gray-800 font-semibold text-base tracking-tight">
                {getFilterDescription()}
              </span>
            )}
            
            {/* Modern Reset Button - Clean logic */}
            {showClearButton && (searchInput?.trim() || sortBy) && (
              <button
                onClick={() => {
                  onClearSearch?.();
                  onSortChange('');
                  onResetAll?.();
                }}
                className="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right side - Clean Sort Selector */}
          <div className="flex items-center gap-4">
            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Sort by</span>
              <span className="text-gray-400">|</span>
              <div className="[&>div]:!border-0 [&>div>button]:!border-0 [&>div>button]:!shadow-none [&>div>button]:!bg-transparent [&>div>button]:!p-0 [&>div>button]:!rounded-none [&>div>button]:!font-medium [&>div>button]:!text-gray-700 hover:[&>div>button]:!text-gray-900 [&>div>button]:!min-w-[180px] [&>div>button]:!w-auto [&>div>button]:!justify-start [&>div>button]:!outline-none [&>div>button]:focus:!outline-none [&>div>button]:focus:!ring-0 [&>div>button]:focus:!border-0">
                <ListDropdown
                  value={sortBy}
                  onValueChange={onSortChange}
                  options={sortOptions}
                  variant="light"
                  className="!border-0 !shadow-none !bg-transparent !outline-none focus:!outline-none focus:!ring-0 focus:!border-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-3">
          {/* Row 1: Product count */}
          <div className="flex items-center justify-between">
            <div>
              {isLoading ? (
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <span className="text-gray-800 font-semibold text-lg">
                  {getFilterDescription()}
                </span>
              )}
            </div>
            
            {/* Clear button on the right */}
            {(searchInput?.trim() || sortBy) && (
              <button
                onClick={() => {
                  onClearSearch?.();
                  onSortChange('');
                  onResetAll?.();
                }}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Row 2: Sort control inline */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-gray-600 text-sm font-medium shrink-0">Sort by</span>
            <div className="flex-1 min-w-0 [&>div]:!border-0 [&>div>button]:!border [&>div>button]:!border-gray-200 [&>div>button]:!shadow-none [&>div>button]:!bg-white [&>div>button]:!px-3 [&>div>button]:!py-2 [&>div>button]:!rounded-md [&>div>button]:!font-medium [&>div>button]:!text-gray-700 hover:[&>div>button]:!text-gray-900 [&>div>button]:!w-full [&>div>button]:!justify-between [&>div>button]:!outline-none [&>div>button]:focus:!outline-none [&>div>button]:focus:!ring-2 [&>div>button]:focus:!ring-blue-100 [&>div>button]:focus:!border-blue-300">
              <ListDropdown
                value={sortBy}
                onValueChange={onSortChange}
                options={sortOptions}
                variant="light"
                className="!border-0 !shadow-none !bg-transparent !outline-none focus:!outline-none focus:!ring-0 focus:!border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </AnimatedElement>
  );
};

export default SortingHeader;
