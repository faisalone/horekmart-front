"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { Product } from '@/types';
import { cn, getProductImageUrl, getProductUrl } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { AutoFontText } from '@/components/AutoFontText';
import { Button } from '@/components/ui/button';
import { useProductCheckout } from '@/services/ProductCheckoutService';
import { useRouter } from 'next/navigation';
import { useGTM } from '@/hooks/useGTM';

export interface ProductCardProps {
  product?: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  className?: string;
  isLoading?: boolean;
}

const ProductCard = ({ product, onAddToCart, onAddToWishlist, className, isLoading = false }: ProductCardProps) => {
  const router = useRouter();
  const { buyNow } = useProductCheckout();
  const { trackAddToCart, trackButtonClick, trackProductView } = useGTM();
  // Show skeleton if loading or no product
  if (isLoading || !product) {
    return (
      <div className={cn(
        'group relative bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse',
        className
      )}>
        {/* Image skeleton */}
        <div className="relative aspect-square overflow-hidden bg-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
          
          {/* Action buttons skeleton */}
          <div className="absolute top-3 right-3 w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-3 right-3 w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        </div>

        <div className="p-4 space-y-3">
          {/* Price skeleton */}
          <div className="flex items-baseline gap-2">
            <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          
          {/* Product name skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
          </div>
          
          {/* Category and stock skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
          </div>

          {/* Stock status skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Normalize the product data to handle both API and legacy formats
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : product.salePrice;
  const hasDiscount = salePrice && salePrice < price;
  const inStock = product.in_stock ?? product.inStock ?? true;
  
  // Use utility function to get the correct image URL
  const productImage = getProductImageUrl(product);

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Track the "Buy Now" button click
      trackButtonClick('buy_now_product_card', 'product_card');
      trackAddToCart(product, 1);
      
      // Proceed directly to checkout for single-SKU products without variations
      const checkoutUrl = await buyNow(product.slug, 1);
      router.push(checkoutUrl);
    } catch (error) {
      console.error('Buy Now failed:', error);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    // Track wishlist addition
    trackButtonClick('add_to_wishlist', 'product_card');
    onAddToWishlist?.(product);
  };

  const hasVariations = Array.isArray((product as any).variants) && ((product as any).variants?.length ?? 0) > 0;
  const canBuyNow = inStock && !hasVariations;

  return (
    <div className={cn(
      'group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col h-full',
      className
    )}>
      <Link 
        href={getProductUrl(product)}
        onClick={() => trackProductView(product)}
      >
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
        </div>
      </Link>

      <div className="p-2 sm:p-4 flex flex-col flex-grow">
        <Link href={getProductUrl(product)} className="flex-grow">
          <div className="space-y-1 sm:space-y-2">
            {/* Category - Hidden on mobile to save space */}
            <div className="hidden sm:block text-sm text-gray-500">
              <AutoFontText>
                {product.category?.name || 'General'}
              </AutoFontText>
            </div>
            
            {/* Price - Stack vertically on mobile, horizontal on desktop */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-2">
              <span className="text-sm sm:text-lg font-bold text-gray-900">
                {formatCurrency(salePrice || price)}
              </span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">
                  {formatCurrency(price)}
                </span>
              )}
            </div>
            
            {/* Product Name with theme hover color - Allow up to 2 lines on mobile, 3 on desktop */}
            <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 sm:line-clamp-3 group-hover:text-theme-secondary transition-colors leading-tight">
              <AutoFontText>
                {product.name}
              </AutoFontText>
            </h3>
            
            {/* Vendor - Hidden on mobile to save space */}
            {product.vendor && (
              <div className="hidden sm:block text-sm text-gray-400">
                <AutoFontText>
                  by {product.vendor.business_name}
                </AutoFontText>
              </div>
            )}
          </div>
        </Link>

        {/* Bottom action area: ensure no empty space - This will always be at the bottom */}
        <div className="mt-auto pt-2 sm:pt-3">
          {canBuyNow ? (
            <Button
              onClick={handleBuyNow}
              className="w-full bg-theme-primary-dark hover:bg-theme-primary text-white py-1.5 sm:py-2 text-xs sm:text-sm font-semibold"
            >
              Buy Now
            </Button>
          ) : hasVariations ? (
            <Link href={getProductUrl(product)}>
              <Button
                className="w-full bg-theme-secondary-dark hover:bg-theme-secondary text-white py-1.5 sm:py-2 text-xs sm:text-sm font-semibold"
              >
                Choose Options
              </Button>
            </Link>
          ) : (
            <Link href={getProductUrl(product)}>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-800 hover:bg-gray-50 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold"
              >
                View Details
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
