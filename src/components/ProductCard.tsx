import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';
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
          
          {/* Wishlist Button */}
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
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <div className="space-y-2">
            {/* Price - Large and prominent */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                ${(product.salePrice || product.price).toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Product Name with theme hover color */}
            <h3 className="text-base font-medium text-gray-900 line-clamp-2 group-hover:text-theme-teal transition-colors leading-tight">
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

            {/* Brand and Tags */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">by {product.brand}</span>
              {product.tags?.includes('bestseller') && (
                <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-xs font-medium">
                  Bestseller
                </span>
              )}
              {product.tags?.includes('trending') && (
                <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-xs font-medium">
                  Trending
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
