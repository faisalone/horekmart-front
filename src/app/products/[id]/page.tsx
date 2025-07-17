'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Minus, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { publicApi } from '@/lib/public-api';
import { Product } from '@/types';
import { getProductImageUrl } from '@/lib/utils';

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const productId = resolvedParams.id;
        
        // Get single product
        const productData = await publicApi.getProduct(productId);
        setProduct(productData);
        setSelectedImageIndex(0); // Reset image selection when product changes
        
        // Get all products to find related ones
        const productsResponse = await publicApi.getProducts();
        const related = productsResponse.data
          .filter(p => p.id !== productData.id && p.category_id === productData.category_id)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = parseFloat(product.price);
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const hasDiscount = salePrice && salePrice < price;

  const handleAddToCart = () => {
    console.log('Adding to cart:', { product, quantity });
  };

  const handleAddToWishlist = () => {
    console.log('Adding to wishlist:', product);
  };

  // Helper function to get all available images
  const getAllImages = () => {
    const images = [];
    
    // Add main thumbnail if available
    if (product.thumbnail) {
      images.push({
        url: product.thumbnail,
        alt: `${product.name} - Main Image`,
        type: 'thumbnail'
      });
    }
    
    // Add all product images
    if (product.images && product.images.length > 0) {
      product.images.forEach((img, index) => {
        images.push({
          url: img.file_url,
          alt: img.alt_text || `${product.name} - Image ${index + 1}`,
          type: 'gallery'
        });
      });
    }
    
    // Fallback to main image if no other images
    if (images.length === 0 && product.image) {
      images.push({
        url: product.image,
        alt: product.name,
        type: 'main'
      });
    }
    
    // If still no images, use placeholder
    if (images.length === 0) {
      images.push({
        url: getProductImageUrl(product),
        alt: product.name,
        type: 'placeholder'
      });
    }
    
    return images;
  };

  const allImages = getAllImages();
  const hasMultipleImages = allImages.length > 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>›</span>
          <Link href="/products" className="hover:text-gray-700">Products</Link>
          <span>›</span>
          <Link href={`/categories/${product.category?.slug || ''}`} className="hover:text-gray-700">
            {product.category?.name || 'Category'}
          </Link>
          <span>›</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={allImages[selectedImageIndex]?.url || getProductImageUrl(product)}
                alt={allImages[selectedImageIndex]?.alt || product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Navigation */}
            {hasMultipleImages && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Name */}
            <div>
              <p className="text-lg text-gray-600 font-medium">{product.vendor?.business_name || 'Unknown Vendor'}</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(salePrice || price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatCurrency(price)}
                  </span>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                    Save {formatCurrency(price - salePrice!)}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                product.in_stock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.in_stock ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </span>
              {product.is_featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-900">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleAddToWishlist}
                  variant="outline"
                  className="border-gray-300"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div>
                <span className="text-sm font-medium text-gray-900">SKU: </span>
                <span className="text-sm text-gray-600">{product.sku}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Category: </span>
                <span className="text-sm text-gray-600">{product.category?.name || 'General'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Vendor: </span>
                <span className="text-sm text-gray-600">{product.vendor?.business_name || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      <Image
                        src={getProductImageUrl(relatedProduct)}
                        alt={relatedProduct.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(relatedProduct.sale_price || relatedProduct.price)}
                        </span>
                        {relatedProduct.sale_price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(relatedProduct.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
