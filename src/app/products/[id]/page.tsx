'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Star, Heart, ShoppingCart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import ImageGallery from '@/components/ui/ImageGallery';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import VariantSelector from '@/components/ui/VariantSelector';
import QuantitySelector from '@/components/ui/QuantitySelector';
import ProductGrid from '@/components/ProductGrid';
import { getMockProductById, getMockProducts } from '@/lib/mock-data';
import { formatCurrency, calculateDiscountPercentage, cn } from '@/lib/utils';
import { Product, ProductVariant } from '@/types';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');

  useEffect(() => {
    const loadProduct = async () => {
      const resolvedParams = await params;
      const foundProduct = getMockProductById(resolvedParams.id);
      if (!foundProduct) {
        notFound();
        return;
      }
      setProduct(foundProduct);

      // Get related products from same category
      const allProducts = getMockProducts();
      const related = allProducts
        .filter(p => p.id !== resolvedParams.id && p.category === foundProduct.category)
        .slice(0, 4);
      setRelatedProducts(related);
    };
    
    loadProduct();
  }, [params]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercentage = hasDiscount 
    ? calculateDiscountPercentage(product.price, product.salePrice!)
    : 0;

  const groupedVariants = product.variants?.reduce((acc, variant) => {
    if (!acc[variant.type]) {
      acc[variant.type] = [];
    }
    acc[variant.type].push(variant);
    return acc;
  }, {} as Record<string, ProductVariant[]>) || {};

  const handleVariantChange = (variantType: string, variantId: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantType]: variantId
    }));
  };

  const handleAddToCart = () => {
    console.log('Adding to cart:', {
      product: product.name,
      quantity,
      selectedVariants
    });
    // TODO: Implement cart functionality
  };

  const handleAddToWishlist = () => {
    console.log('Adding to wishlist:', product.name);
    // TODO: Implement wishlist functionality
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8 text-sm">
        <ol className="flex items-center space-x-2">
          <li><a href="/" className="text-gray-500 hover:text-gray-700">Home</a></li>
          <li><span className="text-gray-400">/</span></li>
          <li><a href="/products" className="text-gray-500 hover:text-gray-700">Products</a></li>
          <li><span className="text-gray-400">/</span></li>
          <li><a href={`/categories/${product.category.toLowerCase()}`} className="text-gray-500 hover:text-gray-700">{product.category}</a></li>
          <li><span className="text-gray-400">/</span></li>
          <li className="text-gray-900">{product.name}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div>
          <ImageGallery 
            images={product.images || [product.image]} 
            alt={product.name}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand & Name */}
          <div>
            <p className="text-lg text-gray-600 font-medium">{product.brand}</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(product.salePrice || product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
                <Badge variant="error">
                  Save {discountPercentage}%
                </Badge>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              product.inStock ? 'bg-green-500' : 'bg-red-500'
            )} />
            <span className={cn(
              'font-medium',
              product.inStock ? 'text-green-700' : 'text-red-700'
            )}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Product Description */}
          <div>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Variants */}
          {Object.entries(groupedVariants).map(([variantType, variants]) => (
            <VariantSelector
              key={variantType}
              variants={variants}
              selectedVariant={selectedVariants[variantType]}
              onChange={(variantId) => handleVariantChange(variantType, variantId)}
              label={variantType.charAt(0).toUpperCase() + variantType.slice(1)}
            />
          ))}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">Quantity:</span>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                disabled={!product.inStock}
              />
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleAddToWishlist}
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck className="h-5 w-5" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <RotateCcw className="h-5 w-5" />
              <span>30-day return policy</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="h-5 w-5" />
              <span>2-year warranty included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: 'description', label: 'Description' },
              { key: 'reviews', label: 'Reviews' },
              { key: 'shipping', label: 'Shipping & Returns' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p>{product.description}</p>
              <p className="mt-4">
                This premium product from {product.brand} offers exceptional quality and performance. 
                Perfect for those who demand the best in {product.category.toLowerCase()}.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-6 w-6',
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium">{product.rating} out of 5</span>
                <span className="text-gray-500">({product.reviewCount} reviews)</span>
              </div>
              <p className="text-gray-600">Customer reviews will be displayed here.</p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Shipping Information</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Free standard shipping on orders over $50</li>
                  <li>• Express shipping available for $9.99</li>
                  <li>• Delivery within 3-7 business days</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Returns & Exchanges</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• 30-day return policy</li>
                  <li>• Items must be in original condition</li>
                  <li>• Free return shipping on defective items</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
          <ProductGrid
            products={relatedProducts}
            onAddToCart={(product) => console.log('Adding to cart:', product.name)}
            onAddToWishlist={(product) => console.log('Adding to wishlist:', product.name)}
          />
        </div>
      )}
    </div>
  );
}
