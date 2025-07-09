'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import PromoBanner from '@/components/PromoBanner';
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-4">
            
            {/* Fashion - Keep original position on mobile, move back on desktop */}
            <BannerBlock
              title="Fashion"
              description=""
              imageUrl="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
              link="/fashion"
              className="col-span-1 md:col-span-2 lg:col-span-3 order-1 lg:order-2"
              height="h-64"
              textSize="medium"
            />

            <BannerBlock
              title="Home & Garden"
              description=""
              imageUrl="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
              link="/home"
              className="col-span-1 md:col-span-2 lg:col-span-3 order-2 lg:order-3"
              height="h-64"
              textSize="medium"
            />

            {/* Electronics - Move ahead on desktop */}
            <BannerBlock
              title="Electronics"
              description=""
              imageUrl="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop"
              link="/electronics"
              className="col-span-2 md:col-span-4 lg:col-span-6 order-3 lg:order-1"
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

            {/* Toys - Move ahead by 2 positions on desktop */}
            <BannerBlock
              title="Toys & Games"
              description=""
              imageUrl="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&h=1000&fit=crop"
              link="/toys"
              className="col-span-1 row-span-2 md:col-span-1 lg:col-span-3 lg:row-span-2 order-7 lg:order-4"
              height="h-[25rem]"
              textSize="large"
            />

            {/* Grocery - Move to Baby's mobile position */}
            <BannerBlock
              title="Grocery & Fresh Food"
              description=""
              imageUrl="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop"
              link="/grocery"
              className="col-span-1 md:col-span-2 lg:col-span-3 order-8 lg:order-10"
              height="h-48"
              textSize="medium"
            />

            {/* Baby - Move to last position on mobile with full width */}
            <BannerBlock
              title="Baby & Kids"
              description=""
              imageUrl="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&h=400&fit=crop"
              link="/baby"
              className="col-span-2 md:col-span-2 lg:col-span-6 order-9 lg:order-5"
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
            <Link href="/deals" className="text-white hover:text-orange-200 flex items-center transition-colors">
              Shop all deals <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {saleProducts.slice(0, 6).map((product) => (
              <div key={product.id} className="bg-white rounded-lg p-3 text-gray-900">
                <div className="aspect-square mb-2 relative bg-gray-50 rounded">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  />
                </div>
                <p className="text-xs line-clamp-2 mb-1">{product.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold">${Math.floor(product.salePrice!)}</span>
                  <span className="text-xs text-gray-500 line-through">${product.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products Grid */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Popular items</h2>
            <Link href="/products" className="text-blue-600 hover:text-blue-700 flex items-center">
              Shop all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <ProductGrid
            products={featuredProducts}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            className="grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
          />
        </div>
      </section>

      {/* Brand Spotlight with theme styling */}
      <section className="py-8 bg-theme-gray-light">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG'].map((brand) => (
              <Link
                key={brand}
                href={`/brands/${brand.toLowerCase()}`}
                className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-all duration-300 group hover:scale-105"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-theme-blue-light rounded-full flex items-center justify-center group-hover:bg-theme-blue transition-colors">
                  <span className="font-bold text-lg group-hover:text-white transition-colors">{brand.charAt(0)}</span>
                </div>
                <p className="font-medium text-gray-900 group-hover:text-theme-blue transition-colors">{brand}</p>
              </Link>
            ))}
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
