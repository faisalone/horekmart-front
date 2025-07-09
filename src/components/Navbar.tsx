'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';

export interface NavbarProps {
  cartItemCount?: number;
}

const Navbar = ({ cartItemCount = 0 }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setIsMobileSearchOpen(false); // Close mobile search after submit
    }
  };

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

  return (
    <header className="sticky top-0 z-50">
      {/* Top Header - Modern blue to purple gradient */}
      <div className="text-white theme-gradient-blue-purple">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-20">
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* Left Side - Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="text-3xl font-bold">
                    <span>VALTOOK</span>
                  </div>
                </Link>
              </div>

              {/* Center - Search Bar */}
              <div className="flex-1 max-w-2xl mx-8">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search everything at Walmart online and in store"
                    className="w-full pl-4 pr-12 py-4 text-black rounded-full border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-base bg-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full transition-colors hover:opacity-80 theme-button-teal"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </form>
              </div>

              {/* Right Side - Actions */}
              <div className="flex items-center space-x-6">
                {/* Reorder */}
                <Link 
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
                    <div className="text-sm opacity-80">Reorder</div>
                    <div className="font-medium">My Items</div>
                  </div>
                </Link>

                {/* Cart */}
                <Link 
                  href="/cart" 
                  className="relative flex items-center space-x-2 text-white transition-colors hover:opacity-80"
                >
                  <div className="relative">
                    <ShoppingCart className="h-8 w-8" />
                    {cartItemCount > 0 && (
                      <span 
                        className="absolute -top-2 -right-2 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center bg-theme-accent-gradient"
                      >
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                  <div className="text-base">
                    <div className="text-sm opacity-80">Cart</div>
                    <div className="font-medium">${(cartItemCount * 25.99).toFixed(2)}</div>
                  </div>
                </Link>
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
                        ? 'w-64 pl-14 pr-10 opacity-100 focus:border-theme-secondary-500' 
                        : 'w-12 opacity-0 pointer-events-none'
                    }`}
                    autoFocus={isMobileSearchOpen}
                  />
                  
                  {/* Search icon - fixed position, always visible */}
                  <button
                    type={isMobileSearchOpen ? "submit" : "button"}
                    onClick={isMobileSearchOpen ? (searchQuery.trim() ? undefined : toggleMobileSearch) : toggleMobileSearch}
                    className="search-button relative z-10 w-12 h-12 rounded-full text-black flex items-center justify-center hover:opacity-80 transition-opacity bg-theme-accent-gradient"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  
                  {/* Close button - appears when search is open, positioned within the search field */}
                  {isMobileSearchOpen && (
                    <button
                      type="button"
                      onClick={toggleMobileSearch}
                      className="absolute left-56 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors z-20"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </form>
              </div>

              {/* Logo - Center */}
              <Link href="/" className="flex items-center flex-1 justify-center">
                <div className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-theme-light-pink to-theme-light-blue bg-clip-text text-transparent">VALTOOK</span>
                </div>
              </Link>

              {/* Mobile Right Side Actions */}
              <div className="flex items-center space-x-4">
                {/* Cart */}
                <Link 
                  href="/cart" 
                  className="relative flex items-center text-white transition-colors hover:opacity-80"
                >
                  <div className="relative">
                    <ShoppingCart className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <span 
                        className="absolute -top-2 -right-2 text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center bg-theme-accent-gradient"
                      >
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMenu}
                  className="p-2 text-white transition-colors hover:opacity-80"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Header - Departments and Menu - Desktop Only */}
      <div className="hidden lg:block text-white theme-gradient-pink-red">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14">
            {/* Departments Dropdown */}
            <div className="relative hidden lg:block mr-8">
              <button
                onMouseEnter={() => setIsDepartmentsOpen(true)}
                onMouseLeave={() => setIsDepartmentsOpen(false)}
                className="flex items-center space-x-2 text-white px-4 py-2 rounded transition-colors hover:bg-theme-primary-700/50"
              >
                <Menu className="h-4 w-4" />
                <span className="text-base font-medium">Departments</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isDepartmentsOpen && (
                <div
                  onMouseEnter={() => setIsDepartmentsOpen(true)}
                  onMouseLeave={() => setIsDepartmentsOpen(false)}
                  className="absolute top-full left-0 bg-white text-black shadow-lg rounded-md py-2 w-72 mt-1 z-50"
                >
                  <div className="grid grid-cols-1 gap-1 p-3">
                    <Link href="/departments/electronics" className="block px-4 py-3 hover:bg-gray-100 text-base rounded">Electronics</Link>
                    <Link href="/departments/clothing" className="block px-4 py-3 hover:bg-gray-100 text-base rounded">Clothing, Shoes & Accessories</Link>
                    <Link href="/departments/home" className="block px-4 py-3 hover:bg-gray-100 text-base rounded">Home & Garden</Link>
                    <Link href="/departments/grocery" className="block px-4 py-3 hover:bg-gray-100 text-base rounded">Grocery & Essentials</Link>
                    <Link href="/departments/sports" className="block px-4 py-3 hover:bg-gray-100 text-base rounded">Sports & Outdoors</Link>
                    <Link href="/departments/auto" className="block px-4 py-3 hover:bg-gray-100 text-base rounded">Auto & Tires</Link>
                    <Link href="/departments/toys" className="block px-4 py-3 hover:bg-gray-100 text-base rounded">Toys & Games</Link>
                    <Link href="/departments/baby" className="block px-4 py-3 hover:bg-gray-100 text-base rounded">Baby</Link>
                    <Link href="/departments/health" className="block px-4 py-3 hover:bg-gray-100 text-base rounded">Health & Wellness</Link>
                    <Link href="/departments/beauty" className="block px-4 py-3 hover:bg-gray-100 text-base rounded">Beauty & Personal Care</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Main Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/grocery" className="text-base text-white hover:opacity-80 transition-colors">
                Grocery & essentials
              </Link>
              <Link href="/valentine" className="text-base text-white hover:opacity-80 transition-colors">
                Valentine&apos;s Day
              </Link>
              <Link href="/fashion" className="text-base text-white hover:opacity-80 transition-colors">
                Fashion
              </Link>
              <Link href="/electronics" className="text-base text-white hover:opacity-80 transition-colors">
                Electronics
              </Link>
              <Link href="/home" className="text-base text-white hover:opacity-80 transition-colors">
                Home
              </Link>
              <Link href="/auto" className="text-base text-white hover:opacity-80 transition-colors">
                Auto
              </Link>
              <Link href="/pharmacy" className="text-base text-white hover:opacity-80 transition-colors">
                Pharmacy
              </Link>
              <Link href="/registry" className="text-base text-white hover:opacity-80 transition-colors">
                Registry
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-4 pb-4 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 text-gray-900 hover:bg-gray-50 rounded-md font-medium">
                Departments
              </button>
              <Link
                href="/grocery"
                className="block px-4 py-3 text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Grocery & essentials
              </Link>
              <Link
                href="/fashion"
                className="block px-4 py-3 text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Fashion
              </Link>
              <Link
                href="/electronics"
                className="block px-4 py-3 text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Electronics
              </Link>
              <Link
                href="/reorder"
                className="flex items-center px-4 py-3 text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="h-5 w-5 flex items-center justify-center mr-3">
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-1 h-1 bg-gray-900 rounded-sm"></div>
                    <div className="w-1 h-1 bg-gray-900 rounded-sm"></div>
                    <div className="w-1 h-1 bg-gray-900 rounded-sm"></div>
                    <div className="w-1 h-1 bg-gray-900 rounded-sm"></div>
                  </div>
                </div>
                Reorder
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
