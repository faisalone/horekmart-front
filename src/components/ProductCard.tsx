import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { cn, getProductImageUrl, getProductUrl } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  className?: string;
}

const ProductCard = ({ product, onAddToCart, onAddToWishlist, className }: ProductCardProps) => {
  // Normalize the product data to handle both API and legacy formats
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : product.salePrice;
  const hasDiscount = salePrice && salePrice < price;
  const inStock = product.in_stock ?? product.inStock ?? true;
  
  // Use utility function to get the correct image URL
  const productImage = getProductImageUrl(product);

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
      <Link href={getProductUrl(product)}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={productImage}
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
                Save {formatCurrency(price - salePrice!)}
              </div>
            )}
            {product.is_featured && (
              <div className="bg-theme-blue text-white text-xs font-bold px-2 py-1 rounded">
                Featured
              </div>
            )}
            {product.status === 'published' && (
              <div className="theme-badge-gradient text-white text-xs font-bold px-2 py-1 rounded">
                New
              </div>
            )}
          </div>

          {/* Quick Add Button with theme styling */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="absolute bottom-3 right-3 p-2 theme-button-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:bg-gray-400"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={getProductUrl(product)}>
          <div className="space-y-2">
            {/* Price - Large and prominent */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(salePrice || price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(price)}
                </span>
              )}
            </div>
            
            {/* Product Name with theme hover color */}
            <h3 className="text-base font-medium text-gray-900 line-clamp-2 group-hover:text-theme-teal transition-colors leading-tight">
              {product.name}
            </h3>
            
            {/* Category and Stock info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {product.category?.name || 'General'}
              </span>
              {product.is_featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                {inStock ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </span>
              {product.vendor && (
                <span className="text-xs text-gray-400">
                  by {product.vendor.business_name}
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
