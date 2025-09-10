'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import SortingHeader from '@/components/SortingHeader';
import { publicApi } from '@/lib/public-api';
import { cn } from '@/lib/utils';
import { Product, Category, SearchFilters } from '@/types';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductCheckout } from '@/services/ProductCheckoutService';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Get search query, category, and vendor from URL parameters
  const urlSearchQuery = searchParams.get('q') || '';
  const categoryQuery = searchParams.get('category') || '';
  const vendorQuery = searchParams.get('vendor') || '';
  
  const [filters, setFilters] = useState<SearchFilters>({
    search: urlSearchQuery,
    category: categoryQuery,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Cart and wishlist contexts
  const { toggleItem: toggleWishlist } = useWishlist();
  const { addToCart: addToCartService } = useProductCheckout();

  // Sort options for the sorting header
  const sortOptions = [
    { value: 'name-asc', label: '🔤 Name A-Z' },
    { value: 'name-desc', label: '🔤 Name Z-A' },
    { value: 'price-asc', label: '💰 Price: Low to High' },
    { value: 'price-desc', label: '💎 Price: High to Low' },
    { value: 'rating-desc', label: '⭐ Highest Rated' },
    { value: 'newest-desc', label: '🆕 Newest First' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories first
        const categoriesData = await publicApi.getCategories();
        setCategories(categoriesData);
        
        // If there's a search query, perform search; otherwise get all products
        if (urlSearchQuery) {
          setSearchLoading(true);
          const searchResponse = await publicApi.getProducts({ 
            search: urlSearchQuery,
            category: categoryQuery || undefined,
            vendor: vendorQuery || undefined
          });
          setProducts(searchResponse.data);
          setAllProducts(searchResponse.data);
          setFilteredProducts(searchResponse.data);
        } else if (categoryQuery) {
          // Filter by category only
          const productsResponse = await publicApi.getProducts({ 
            category: categoryQuery,
            vendor: vendorQuery || undefined
          });
          setProducts(productsResponse.data);
          setAllProducts(productsResponse.data);
          setFilteredProducts(productsResponse.data);
        } else if (vendorQuery) {
          // Filter by vendor only
          const productsResponse = await publicApi.getProducts({ 
            vendor: vendorQuery 
          });
          setProducts(productsResponse.data);
          setAllProducts(productsResponse.data);
          setFilteredProducts(productsResponse.data);
        } else {
          const productsResponse = await publicApi.getProducts();
          setProducts(productsResponse.data);
          setAllProducts(productsResponse.data);
          setFilteredProducts(productsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setProducts([]);
        setAllProducts([]);
        setCategories([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    };

    fetchData();
  }, [urlSearchQuery, categoryQuery, vendorQuery]);

  // Update filters when URL search query, category, or vendor changes
  useEffect(() => {
    setFilters(prev => ({ 
      ...prev, 
      search: urlSearchQuery,
      category: categoryQuery || undefined 
    }));
  }, [urlSearchQuery, categoryQuery, vendorQuery]);

  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category?.name.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price);
        return price >= filters.priceRange![0] && price <= filters.priceRange![1];
      });
    }

    // Apply vendor filter (replacing brand filter)
    if (filters.brand && filters.brand.length > 0) {
      filtered = filtered.filter(product => 
        product.vendor && filters.brand!.includes(product.vendor.business_name)
      );
    }

    // Apply stock filter
    if (filters.inStock !== undefined) {
      filtered = filtered.filter(product => product.in_stock === filters.inStock);
    }

    // Apply sorting
    if (filters.sortBy && filters.sortOrder) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'price':
            aValue = a.sale_price ? parseFloat(a.sale_price) : parseFloat(a.price);
            bValue = b.sale_price ? parseFloat(b.sale_price) : parseFloat(b.price);
            break;
          case 'newest':
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      search: urlSearchQuery, // Keep the search query when clearing other filters
      category: categoryQuery || undefined, // Keep the category query when clearing other filters
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const uniqueBrands = [...new Set(products.map(p => p.vendor?.business_name).filter(Boolean))] as string[];
  
  // Dynamic price range calculation based on actual product prices
  const priceRange = products.length > 0 ? products.reduce(
    (range, product) => {
      const price = product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price);
      return {
        min: Math.min(range.min, price),
        max: Math.max(range.max, price),
      };
    },
    { min: Infinity, max: 0 }
  ) : { min: 0, max: 0 };

  // Generate dynamic price ranges based on actual data
  const generatePriceRanges = () => {
    if (priceRange.min === Infinity || priceRange.max === 0) {
      return [];
    }

    const ranges = [];
    const { min, max } = priceRange;
    const range = max - min;

    // If price range is small (less than 1000), create smaller intervals
    if (range <= 1000) {
      const interval = Math.ceil(range / 4);
      for (let i = 0; i < 4; i++) {
        const start = Math.floor(min + (interval * i));
        const end = i === 3 ? max : Math.floor(min + (interval * (i + 1)));
        if (start < end) {
          ranges.push({ start, end, label: `${start} - ${end.toLocaleString()} Tk` });
        }
      }
    } else {
      // For larger ranges, use predefined intervals
      const intervals = [
        { start: min, end: 500, label: `${Math.floor(min)} - 500 Tk` },
        { start: 500, end: 1000, label: '500 - 1,000 Tk' },
        { start: 1000, end: 5000, label: '1,000 - 5,000 Tk' },
        { start: 5000, end: 10000, label: '5,000 - 10,000 Tk' },
      ];

      // Only include ranges that have products
      intervals.forEach(interval => {
        if (interval.start < max && interval.end > min) {
          const actualStart = Math.max(interval.start, Math.floor(min));
          const actualEnd = Math.min(interval.end, Math.ceil(max));
          if (actualStart < actualEnd) {
            ranges.push({
              start: actualStart,
              end: actualEnd,
              label: interval.label
            });
          }
        }
      });

      // Add "Over X" range if max price is higher than the last interval
      if (max > 10000) {
        ranges.push({
          start: 10000,
          end: Infinity,
          label: `Over 10,000 Tk`
        });
      }
    }

    return ranges;
  };

  const dynamicPriceRanges = generatePriceRanges();

  // Handler functions for cart and wishlist
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

  // Handler for sort change from SortingHeader
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    handleFilterChange({ sortBy: sortBy as any, sortOrder: sortOrder as any });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Sorting Header */}
      <SortingHeader
        totalProducts={products.length}
        filteredProducts={filteredProducts.length}
        sortBy={`${filters.sortBy}-${filters.sortOrder}`}
        onSortChange={handleSortChange}
        sortOptions={sortOptions}
        showAdditionalInfo={false}
        isLoading={loading || searchLoading}
      />

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={cn(
          'w-full lg:w-64 flex-shrink-0',
          'lg:block',
          isFilterOpen ? 'block' : 'hidden'
        )}>
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={!filters.category}
                      onChange={() => handleFilterChange({ category: undefined })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Categories</span>
                  </label>
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.name}
                        checked={filters.category === category.name}
                        onChange={() => handleFilterChange({ category: category.name })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={!filters.priceRange}
                      onChange={() => handleFilterChange({ priceRange: undefined })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Any Price</span>
                  </label>
                  {dynamicPriceRanges.map((range, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange?.[0] === range.start && filters.priceRange?.[1] === range.end}
                        onChange={() => handleFilterChange({ priceRange: [range.start, range.end] })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                  {priceRange.min !== Infinity && priceRange.max > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Price range: {Math.floor(priceRange.min).toLocaleString()} - {Math.ceil(priceRange.max).toLocaleString()} Tk
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Brand</h4>
                <div className="space-y-2">
                  {uniqueBrands.map(brand => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.brand?.includes(brand) || false}
                        onChange={(e) => {
                          const currentBrands = filters.brand || [];
                          if (e.target.checked) {
                            handleFilterChange({ brand: [...currentBrands, brand] });
                          } else {
                            handleFilterChange({ brand: currentBrands.filter(b => b !== brand) });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => handleFilterChange({ rating })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{rating}+ stars</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Availability</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock === true}
                    onChange={(e) => handleFilterChange({ inStock: e.target.checked ? true : undefined })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* No results message for search */}
          {(urlSearchQuery || categoryQuery) && !searchLoading && !loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {urlSearchQuery && categoryQuery ? (
                  `No products found for "${urlSearchQuery}" in ${categoryQuery}`
                ) : urlSearchQuery ? (
                  `No products found for "${urlSearchQuery}"`
                ) : (
                  `No products found in ${categoryQuery}`
                )}
              </h3>
              <p className="text-gray-600 mb-6">
                Try using different keywords or browse our categories below.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {categories.slice(0, 6).map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      // Navigate to category and clear search
                      window.location.href = `/products?category=${encodeURIComponent(category.name)}`;
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => window.location.href = '/products'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Products
              </button>
            </div>
          )}

          {/* Products Grid */}
          <ProductGrid
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            loading={loading || searchLoading}
            className="grid-cols-2 lg:grid-cols-3"
          />
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function ProductsPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProductsPageContent />
    </Suspense>
  );
}
