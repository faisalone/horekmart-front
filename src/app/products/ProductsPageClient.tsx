'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import SortingHeader from '@/components/SortingHeader';
import { publicApi } from '@/lib/public-api';
import { cn } from '@/lib/utils';
import { Product, Category, SearchFilters, Vendor } from '@/types';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductCheckout } from '@/services/ProductCheckoutService';
import { useCategories } from '@/contexts/CategoriesContext';
import FloatingButton from '@/components/FloatingButton';
import { useGTM } from '@/hooks/useGTM';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // GTM tracking
  const { trackSearch, trackEvent } = useGTM();
  
  // Get search query, category, vendor, sort, and type from URL parameters
  const urlSearchQuery = searchParams.get('q') || '';
  const categoryQuery = searchParams.get('category') || '';
  const vendorQuery = searchParams.get('vendor') || '';
  const sortQuery = searchParams.get('sort') || '';
  const typeQuery = searchParams.get('type') || ''; // New type parameter for Trending, Deals, etc.
  const priceMinQuery = searchParams.get('price_min');
  const priceMaxQuery = searchParams.get('price_max');
  const inStockQuery = searchParams.get('in_stock');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Vendor[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  // Use categories context
  const { categories } = useCategories();  
  
  // Initialize sort based on URL parameter (only regular sorting, not type)
  const getInitialSort = useCallback(() => {
    if (!sortQuery) {
      return { sortBy: undefined, sortOrder: undefined };
    }
    
    // Handle regular sorting from URL (e.g., "newest-desc", "name-asc", "price-desc")
    if (sortQuery.includes('-')) {
      const [frontendField, order] = sortQuery.split('-');
      
      // Map frontend field names to backend column names
      const fieldMapping: Record<string, string> = {
        'newest': 'created_at',
        'name': 'name',
        'price': 'price'
      };
      
      const backendField = fieldMapping[frontendField] || frontendField;
      
      return { 
        sortBy: backendField as SearchFilters['sortBy'], 
        sortOrder: order as 'asc' | 'desc' 
      };
    }
    
    // Return undefined when no valid sort is specified
    return { sortBy: undefined, sortOrder: undefined };
  }, [sortQuery]);

  // Initialize filters from URL parameters
  const getInitialFilters = useCallback(() => {
    const priceRange = priceMinQuery && priceMaxQuery 
      ? [parseInt(priceMinQuery), parseInt(priceMaxQuery)] as [number, number]
      : undefined;
      
    const sellers = vendorQuery ? vendorQuery.split(',') : undefined;
    
    const inStock = inStockQuery === 'true' ? true : inStockQuery === 'false' ? false : undefined;
    
    return {
      search: urlSearchQuery,
      category: categoryQuery || undefined,
      priceRange,
      seller: sellers,
      inStock,
      ...getInitialSort(),
    };
  }, [urlSearchQuery, categoryQuery, vendorQuery, priceMinQuery, priceMaxQuery, inStockQuery, getInitialSort]);
  
  const [filters, setFilters] = useState<SearchFilters>(getInitialFilters());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(
    typeQuery || '' // Use type parameter instead of checking sort
  );

  // Ref to prevent duplicate API calls
  const fetchingRef = useRef(false);
  const lastFetchParamsRef = useRef<string>('');

  // Cart and wishlist contexts
  const { toggleItem: toggleWishlist } = useWishlist();
  const { addToCart: addToCartService } = useProductCheckout();
  
  // Track search queries
  useEffect(() => {
    if (urlSearchQuery) {
      trackSearch(urlSearchQuery);
    }
  }, [urlSearchQuery, trackSearch]);

  // Function to fetch products with pagination and duplicate prevention
  const fetchProducts = useCallback(async (page: number = 1, reset: boolean = false) => {
    // Create a unique key for this fetch request
    const fetchKey = `${urlSearchQuery}-${categoryQuery}-${vendorQuery}-${filters.sortBy}-${filters.sortOrder}-${page}-${reset}`;
    
    // Prevent duplicate calls with the same parameters
    if (fetchingRef.current && lastFetchParamsRef.current === fetchKey && page === 1) {
      console.log('Preventing duplicate fetch with same parameters');
      return;
    }
    
    try {
      fetchingRef.current = true;
      lastFetchParamsRef.current = fetchKey;
      
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        per_page: 15,
        page: page,
        search: urlSearchQuery || undefined,
        category: categoryQuery || undefined,
        vendor: vendorQuery || undefined,
        ...(selectedType && { type: selectedType }), // Send type parameter
        ...(filters.sortBy && { sort_by: filters.sortBy }),
        ...(filters.sortOrder && { sort_order: filters.sortOrder }),
      };

      const response = await publicApi.getProducts(params);
      
      setTotalProducts(response.meta.total);
      setHasMore(page < response.meta.last_page);
      
      if (reset || page === 1) {
        setProducts(response.data);
        setAllProducts(response.data);
        setFilteredProducts(response.data);
      } else {
        // Prevent duplicate products by filtering out already existing IDs
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = response.data.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
        setAllProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = response.data.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
        setFilteredProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = response.data.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (reset || page === 1) {
        setProducts([]);
        setAllProducts([]);
        setFilteredProducts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setSearchLoading(false);
      fetchingRef.current = false;
    }
  }, [urlSearchQuery, categoryQuery, vendorQuery, filters.sortBy, filters.sortOrder, selectedType]);

  // Function to load more products
  const loadMoreProducts = useCallback(async () => {
    if (!loadingMore && hasMore && !loading) {
      await fetchProducts(currentPage + 1, false);
    }
  }, [loadingMore, hasMore, loading, fetchProducts, currentPage]);

  // Sort options for the sorting header (only regular sorting)
  // Regular sort options for the dropdown (excluding quick filters)
  const sortOptions = [
    { value: 'newest-desc', label: 'Newest First' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' }
  ];

  // Quick filters for horizontal scrollable section
  const quickFilters = [
    { value: 'trending', label: 'Trending', icon: '🔥' },
    { value: 'deals', label: 'Best Deals', icon: '💸' },
    { value: 'most-viewed', label: 'Most Viewed', icon: '👀' },
    { value: 'new-arrivals', label: 'New Arrivals', icon: '✨' },
    { value: 'best-sellers', label: 'Best Sellers', icon: '⭐' }
  ];

  // Initial data fetch and when URL parameters or sort changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sellers first (only if not already loaded)
        if (sellers.length === 0) {
          const sellersData = await publicApi.getVendors();
          setSellers(sellersData.data);
        }
        
        // Reset pagination and fetch first page
        setCurrentPage(1);
        setHasMore(true);
        await fetchProducts(1, true);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        if (sellers.length === 0) {
          setSellers([]);
        }
      }
    };

    fetchData();
  }, [urlSearchQuery, categoryQuery, vendorQuery, sortQuery, typeQuery, fetchProducts, sellers.length]);

  // Update filters when URL parameters change
  useEffect(() => {
    setFilters(getInitialFilters());
    // Update selectedType based on type query
    setSelectedType(typeQuery || '');
  }, [getInitialFilters, typeQuery]);

  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category?.slug === filters.category
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price);
        return price >= filters.priceRange![0] && price <= filters.priceRange![1];
      });
    }

    // Apply seller filter
    if (filters.seller && filters.seller.length > 0) {
      filtered = filtered.filter(product => 
        product.vendor && filters.seller!.includes(product.vendor.business_name)
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
          case 'created_at':
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

  // Watch for filter changes that should trigger a new fetch (excluding sort changes)
  useEffect(() => {
    if (filters.seller || filters.priceRange || filters.inStock !== undefined) {
      // When filters change, we need to refetch from the server
      // For now, we'll keep frontend filtering, but in a real app you'd send these to the API
      // Reset pagination when filters change significantly
      setCurrentPage(1);
    }
  }, [filters.seller, filters.priceRange, filters.inStock]);

  // Helper function to update URL parameters
  const updateUrlParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'undefined') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    // Always remove page when filters change
    params.delete('page');
    
    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Track filter usage
    Object.entries(newFilters).forEach(([key, value]) => {
      trackEvent('product_filter_change', {
        filter_type: key,
        filter_value: value,
        page_location: window.location.pathname,
        current_search: urlSearchQuery
      });
    });
    
    // Update URL parameters for the filters
    const updates: Record<string, string | null> = {};
    
    if (newFilters.category !== undefined) {
      updates.category = newFilters.category || null;
    }
    
    if (newFilters.priceRange !== undefined) {
      updates.price_min = newFilters.priceRange ? newFilters.priceRange[0].toString() : null;
      updates.price_max = newFilters.priceRange ? newFilters.priceRange[1].toString() : null;
    }
    
    if (newFilters.seller !== undefined) {
      updates.vendor = newFilters.seller && newFilters.seller.length > 0 ? newFilters.seller.join(',') : null;
    }
    
    if (newFilters.inStock !== undefined) {
      updates.in_stock = newFilters.inStock !== null ? newFilters.inStock.toString() : null;
    }
    
    updateUrlParams(updates);
  }, [updateUrlParams]);

  const clearFilters = useCallback(() => {
    // Clear only the sidebar filter properties directly
    setFilters(prev => ({
      ...prev,
      priceRange: undefined,
      seller: undefined,
      inStock: undefined,
      category: undefined, // Clear category filter completely
    }));
    
    // Clear only the sidebar filter URL parameters
    updateUrlParams({
      category: null,
      price_min: null,
      price_max: null,
      vendor: null,
      in_stock: null,
    });
  }, [updateUrlParams]);

  // Prevent body scroll when mobile filter modal is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterOpen]);

  // Infinite scroll functionality
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      // Debounce scroll events
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (
          window.innerHeight + document.documentElement.scrollTop
          >= document.documentElement.offsetHeight - 1000 // Load when 1000px from bottom
          && !loadingMore && hasMore && !loading
        ) {
          loadMoreProducts();
        }
      }, 100); // 100ms debounce
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [loadingMore, hasMore, loading, loadMoreProducts]);

  const uniqueSellers = sellers.filter(seller => seller.is_active);
  
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
      productImage: productImage,
      productSlug: product.slug,
      categorySlug: product.category?.slug,
      price: parseFloat(product.price),
      salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
      inStock: product.in_stock,
    };

    toggleWishlist(wishlistItem);
  };

  // Helper function to get the sortBy value for SortingHeader (only shows regular sorting)
  const getSortByValue = () => {
    if (!filters.sortBy) {
      return '';
    }
    
    // Don't show quick filters in the dropdown
    if (['trending', 'deals', 'most-viewed', 'best-sellers'].includes(filters.sortBy)) {
      return '';
    }
    
    // Map backend column names back to frontend field names for display
    const backendToFrontendMapping: Record<string, string> = {
      'created_at': 'newest',
      'name': 'name',
      'price': 'price'
    };
    
    const frontendField = backendToFrontendMapping[filters.sortBy] || filters.sortBy;
    return `${frontendField}-${filters.sortOrder}`;
  };

  // Handler for sort change from SortingHeader (only handles regular sorting)
  const handleSortChange = useCallback((value: string) => {
    // Track sort usage
    trackEvent('product_sort_change', {
      sort_type: value || 'default',
      page_location: window.location.pathname,
      current_search: urlSearchQuery,
      current_category: categoryQuery
    });
    
    if (value === '' || !value) {
      // Clear regular sorting but keep type if active
      if (selectedType) {
        // Don't set sortBy for type - it will be handled by backend type parameter
        updateUrlParams({ sort: null });
      } else {
        setFilters(prev => ({ 
          ...prev, 
          sortBy: undefined, 
          sortOrder: undefined 
        }));
        updateUrlParams({ sort: null });
      }
    } else {
      // Regular sort with format: "field-direction" - convert to backend format
      const [sortBy, sortOrder] = value.split('-');
      
      // Map frontend field names to backend column names
      const fieldMapping: Record<string, string> = {
        'newest': 'created_at',
        'name': 'name',
        'price': 'price'
      };
      
      const backendSortBy = fieldMapping[sortBy] || sortBy;
      
      // Don't clear quick filter - allow both to work together
      setFilters(prev => ({ ...prev, sortBy: backendSortBy as any, sortOrder: sortOrder as any }));
      updateUrlParams({ sort: value });
    }
    
    // Reset pagination
    setCurrentPage(1);
    setHasMore(true);
  }, [updateUrlParams, selectedType]);

  // Handler for clearing search
  const handleClearSearch = useCallback(() => {
    updateUrlParams({ q: null });
  }, [updateUrlParams]);

  // Handler for type changes (Trending, Deals, Most Viewed, Best Sellers)
  const handleTypeChange = useCallback((value: string) => {
    setSelectedType(value);
    
    if (value) {
      // Set type parameter, keep existing sort if any
      updateUrlParams({ type: value });
    } else {
      // Clear type parameter
      updateUrlParams({ type: null });
    }
    
    // Reset pagination
    setCurrentPage(1);
    setHasMore(true);
  }, [updateUrlParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile Floating Filter Button */}
      <FloatingButton 
        type="filter"
        onClick={() => setIsFilterOpen(true)}
      />

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-transparent flex items-end justify-center"
          onClick={() => setIsFilterOpen(false)}
        >
          <div 
            className="w-full h-5/6 bg-white rounded-t-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Mobile Filter Content - Scrollable */}
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
              {/* Category Filter */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">Category</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mobile-category"
                      value=""
                      checked={!filters.category}
                      onChange={() => {
                        handleFilterChange({ category: undefined });
                        updateUrlParams({ category: null });
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">All Categories</span>
                  </label>
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="mobile-category"
                        value={category.slug}
                        checked={filters.category === category.slug}
                        onChange={() => handleFilterChange({ category: category.slug })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">Price Range</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mobile-priceRange"
                      checked={!filters.priceRange}
                      onChange={() => handleFilterChange({ priceRange: undefined })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">Any Price</span>
                  </label>
                  {dynamicPriceRanges.map((range, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name="mobile-priceRange"
                        checked={filters.priceRange?.[0] === range.start && filters.priceRange?.[1] === range.end}
                        onChange={() => handleFilterChange({ priceRange: [range.start, range.end] })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Seller Filter */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">Seller</h4>
                <div className="space-y-3">
                  {uniqueSellers.map(seller => (
                    <label key={seller.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.seller?.includes(seller.business_name) || false}
                        onChange={(e) => {
                          const currentSellers = filters.seller || [];
                          if (e.target.checked) {
                            handleFilterChange({ seller: [...currentSellers, seller.business_name] });
                          } else {
                            handleFilterChange({ seller: currentSellers.filter(s => s !== seller.business_name) });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700">{seller.business_name}</span>
                    </label>
                  ))}
                </div>
              </div>



              {/* Stock Filter */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">Availability</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock === true}
                    onChange={(e) => handleFilterChange({ inStock: e.target.checked ? true : undefined })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-700">In Stock Only</span>
                </label>
              </div>
              </div>

              {/* Mobile Filter Footer - Fixed at bottom */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Results: {filteredProducts.length} products</span>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block w-64 flex-shrink-0">
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
                      name="desktop-category"
                      value=""
                      checked={!filters.category}
                      onChange={() => {
                        handleFilterChange({ category: undefined });
                        updateUrlParams({ category: null });
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Categories</span>
                  </label>
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="desktop-category"
                        value={category.slug}
                        checked={filters.category === category.slug}
                        onChange={() => handleFilterChange({ category: category.slug })}
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
                      name="desktop-priceRange"
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
                        name="desktop-priceRange"
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

              {/* Seller Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Seller</h4>
                <div className="space-y-2">
                  {uniqueSellers.map(seller => (
                    <label key={seller.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.seller?.includes(seller.business_name) || false}
                        onChange={(e) => {
                          const currentSellers = filters.seller || [];
                          if (e.target.checked) {
                            handleFilterChange({ seller: [...currentSellers, seller.business_name] });
                          } else {
                            handleFilterChange({ seller: currentSellers.filter(s => s !== seller.business_name) });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{seller.business_name}</span>
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
          {/* Mobile Sorting Header Only */}
          <div className="lg:hidden mb-4">
            <SortingHeader
              totalProducts={totalProducts}
              filteredProducts={filteredProducts.length}
              sortBy={getSortByValue()}
              onSortChange={handleSortChange}
              sortOptions={sortOptions}
              showAdditionalInfo={false}
              isLoading={loading || searchLoading}
              searchInput={urlSearchQuery}
              onClearSearch={handleClearSearch}
              onResetAll={() => {
                // Clear only sort, search, and type (NOT filters)
                setFilters(prev => ({
                  ...prev,
                  search: '',
                  sortBy: undefined,
                  sortOrder: undefined,
                }));
                setSelectedType('');
                updateUrlParams({
                  q: null,
                  sort: null,
                  type: null,
                  // Keep filter parameters intact
                });
              }}
              appliedFilters={{
                priceRange: filters.priceRange,
                seller: filters.seller,
                inStock: filters.inStock,
              }}
            />
          </div>

          {/* Mobile Quick Filters - Separate Section */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide pb-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleTypeChange(selectedType === filter.value ? '' : filter.value)}
                  className={`
                    flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${selectedType === filter.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }
                  `}
                >
                  {filter.icon && <span className="mr-1">{filter.icon}</span>}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Sorting Header */}
          <div className="hidden lg:block mb-6">
            <SortingHeader
              totalProducts={totalProducts}
              filteredProducts={filteredProducts.length}
              sortBy={getSortByValue()}
              onSortChange={handleSortChange}
              sortOptions={sortOptions}
              showAdditionalInfo={false}
              isLoading={loading || searchLoading}
              searchInput={urlSearchQuery}
              onClearSearch={handleClearSearch}
              onResetAll={() => {
                // Clear only sort, search, and type (NOT filters)
                setFilters(prev => ({
                  ...prev,
                  search: '',
                  sortBy: undefined,
                  sortOrder: undefined,
                }));
                setSelectedType('');
                updateUrlParams({
                  q: null,
                  sort: null,
                  type: null,
                  // Keep filter parameters intact
                });
              }}
              appliedFilters={{
                priceRange: filters.priceRange,
                seller: filters.seller,
                inStock: filters.inStock,
              }}
            />
          </div>

          {/* Desktop Type Filters - Separate Section */}
          <div className="hidden lg:block mb-6">
            <div className="flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide pb-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleTypeChange(selectedType === filter.value ? '' : filter.value)}
                  className={`
                    flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap
                    ${selectedType === filter.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }
                  `}
                >
                  {filter.icon && <span className="mr-1">{filter.icon}</span>}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

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
