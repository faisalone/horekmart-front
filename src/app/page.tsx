'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, ShoppingCart } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import PromoBanner from '@/components/PromoBanner';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { getMockProducts, getMockCategories } from '@/lib/mock-data';
import { Product } from '@/types';
import BannerBlock from '@/components/BannerBlock';

export default function HomePage() {
  const [products] = useState(getMockProducts());
  const [categories] = useState(getMockCategories());
  
  const featuredProducts = products.slice(0, 8);
  const saleProducts = products.filter(p => p.salePrice && p.salePrice < p.price);

  const handleAddToCart = (product: Product) => {
    console.log('Adding to cart:', product.name);
  };

  const handleAddToWishlist = (product: Product) => {
    console.log('Adding to wishlist:', product.name);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Promotional Banner */}
	  <section className="bg-white">
      	<div className="max-w-7xl mx-auto px-4 py-6">
			<PromoBanner />
		</div>
	  </section>

      {/* Main Banner Section - 3 Row Masonry Layout with Reusable Components */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* 3 Row Masonry Grid Layout with Enhanced Mobile Layout */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-4">
            
            {/* Fashion - Keep original position on mobile, move back on desktop */}
            <BannerBlock
              title="Fashion"
              description=""
              imageUrl="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
              link="/fashion"
              className="col-span-1 md:col-span-1 lg:col-span-3 order-1 lg:order-1"
              height="h-64"
              textSize="medium"
            />

            <BannerBlock
              title="Home & Garden"
              description=""
              imageUrl="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
              link="/home"
              className="col-span-1 md:col-span-1 lg:col-span-3 order-2 lg:order-2"
              height="h-64"
              textSize="medium"
            />

            {/* Electronics - Move ahead on desktop, same as mobile on tablet */}
            <BannerBlock
              title="Electronics"
              description=""
              imageUrl="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop"
              link="/electronics"
              className="col-span-2 md:col-span-2 lg:col-span-6 order-3 lg:order-3"
              height="h-64"
              textSize="xlarge"
            />

            {/* Sports - Move back on desktop to make room for Toys */}
            <BannerBlock
              title="Sports & Fitness"
              description=""
              imageUrl="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop"
              link="/sports"
              className="col-span-1 md:col-span-1 lg:col-span-3 order-4 lg:order-6"
              height="h-48"
              textSize="small"
            />

            <BannerBlock
              title="Beauty & Wellness"
              description=""
              imageUrl="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop"
              link="/beauty"
              className="col-span-1 md:col-span-1 lg:col-span-3 order-5 lg:order-7"
              height="h-48"
              textSize="small"
            />

            <BannerBlock
              title="Automotive"
              description=""
              imageUrl="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop"
              link="/automotive"
              className="col-span-1 md:col-span-1 lg:col-span-3 order-6 lg:order-8"
              height="h-48"
              textSize="small"
            />

            {/* Toys - Position and sizing should match mobile exactly */}
            <BannerBlock
              title="Toys & Games"
              description=""
              imageUrl="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&h=1000&fit=crop"
              link="/toys"
              className="col-span-1 row-span-2 md:col-span-1 md:row-span-2 lg:col-span-3 lg:row-span-2 order-7 md:order-7 lg:order-4"
              height="h-[25rem]"
              textSize="large"
            />

            {/* Grocery - Same position as mobile on tablet */}
            <BannerBlock
              title="Grocery & Fresh Food"
              description=""
              imageUrl="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop"
              link="/grocery"
              className="col-span-1 md:col-span-1 lg:col-span-3 order-8 md:order-8 lg:order-10"
              height="h-48"
              textSize="medium"
            />

            {/* Baby - Same position as mobile on tablet */}
            <BannerBlock
              title="Baby & Kids"
              description=""
              imageUrl="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&h=400&fit=crop"
              link="/baby"
              className="col-span-2 md:col-span-2 lg:col-span-6 order-9 md:order-9 lg:order-5"
              height="h-48"
              textSize="large"
            />

          </div>
        </div>
      </section>

      {/* Flash Deals Section with theme styling */}
      <section className="theme-gradient-orange-red text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Flash Deals</h2>
              <div className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                Ends in 2h 15m
              </div>
            </div>
            <Link href="/deals" className="text-white hover:text-orange-200 flex items-center transition-colors text-lg font-semibold">
              Shop all <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {saleProducts.slice(0, 8).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products Grid */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Popular items</h2>
            <Link href="/products" className="text-theme-teal hover:text-theme-teal-dark flex items-center transition-colors text-lg font-semibold">
              Shop all <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
          
          <ProductGrid
            products={saleProducts.slice(0, 8)}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          />
        </div>
      </section>

      {/* Brand Spotlight with theme styling and slider */}
      <section className="py-8 bg-theme-gray-light relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shop by brand</h2>
            <Link href="/brands" className="text-theme-teal hover:text-theme-teal-dark transition-colors text-lg font-semibold flex items-center">
              All brands <ArrowRight className="ml-2 h-5 w-5" />
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 cursor-pointer"
            >
              <ArrowLeft className="h-6 w-6 text-theme-teal" />
            </button>

            {/* Right Arrow - Centered on right side */}
            <button 
              onClick={() => {
                const slider = document.getElementById('brand-slider');
                if (slider) slider.scrollBy({ left: 300, behavior: 'smooth' });
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 cursor-pointer"
            >
              <ArrowRight className="h-6 w-6 text-theme-teal" />
            </button>

            {/* Left Gradient Mask */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-theme-gray-light to-transparent z-10 pointer-events-none"></div>
            
            {/* Right Gradient Mask */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-theme-gray-light to-transparent z-10 pointer-events-none"></div>

            {/* Slider Container */}
            <div 
              id="brand-slider"
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-24"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', items: products.filter(p => p.brand === 'Apple').length },
                { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', items: products.filter(p => p.brand === 'Samsung').length },
                { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', items: products.filter(p => p.brand === 'Nike').length },
                { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', items: products.filter(p => p.brand === 'Adidas').length },
                { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', items: products.filter(p => p.brand === 'Sony').length },
                { name: 'Dyson', logo: 'https://logos-world.net/wp-content/uploads/2020/12/Dyson-Logo-700x394.png', items: products.filter(p => p.brand === 'Dyson').length },
                { name: 'LG', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/LG_symbol.svg', items: products.filter(p => p.brand === 'LG').length || 5 },
                { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', items: products.filter(p => p.brand === 'Microsoft').length || 8 },
                { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', items: products.filter(p => p.brand === 'Google').length || 6 },
                { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', items: products.filter(p => p.brand === 'Amazon').length || 12 },
                { name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Tesla_T_symbol.svg', items: products.filter(p => p.brand === 'Tesla').length || 4 },
                { name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg', items: products.filter(p => p.brand === 'HP').length || 7 },
                { name: 'Dell', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg', items: products.filter(p => p.brand === 'Dell').length || 9 },
              ].map((brand) => (
                <Link
                  key={brand.name}
                  href={`/brands/${brand.name.toLowerCase()}`}
                  className="relative bg-white rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 group hover:scale-105 overflow-hidden flex-shrink-0 w-48"
                >
                  {/* Brand Logo */}
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <img 
                      src={brand.logo} 
                      alt={`${brand.name} logo`}
                      className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Text and Arrow Block - slides in from left on hover */}
                  <div className="flex items-center justify-center gap-2 h-6 overflow-hidden">
                    {/* Arrow - slides in from left */}
                    <ArrowRight className="h-6 w-6 text-theme-teal transform -translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out" />
                    
                    {/* Product Count Text - slides in from left */}
                    <p className="font-bold text-gray-900 group-hover:text-theme-teal transform -translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap">
                      {brand.items} Products
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Banner with theme gradient */}
      <section className="theme-gradient-blue-teal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Save even more with Walmart+</h2>
          <p className="text-xl mb-6 text-blue-100">
            Get free shipping, exclusive deals, and more benefits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="theme-button-orange font-bold hover:scale-105 transition-transform">
              Start free trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 transition-all">
              Learn more
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
