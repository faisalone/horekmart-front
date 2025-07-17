'use client';

import { useState, useEffect } from 'react';
import { Filter, Grid, List } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import Button from '@/components/ui/Button';
import { publicApi } from '@/lib/public-api';
import { cn } from '@/lib/utils';
import { Product, Category, SearchFilters } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesData] = await Promise.all([
          publicApi.getProducts(),
          publicApi.getCategories(),
        ]);
        setProducts(productsResponse.data);
        setCategories(categoriesData);
        setFilteredProducts(productsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProducts([]);
        setCategories([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const uniqueBrands = [...new Set(products.map(p => p.vendor?.business_name).filter(Boolean))] as string[];
  // Price range calculation - reserved for future dynamic price filter implementation
  // const priceRange = products.reduce(
  //   (range, product) => {
  //     const price = product.salePrice || product.price;
  //     return {
  //       min: Math.min(range.min, price),
  //       max: Math.max(range.max, price),
  //     };
  //   },
  //   { min: Infinity, max: 0 }
  // );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-600">
          Discover our complete collection of {products.length} amazing products
        </p>
      </div>

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
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={filters.priceRange?.[0] === 0 && filters.priceRange?.[1] === 100}
                      onChange={() => handleFilterChange({ priceRange: [0, 100] })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Under $100</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={filters.priceRange?.[0] === 100 && filters.priceRange?.[1] === 500}
                      onChange={() => handleFilterChange({ priceRange: [100, 500] })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">$100 - $500</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={filters.priceRange?.[0] === 500 && filters.priceRange?.[1] === 1000}
                      onChange={() => handleFilterChange({ priceRange: [500, 1000] })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">$500 - $1000</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={filters.priceRange?.[0] === 1000}
                      onChange={() => handleFilterChange({ priceRange: [1000, Infinity] })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Over $1000</span>
                  </label>
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
          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <span className="text-sm text-gray-600">
                {filteredProducts.length} products found
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange({ sortBy: sortBy as any, sortOrder: sortOrder as any });
                }}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="newest-desc">Newest First</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 text-sm',
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 text-sm',
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <ProductGrid
            products={filteredProducts}
            onAddToCart={(product) => console.log('Adding to cart:', product.name)}
            onAddToWishlist={(product) => console.log('Adding to wishlist:', product.name)}
          />
        </div>
      </div>
    </div>
  );
}
