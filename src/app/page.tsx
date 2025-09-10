'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, ShoppingCart, Settings } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import PromoBanner from '@/components/PromoBanner';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/public-api';
import { Product, Category, Vendor } from '@/types';
import BannerBlock from '@/components/BannerBlock';
import BannerBlockSkeleton from '@/components/BannerBlockSkeleton';
import AnimatedElement from '@/components/AnimatedElement';
import { AnimatedSection, useSequentialAnimation } from '@/lib/animations';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductCheckout } from '@/services/ProductCheckoutService';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart and wishlist contexts
  const { toggleItem: toggleWishlist } = useWishlist();
  const { addToCart: addToCartService } = useProductCheckout();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products and categories - simplified to just get a large set of products
        const [productsResponse, categoriesData, vendorsResponse] = await Promise.all([
          publicApi.getProducts({ per_page: 50 }), // Get more products to have variety
          publicApi.getCategories(),
          publicApi.getVendors(),
        ]);

        // Use the data array from the API response
        const allProducts = productsResponse?.data || [];
        const allVendors = vendorsResponse?.data || [];
        
        setProducts(allProducts);
        setVendors(allVendors);
        
        // Sort categories by sort_order and take first 9
        const sortedCategories = (categoriesData || [])
          .sort((a: Category, b: Category) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .slice(0, 9);
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Keep loading as false to show the page even if API fails
        setProducts([]);
        setCategories([]);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Compute different product sections from the main products array
  const featuredProducts = products.filter(p => p.is_featured).slice(0, 8);
  const popularProducts = products.slice(0, 8); // First 8 products
  const latestProducts = products.slice(8, 16); // Next 8 products  
  const mostViewedProducts = products.slice(16, 24); // Next 8 products
  const saleProducts = products.filter(p => p.sale_price && parseFloat(p.sale_price) < parseFloat(p.price)).slice(0, 8);

  // Function to generate initials from business name
  const generateInitials = (businessName: string): string => {
    return businessName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2) // Take first 2 initials
      .join('');
  };

  // Create dynamic brand/vendor data
  const getBrandData = () => {
    if (vendors.length === 0) return [];
    
    // Filter only approved and active vendors
    const activeVendors = vendors.filter(vendor => 
      vendor.status === 'approved' && vendor.is_active
    );
    
    return activeVendors.slice(0, 12).map(vendor => ({
      id: vendor.id,
      name: vendor.business_name,
      logo: vendor.logo || null, // Vendors might not have logos
      initials: generateInitials(vendor.business_name),
      items: products.filter(p => p.vendor?.business_name === vendor.business_name).length,
      slug: vendor.business_name.toLowerCase().replace(/\s+/g, '-'),
    }));
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCartService(product.slug, 1);
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
  };

  const handleAddToWishlist = (product: Product) => {
    // Handle new image format
    let productImage: string | undefined;
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0] as any;
      if (typeof firstImage === 'object' && firstImage.url) {
        productImage = firstImage.url;
      } else if (typeof firstImage === 'object' && firstImage.file_url) {
        productImage = firstImage.file_url;
      } else if (typeof firstImage === 'string') {
        productImage = firstImage;
      }
    }

    const wishlistItem = {
      productId: product.id.toString(),
      productName: product.name,
      productImage: productImage || product.image || product.thumbnail || undefined,
      productSlug: product.slug,
      categorySlug: product.category?.slug,
      price: parseFloat(product.price),
      salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
      inStock: product.in_stock,
    };

    toggleWishlist(wishlistItem);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Promotional Banner */}
      {/* <AnimatedElement animation="slideDown">
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <PromoBanner />
          </div>
        </section>
      </AnimatedElement> */}

      {/* Main Banner Section - Enhanced 3 Row Masonry Layout */}
      <AnimatedElement animation="fadeIn" delay={200}>
        <section className="bg-gradient-to-br from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            
            {/* Enhanced 3 Row Masonry Grid Layout with better mobile experience */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-6">
              {loading ? (
                // Show skeleton loaders while loading
                Array.from({ length: 9 }, (_, idx) => (
                  <BannerBlockSkeleton
                    key={idx}
                    className={
                      idx === 0 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-1 lg:order-1' :
                      idx === 1 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-2 lg:order-2' :
                      idx === 2 ? 'col-span-2 md:col-span-2 lg:col-span-6 order-3 lg:order-3' :
                      idx === 3 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-4 lg:order-6' :
                      idx === 4 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-5 lg:order-7' :
                      idx === 5 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-6 lg:order-8' :
                      idx === 6 ? 'col-span-1 row-span-2 md:col-span-1 md:row-span-2 lg:col-span-3 lg:row-span-2 order-7 md:order-7 lg:order-4' :
                      idx === 7 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-8 md:order-8 lg:order-10' :
                      idx === 8 ? 'col-span-2 md:col-span-2 lg:col-span-6 order-9 md:order-9 lg:order-5' :
                      ''
                    }
                    height={
                      idx === 6 ? 'h-[25rem]' :
                      idx === 2 ? 'h-64' :
                      idx === 0 || idx === 1 ? 'h-64' :
                      idx === 3 || idx === 4 || idx === 5 || idx === 7 || idx === 8 ? 'h-48' :
                      'h-48'
                    }
                  />
                ))
              ) : (
                // Show actual categories when loaded
                categories.map((cat, idx) => (
                  <BannerBlock
                    key={cat.id}
                    title={cat.name}
                    description={cat.description || ''}
                    imageUrl={cat.image || 'https://placehold.co/400x300?text=Category'}
                    link={`/${cat.slug}`}
                    className={
                      idx === 0 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-1 lg:order-1' :
                      idx === 1 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-2 lg:order-2' :
                      idx === 2 ? 'col-span-2 md:col-span-2 lg:col-span-6 order-3 lg:order-3' :
                      idx === 3 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-4 lg:order-6' :
                      idx === 4 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-5 lg:order-7' :
                      idx === 5 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-6 lg:order-8' :
                      idx === 6 ? 'col-span-1 row-span-2 md:col-span-1 md:row-span-2 lg:col-span-3 lg:row-span-2 order-7 md:order-7 lg:order-4' :
                      idx === 7 ? 'col-span-1 md:col-span-1 lg:col-span-3 order-8 md:order-8 lg:order-10' :
                      idx === 8 ? 'col-span-2 md:col-span-2 lg:col-span-6 order-9 md:order-9 lg:order-5' :
                      ''
                    }
                    height={
                      idx === 6 ? 'h-[25rem]' :
                      idx === 2 ? 'h-64' :
                      idx === 0 || idx === 1 ? 'h-64' :
                      idx === 3 || idx === 4 || idx === 5 || idx === 7 || idx === 8 ? 'h-48' :
                      'h-48'
                    }
                    textSize={
                      idx === 2 ? 'xlarge' :
                      idx === 6 || idx === 8 ? 'large' :
                      idx === 0 || idx === 1 || idx === 7 ? 'medium' :
                      idx === 3 || idx === 4 || idx === 5 ? 'small' :
                      'medium'
                    }
                  />
                ))
              )}
            </div>
        </div>
      </section>
      </AnimatedElement>

      {/* Popular Products Section - Moved below Main Banner */}
      <AnimatedElement animation="scaleUp" delay={300}>
        <section className="py-16 bg-theme-subtle-secondary">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                🔥 Trending Now
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover what everyone&apos;s talking about - our most popular picks that are flying off the shelves
              </p>
            </div>
            
            <ProductGrid
              products={popularProducts}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              loading={loading}
            />

            <div className="text-center mt-8">
              <Link href="/products?featured=true" className="inline-flex items-center text-theme-secondary hover:text-theme-secondary-dark text-lg font-semibold bg-theme-secondary/10 hover:bg-theme-secondary/20 px-6 py-3 rounded-full transition-all hover:scale-105">
                View All Popular Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </AnimatedElement>

      {/* Flash Deals Section with Enhanced Design */}
      <AnimatedElement animation="slideUp" delay={400}>
        <section id="flash-deals" className="theme-gradient-primary text-white py-16 relative overflow-hidden scroll-mt-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-32 w-12 h-12 bg-white rounded-full animate-pulse delay-500"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative">
            <div className="text-center mb-12 scroll-mt-32" id="flash-deals-title">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">⚡ Flash Deals</h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium">
                Lightning-fast savings that won&apos;t last long - grab these deals before they disappear!
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 8 }, (_, index) => (
                  <ProductCard key={`skeleton-${index}`} isLoading={true} />
                ))
              ) : (
                saleProducts.slice(0, 8).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))
              )}
            </div>

            <div className="text-center mt-12">
              <Link href="/deals" className="inline-flex items-center text-white hover:text-white/80 text-lg font-semibold bg-white/10 hover:bg-white/20 px-8 py-4 rounded-full transition-all hover:scale-105 border-2 border-white/30">
                Shop All Flash Deals <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </div>
          </div>
        </section>
      </AnimatedElement>

      {/* Latest Products Section */}
      <AnimatedElement animation="slideLeft" delay={500}>
        <section className="py-16 bg-theme-subtle-primary">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                ✨ Fresh Arrivals
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Be the first to explore our newest additions - straight from the latest collections
              </p>
            </div>
            
            <ProductGrid
              products={latestProducts}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              loading={loading}
            />

            <div className="text-center mt-8">
              <Link href="/products?sort=latest" className="inline-flex items-center text-theme-secondary hover:text-theme-secondary-dark text-lg font-semibold bg-theme-secondary/10 hover:bg-theme-secondary/20 px-6 py-3 rounded-full transition-all hover:scale-105">
                See All New Arrivals <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </AnimatedElement>

      {/* Most Viewed Products Section */}
      <AnimatedElement animation="slideRight" delay={600}>
        <section className="py-16 bg-theme-neutral-light">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                👁️ Most Viewed
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See what&apos;s catching everyone&apos;s attention - the products our customers can&apos;t stop looking at
              </p>
            </div>
            
            <ProductGrid
              products={mostViewedProducts}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              loading={loading}
            />

            <div className="text-center mt-8">
              <Link href="/products?sort=views" className="inline-flex items-center text-theme-primary hover:text-theme-primary-dark text-lg font-semibold bg-theme-primary/10 hover:bg-theme-primary/20 px-6 py-3 rounded-full transition-all hover:scale-105">
                Explore Most Viewed <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </AnimatedElement>

      {/* Brand Spotlight with new theme colors */}
      <AnimatedElement animation="slideLeft" delay={700}>
        <section className="py-12 bg-theme-subtle-secondary relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Shop by vendor</h2>
            <Link href="/vendors" className="text-theme-primary hover:text-theme-primary-dark transition-colors text-lg font-semibold flex items-center bg-theme-primary/10 hover:bg-theme-primary/20 px-4 py-2 rounded-full cursor-pointer">
              All vendors <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          
          {/* Brand Slider */}
          <div className="relative">
            {/* Left Arrow - Centered on left side */}
            <button 
              onClick={() => {
                const slider = document.getElementById('brand-slider');
                if (slider) slider.scrollBy({ left: -300, behavior: 'smooth' });
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 cursor-pointer border border-theme-primary/20"
            >
              <ArrowLeft className="h-6 w-6 text-theme-primary" />
            </button>

            {/* Right Arrow - Centered on right side */}
            <button 
              onClick={() => {
                const slider = document.getElementById('brand-slider');
                if (slider) slider.scrollBy({ left: 300, behavior: 'smooth' });
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 cursor-pointer border border-theme-primary/20"
            >
              <ArrowRight className="h-6 w-6 text-theme-primary" />
            </button>

            {/* Left Gradient Mask */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white/50 to-transparent z-10 pointer-events-none"></div>
            
            {/* Right Gradient Mask */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/50 to-transparent z-10 pointer-events-none"></div>

            {/* Slider Container */}
            <div 
              id="brand-slider"
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-24"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {loading ? (
                // Show skeleton loaders while loading
                Array.from({ length: 8 }, (_, index) => (
                  <div
                    key={`brand-skeleton-${index}`}
                    className="relative bg-white rounded-xl p-6 text-center flex-shrink-0 w-40 sm:w-44 md:w-48 border border-theme-secondary/20 animate-pulse"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-lg"></div>
                    <div className="h-6"></div>
                  </div>
                ))
              ) : (
                getBrandData().map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/products?vendor=${encodeURIComponent(brand.name)}`}
                    className="relative bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 group hover:scale-105 overflow-hidden flex-shrink-0 w-40 sm:w-44 md:w-48 border border-theme-secondary/20"
                  >
                    {/* Brand Logo or Initials */}
                    <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      {brand.logo ? (
                        <Image 
                          src={brand.logo} 
                          alt={`${brand.name} logo`}
                          width={80}
                          height={80}
                          className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-110 rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-theme-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-theme-primary-dark group-hover:shadow-xl">
                          {brand.initials}
                        </div>
                      )}
                    </div>
                    
                    {/* Brand Name */}
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm group-hover:text-theme-primary transition-colors duration-300 truncate">
                        {brand.name}
                      </h3>
                    </div>
                    
                    {/* Text and Arrow Block - slides in from left on hover */}
                    <div className="flex items-center justify-center gap-2 h-6 overflow-hidden">
                      {/* Arrow - slides in from left */}
                      <ArrowRight className="h-5 w-5 text-theme-primary transform -translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out" />
                      
                      {/* Product Count Text - slides in from left */}
                      <p className="font-bold text-gray-900 group-hover:text-theme-primary transform -translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-sm">
                        {brand.items} Products
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
      </AnimatedElement>

      {/* Newsletter Subscription with new theme colors */}
      <AnimatedElement animation="slideUp" delay={800}>
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="relative overflow-hidden bg-theme-secondary py-8 md:py-12 rounded-2xl shadow-2xl border-2 border-white/20">
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-theme-secondary opacity-90"></div>
            
            {/* Subtle glow */}
            <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-theme-secondary/10 to-transparent"></div>
            
            {/* Newsletter Content */}
            <div className="relative px-4 md:px-6 text-center">
              {/* Newsletter Heading */}
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                Stay in the Loop
              </h2>
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto font-semibold">
                ✨ Get exclusive deals, new arrivals, and special offers delivered straight to your inbox ✨
              </p>

              {/* Newsletter Form */}
              <div className="max-w-lg mx-auto">
                <div className="relative mb-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full pl-4 pr-36 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:outline-none bg-gradient-to-b from-white to-gray-100 shadow-lg border border-gray-200 font-medium"
                  />
                  <div className="absolute right-2 top-2 group">
                    <button className="theme-button-gradient-secondary text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider hover:scale-105 transform transition-all duration-300 shadow-xl border-2 border-white/30 cursor-pointer">
                      Subscribe
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-white/80 mt-4 flex items-center justify-center gap-2 font-medium">
                  <span>🔒</span>
                  100% secure • No spam ever • Unsubscribe anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </AnimatedElement>
    </div>
  );
}
