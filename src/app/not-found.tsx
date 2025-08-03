'use client';

import Link from 'next/link';
import { ArrowLeft, Home, Search, RefreshCw, HelpCircle, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-blue-100 rounded-full mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-10 animate-pulse"></div>
            <div className="text-6xl font-bold text-blue-600 relative z-10">404</div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 sm:text-5xl">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2 max-w-md mx-auto leading-relaxed">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <p className="text-base text-gray-500">
            The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </button>
            
            <Link
              href="/help"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Center
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <Link
              href="/products"
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-600 mb-1">
                All Products
              </div>
              <div className="text-gray-500">
                Browse our catalog
              </div>
            </Link>
            
            <Link
              href="/cart"
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-600 mb-1">
                Shopping Cart
              </div>
              <div className="text-gray-500">
                View your cart
              </div>
            </Link>
            
            <Link
              href="/help"
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-600 mb-1">
                Help Center
              </div>
              <div className="text-gray-500">
                Get support
              </div>
            </Link>
            
            <Link
              href="/admin"
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-600 mb-1">
                Account
              </div>
              <div className="text-gray-500">
                Manage profile
              </div>
            </Link>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Still need help?
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Our support team is here to assist you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+8801763223035"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </a>
              <a
                href="mailto:business@horekmart.com"
                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Us
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-400">
          Error Code: 404 • Page Not Found • {new Date().getFullYear()} Horekmart
        </div>
      </div>
    </div>
  );
}
