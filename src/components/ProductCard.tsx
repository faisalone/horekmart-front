import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Plus } from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  className?: string;
}

const ProductCard = ({ product, onAddToCart, onAddToWishlist, className }: ProductCardProps) => {
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart?.(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToWishlist?.(product);
  };

  return (
    <div className={cn(
      'group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200',
      className
    )}>
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Wishlist Button - Walmart style */}
          <button
            onClick={handleAddToWishlist}
            className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </button>

          {/* Badges with theme styling */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {hasDiscount && (
              <div className="bg-theme-green text-white text-xs font-bold px-2 py-1 rounded">
                Save ${(product.price - product.salePrice!).toFixed(0)}
              </div>
            )}
            {product.tags?.includes('rollback') && (
              <div className="bg-theme-blue text-white text-xs font-bold px-2 py-1 rounded">
                Rollback
              </div>
            )}
            {product.tags?.includes('new') && (
              <div className="theme-badge-gradient text-white text-xs font-bold px-2 py-1 rounded">
                New
              </div>
            )}
          </div>

          {/* Quick Add Button with theme styling */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="absolute bottom-3 right-3 p-2 theme-button-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:bg-gray-400"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <div className="space-y-2">
            {/* Price - Walmart style large and prominent */}
            <div className="flex items-baseline gap-2">
              <div className="flex items-baseline">
                <span className="text-xs text-gray-600">$</span>
                <span className="text-xl font-bold text-gray-900">
                  {Math.floor(product.salePrice || product.price)}
                </span>
                <span className="text-sm text-gray-600">
                  {((product.salePrice || product.price) % 1 * 100).toFixed(0).padStart(2, '0')}
                </span>
              </div>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Product Name with theme hover color */}
            <h3 className="text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
              {product.name}
            </h3>
            
            {/* Rating and Reviews */}
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount})
              </span>
            </div>

            {/* Shipping Info with theme green */}
            <div className="text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span className="text-theme-green font-medium">Free shipping</span>
                <span>arrives in 3+ days</span>
              </div>
            </div>

            {/* Options with theme blue */}
            {product.variants && product.variants.length > 0 && (
              <div className="text-xs text-theme-blue">
                +{product.variants.length} options
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
