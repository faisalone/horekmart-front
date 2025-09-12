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
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 ${className}`}>
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Results count */}
          <div className="flex items-center">
            {isLoading ? (
              <div className="flex items-center">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse mr-2"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <span className="text-gray-700 font-medium">
                <span className="text-xl font-bold text-theme-secondary mr-2">{filteredProducts}</span>
                products
                {totalProducts !== filteredProducts && (
                  <span className="text-gray-500 ml-1">of {totalProducts}</span>
                )}
              </span>
            )}
          </div>

          {/* Right side - Dropdown only */}
          <ListDropdown
            value={sortBy}
            onValueChange={onSortChange}
            options={sortOptions}
            variant="light"
            className="min-w-[180px]"
          />
        </div>
      </div>
    </AnimatedElement>
  );
};

export default SortingHeader;
