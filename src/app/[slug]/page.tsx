'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import AnimatedElement from '@/components/AnimatedElement';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { ListDropdown } from '@/components/ui/ListDropdown';
import { publicApi } from '@/lib/public-api';
import { Product, Category } from '@/types';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductCheckout } from '@/services/ProductCheckoutService';

interface CategoryPageProps {}

export default function CategoryPage({}: CategoryPageProps) {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');

  // Cart and wishlist contexts
  const { toggleItem: toggleWishlist } = useWishlist();
  const { addToCart: addToCartService } = useProductCheckout();

  // Sort options for custom select
  const sortOptions = [
    { value: 'featured', label: '⭐ Featured Items' },
    { value: 'price-low', label: '💰 Price: Low to High' },
    { value: 'price-high', label: '💎 Price: High to Low' },
    { value: 'name', label: '🔤 Name A-Z' },
    { value: 'newest', label: '🆕 Newest First' }
  ];

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories to find the current one
        const categories = await publicApi.getCategories();
        const currentCategory = categories.find((cat: Category) => cat.slug === slug);
        
        if (!currentCategory) {
          router.push('/'); // Redirect to home if category not found
          return;
        }
        
        setCategory(currentCategory);
        
        // Fetch products for this category
        const allProducts = await publicApi.getFeaturedProducts();
        const categoryProducts = allProducts.filter(
          (product: Product) => product.category?.slug === slug
        );
        
        setProducts(categoryProducts);
        setFilteredProducts(categoryProducts);
      } catch (error) {
        console.error('Error fetching category data:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryData();
    }
  }, [slug, router]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.sale_price || a.price) - parseFloat(b.sale_price || b.price);
        case 'price-high':
          return parseFloat(b.sale_price || b.price) - parseFloat(a.sale_price || a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'featured':
        default:
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
    });

    setFilteredProducts(filtered);
  }, [products, sortBy]);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCartService(product.id.toString(), 1);
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
  };

  const handleAddToWishlist = (product: Product) => {
    const wishlistItem = {
      productId: product.id.toString(),
      productName: product.name,
      productImage: product.images?.[0]?.file_url || product.image || product.thumbnail || undefined,
      productSlug: product.slug,
      categorySlug: product.category?.slug,
      price: parseFloat(product.price),
      salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
      inStock: product.in_stock,
    };

    toggleWishlist(wishlistItem);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-theme-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading {slug}...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <Link href="/" className="text-theme-primary hover:text-theme-primary-dark font-medium">
            ← Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Background Image */}
      <AnimatedElement animation="fadeIn">
        <div className="relative overflow-hidden bg-theme-secondary-dark">
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 lg:py-20">
            {/* Background Image - Larger and covering content area with gradient mask */}
            {category.image && (
              <div className="absolute inset-0 -z-10">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${category.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.6,
                    mask: 'linear-gradient(to right, transparent 0%, transparent 5%, rgba(0, 0, 0, 0.3) 15%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0.3) 85%, transparent 95%, transparent 100%)',
                    WebkitMask: 'linear-gradient(to right, transparent 0%, transparent 5%, rgba(0, 0, 0, 0.3) 15%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0.3) 85%, transparent 95%, transparent 100%)'
                  }}
                />
                {/* Simple overlay for better text readability */}
                <div className="absolute inset-0 bg-theme-secondary-dark opacity-40"></div>
              </div>
            )}
            
            {/* Breadcrumb */}
            <div className="mb-8">
              <Breadcrumb 
                items={[
                  { label: category.name }
                ]}
                theme="dark"
                className="mb-0"
              />
            </div>
            
            <div className="max-w-4xl">
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                    {category.name}
                  </h1>
                  <div className="w-24 h-1 bg-white/80 rounded-full"></div>
                </div>
                
                <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                  {category.description || `Explore our carefully curated selection of premium ${category.name.toLowerCase()} products designed to meet your highest expectations.`}
                </p>
                
                <div className="flex items-center space-x-6 pt-4">
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
                      <span className="text-2xl font-bold text-white mr-2">{products.length}</span>
                      <span className="text-white/90 font-medium">Products Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-8 left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </AnimatedElement>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Controls Bar */}
        <AnimatedElement animation="slideUp" delay={200}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left side - Results and info */}
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-theme-secondary rounded-full mr-3 animate-pulse"></div>
                  <span className="text-gray-700 font-medium">
                    <span className="text-2xl font-bold text-theme-secondary mr-2">{filteredProducts.length}</span>
                    products found
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
                  onValueChange={(value: string) => setSortBy(value)}
                  options={sortOptions}
                  variant="light"
                  className="min-w-[220px]"
                />
              </div>
            </div>
            
            {/* Additional filter info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Showing results for "{category.name}" category</span>
                <div className="flex items-center gap-4">
                  <span>💝 Premium quality products</span>
                  <span>🚚 Fast shipping available</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>

        {/* Products Grid */}
        <AnimatedElement animation="fadeIn" delay={300}>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-theme-secondary/10 to-theme-primary/10">
                <Heart className="w-12 h-12 text-theme-secondary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">Try browsing other categories or return to home</p>
              <Link href="/" className="inline-flex items-center px-6 py-3 bg-theme-secondary-dark text-white rounded-lg font-medium transition-all duration-200 hover:bg-theme-secondary">
                Browse All Products
              </Link>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              loading={loading}
            />
          )}
        </AnimatedElement>
        </div>
      </div>
    </div>
  );
}