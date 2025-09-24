'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, X, ChevronDown, Store, Package, TrendingUp, Tag, Sparkles, ThumbsUp, Layers } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/currency';
import { AutoFontText } from '@/components/AutoFontText';
import { useCategories } from '@/contexts/CategoriesContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NavbarProps {}

const Navbar = ({ }: NavbarProps = {}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'departments' | 'hotItems'>('departments');
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const departmentsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use site settings hook for reactive updates
  const { siteLogo = '/logo-light.svg', siteName = '', settings } = useSiteSettings();
  
  // Use categories context
  const { parentCategories: categories, loading: categoriesLoading } = useCategories();
  
  // Use the global authentication state
  const { isAuthenticated, loading } = useAdminAuth();
  
  // Use cart context
  const { state: cartState } = useCart();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleSellerClick = () => {
    if (loading) return; // Don't redirect while checking auth status
    
    if (isAuthenticated) {
      window.location.href = '/admin';
    } else {
      window.location.href = '/login';
    }
  };

  const handleDepartmentsMouseEnter = () => {
    if (departmentsTimeoutRef.current) {
      clearTimeout(departmentsTimeoutRef.current);
    }
    setIsDepartmentsOpen(true);
  };

  const handleDepartmentsMouseLeave = () => {
    departmentsTimeoutRef.current = setTimeout(() => {
      setIsDepartmentsOpen(false);
    }, 150); // 150ms delay before closing
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false); // Close mobile search after submit
    }
  };

  // Site settings are now handled reactively by the useSiteSettings hook

  // Close mobile search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setIsMobileSearchOpen(false);
      }
    };

    if (isMobileSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSearchOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (departmentsTimeoutRef.current) {
        clearTimeout(departmentsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Header - Theme gradient */}
            <div className="text-white theme-gradient-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-20">
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* Left Side - Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <Image 
                    src={siteLogo} 
                    alt={siteName || "HOREKMART"} 
                    width={180} 
                    height={60} 
                    className="h-28 w-auto"
                    onError={(e) => {
                      // Fallback to default logo if the dynamic logo fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '/logo-light.svg';
                    }}
                  />
                </Link>
              </div>

              {/* Center - Search Bar */}
              <div className="flex-1 max-w-2xl mx-8">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search everything at Horekmart online and in store"
                    className="w-full pl-4 pr-12 py-4 text-black rounded-full border-2 border-gray-300 focus:border-theme-primary focus:outline-none text-base bg-white transition-colors duration-200"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full cursor-pointer theme-button-secondary"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </form>
              </div>

              {/* Right Side - Actions */}
              <div className="flex items-center space-x-6">
                {/* Reorder */}
                {/* <Link 
                  href="/reorder" 
                  className="flex items-center space-x-2 text-white transition-colors hover:opacity-80"
                >
                  <div className="h-6 w-6 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-0.5">
                      <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
                    </div>
                  </div>
                  <div className="text-base">
                    <div className="text-sm opacity-80">
                      <AutoFontText>Reorder</AutoFontText>
                    </div>
                    <div className="font-medium">
                      <AutoFontText>My Items</AutoFontText>
                    </div>
                  </div>
                </Link> */}

                {/* Cart */}
                <Link 
                  href="/cart" 
                  className="relative flex items-center space-x-3 text-white transition-colors hover:opacity-80"
                >
                  <div className="relative">
                    <ShoppingCart className="h-8 w-8" />
                    {cartState.totalItems > 0 && (
                      <span 
                        className="absolute -top-3 -right-3 bg-white text-theme-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                      >
                        {cartState.totalItems}
                      </span>
                    )}
                  </div>
                  <div className="text-base">
                    <div className="text-sm opacity-80">
                      <AutoFontText>Cart</AutoFontText>
                    </div>
                    <div className="font-medium">{formatCurrency(cartState.totalPrice)}</div>
                  </div>
                </Link>

                {/* Seller Button */}
                <button 
                  onClick={handleSellerClick}
                  disabled={loading}
                  className={`flex items-center space-x-2 border-2 border-white text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:bg-white hover:text-theme-primary cursor-pointer ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Store className="h-5 w-5" />
                  <span className="text-sm font-bold">
                    <AutoFontText>
                      {loading ? '...' : isAuthenticated ? 'Dashboard' : 'Start Selling'}
                    </AutoFontText>
                  </span>
                </button>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden flex items-center w-full">
              {/* Mobile Search - Left side */}
              <div className="relative mr-4" ref={mobileSearchRef}>
                <form onSubmit={handleSearchSubmit} className="relative">
                  {/* Search input field - expands from left to right */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-12 rounded-full border-2 border-gray-300 bg-white text-black outline-none transition-all duration-300 ease-out ${
                      isMobileSearchOpen 
                        ? 'w-64 pl-14 pr-10 opacity-100 focus:border-theme-teal' 
                        : 'w-12 opacity-0 pointer-events-none'
                    }`}
                    autoFocus={isMobileSearchOpen}
                  />
                  
                  {/* Search icon - fixed position, always visible, matching desktop theme */}
                  <button
                    type={isMobileSearchOpen ? "submit" : "button"}
                    onClick={isMobileSearchOpen ? (searchQuery.trim() ? undefined : toggleMobileSearch) : toggleMobileSearch}
                    className="search-button relative z-10 w-12 h-12 rounded-full text-white flex items-center justify-center cursor-pointer theme-button-secondary"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  
                  {/* Close button - appears when search is open, positioned within the search field */}
                  {isMobileSearchOpen && (
                    <button
                      type="button"
                      onClick={toggleMobileSearch}
                      className="absolute left-56 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors z-20"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </form>
              </div>

              {/* Logo - Center */}
              <Link href="/" className="flex items-center flex-1 justify-center">
                <Image 
                  src={siteLogo} 
                  alt={siteName || "HOREKMART"} 
                  width={150} 
                  height={50} 
                  className="h-24 w-auto"
                  onError={(e) => {
                    // Fallback to default logo if the dynamic logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/logo-light.svg';
                  }}
                />
              </Link>

              {/* Mobile Right Side Actions */}
              <div className="flex items-center space-x-3">
                {/* Seller Button - Mobile */}
                <button 
                  onClick={handleSellerClick}
                  disabled={loading}
                  className={`flex items-center justify-center border-2 border-white text-white p-2.5 rounded-lg transition-all duration-300 hover:bg-white hover:text-theme-primary cursor-pointer ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={loading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Start Selling'}
                >
                  <Store className="h-5 w-5" />
                </button>

                {/* Cart */}
                <Link 
                  href="/cart" 
                  className="relative flex items-center text-white transition-colors hover:opacity-80"
                >
                  <div className="relative">
                    <ShoppingCart className="h-6 w-6" />
                    {cartState.totalItems > 0 && (
                      <span 
                        className="absolute -top-3 -right-3 bg-white text-theme-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                      >
                        {cartState.totalItems}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMenu}
                  className="p-2 text-white cursor-pointer transition-colors hover:opacity-80"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Header - Departments and Menu - Desktop Only */}
      <div className="hidden lg:block text-white theme-gradient-primary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative flex items-center justify-center h-14">
            {/* Departments Dropdown - Positioned absolutely on the left */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
              <button
                onMouseEnter={handleDepartmentsMouseEnter}
                onMouseLeave={handleDepartmentsMouseLeave}
                className="flex items-center space-x-2 text-white px-4 py-2 rounded cursor-pointer transition-colors hover:bg-theme-primary-dark/50"
              >
                <Layers className="h-4 w-4" />
                <span className="text-base font-bold">
                  <AutoFontText>Departments</AutoFontText>
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isDepartmentsOpen && (
                <div
                  onMouseEnter={handleDepartmentsMouseEnter}
                  onMouseLeave={handleDepartmentsMouseLeave}
                  className="absolute top-full left-0 bg-white text-black shadow-lg rounded-md py-2 w-72 z-50 -mt-1"
                  style={{ paddingTop: '8px', marginTop: '-4px' }}
                >
                  <div className="grid grid-cols-1 gap-1 p-3 pt-1">
                    {categoriesLoading ? (
                      // Loading skeleton
                      <div className="space-y-2">
                        {[...Array(6)].map((_, index) => (
                          <div key={index} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    ) : categories.length > 0 ? (
                      // Dynamic categories from API
                      categories.map((category) => (
                        <Link 
                          key={category.id}
                          href={`/${category.slug}`} 
                          className="block px-4 py-3 hover:bg-gray-100 text-base rounded transition-colors"
                        >
                          <AutoFontText>{category.name}</AutoFontText>
                        </Link>
                      ))
                    ) : (
                      // Fallback message when no categories
                      <div className="px-4 py-3 text-gray-500 text-base">
                        <AutoFontText>No categories available</AutoFontText>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Main Navigation Menu - Centered */}
            <nav className="flex items-center space-x-8">
              <Link href="/products" className="flex items-center space-x-2 text-base text-white hover:opacity-80 transition-colors font-bold">
                <Package className="h-4 w-4" />
                <span>All Products</span>
              </Link>
              <Link href="/products?type=trending" className="flex items-center space-x-2 text-base text-white hover:opacity-80 transition-colors font-bold">
                <TrendingUp className="h-4 w-4" />
                <span>Trending</span>
              </Link>
              <Link href="/products?type=deals" className="flex items-center space-x-2 text-base text-white hover:opacity-80 transition-colors font-bold">
                <Tag className="h-4 w-4" />
                <span>Deals & Offers</span>
              </Link>
			  <Link href="/products?type=new-arrivals" className="flex items-center space-x-2 text-base text-white hover:opacity-80 transition-colors font-bold">
                <Sparkles className="h-4 w-4" />
                <span>New Arrivals</span>
              </Link>
			  <Link href="/products?type=best-sellers" className="flex items-center space-x-2 text-base text-white hover:opacity-80 transition-colors font-bold">
                <ThumbsUp className="h-4 w-4" />
                <span>Best Sellers</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto">
          {/* Modal Backdrop */}
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Modal Header with Close Button */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-theme-secondary to-theme-primary rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    <AutoFontText>Browse</AutoFontText>
                  </h1>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Tab System */}
            <div className="px-6 pt-4">
              <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setActiveTab('departments')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'departments'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <AutoFontText>Departments</AutoFontText>
                </button>
                <button
                  onClick={() => setActiveTab('hotItems')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'hotItems'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <AutoFontText>Hot Items</AutoFontText>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'departments' ? (
              // Departments Tab Content
              <div className="px-6 pb-4">
                {categoriesLoading ? (
                  // Premium loading skeleton
                  <div className="space-y-3">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : categories.length > 0 ? (
                  // Premium category display
                  <div className="grid grid-cols-1 gap-3">
                    {categories.slice(0, 8).map((category, index) => {
                      const hoverColors = [
                        'hover:bg-theme-primary-50/30 hover:border-theme-primary-200',
                        'hover:bg-theme-secondary-50/30 hover:border-theme-secondary-200',
                        'hover:bg-green-50/30 hover:border-green-200',
                        'hover:bg-orange-50/30 hover:border-orange-200',
                        'hover:bg-red-50/30 hover:border-red-200',
                        'hover:bg-indigo-50/30 hover:border-indigo-200',
                        'hover:bg-teal-50/30 hover:border-teal-200',
                        'hover:bg-pink-50/30 hover:border-pink-200'
                      ];
                      const hoverColor = hoverColors[index % hoverColors.length];
                      
                      return (
                        <Link
                          key={category.id}
                          href={`/${category.slug}`}
                          className={`group flex items-center justify-between px-6 py-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 ${hoverColor}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div>
                            <span className="text-lg font-bold text-gray-900 tracking-tight">
                              <AutoFontText>{category.name}</AutoFontText>
                            </span>
                            <p className="text-sm text-gray-600 mt-0.5">Explore collection</p>
                          </div>
                          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  // Fallback for mobile
                  <div className="px-5 py-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-500">
                      <AutoFontText>No categories available</AutoFontText>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Hot Items Tab Content
              <div className="px-6 pb-4">
                <div className="space-y-2">
                  <Link
                    href="/products"
                    className="group flex items-center justify-between px-6 py-5 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="h-6 w-6 text-blue-600" />
                      <div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                          <AutoFontText>All Products</AutoFontText>
                        </span>
                        <p className="text-sm text-gray-600 mt-0.5">Browse everything</p>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors rotate-[-90deg]" />
                  </Link>

                  <Link
                    href="/products?type=trending"
                    className="group flex items-center justify-between px-6 py-5 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                      <div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                          <AutoFontText>Trending</AutoFontText>
                        </span>
                        <p className="text-sm text-gray-600 mt-0.5">What&apos;s hot right now</p>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors rotate-[-90deg]" />
                  </Link>

                  <Link
                    href="/products?type=deals"
                    className="group flex items-center justify-between px-6 py-5 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200 hover:bg-green-50/30"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Tag className="h-6 w-6 text-green-600" />
                      <div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                          <AutoFontText>Deals & Offers</AutoFontText>
                        </span>
                        <p className="text-sm text-gray-600 mt-0.5">Save more today</p>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors rotate-[-90deg]" />
                  </Link>
                </div>
              </div>
            )}

            {/* Premium Seller Button */}
            <div className="px-6 pb-8">
              <button
                onClick={() => {
                  handleSellerClick();
                  setIsMenuOpen(false);
                }}
                disabled={loading}
                className={`w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-theme-primary to-theme-secondary text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-theme-primary-dark hover:to-theme-secondary-dark cursor-pointer ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Store className="h-6 w-6" />
                <span>
                  <AutoFontText>
                    {loading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Start Selling'}
                  </AutoFontText>
                </span>
                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;