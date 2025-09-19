'use client';

import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { cn } from '@/lib/utils';

export interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  className?: string;
  loading?: boolean;
}

const ProductGrid = ({
  products,
  onAddToCart,
  onAddToWishlist,
  className,
  loading = false,
}: ProductGridProps) => {
  if (loading) {
    return (
      <div className={cn(
        'grid gap-6',
        className || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      )}>
        {[...Array(8)].map((_, i) => (
          <ProductCard key={i} isLoading={true} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid gap-6',
      className || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    )}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
