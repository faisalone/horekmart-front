'use client';

import { User, CreditCard, RotateCcw, Star, ShoppingBag, ShoppingCart, FileText, Settings, Search } from 'lucide-react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import HelpSearch from '@/components/HelpSearch';
import { getAllCategories } from '@/data/helpData';

export default function HelpCenter() {
  // Get help topics from centralized data
  const helpCategories = getAllCategories();

  // Icon mapping for dynamic rendering
  const iconMap = {
    'User': User,
    'CreditCard': CreditCard,
    'RotateCcw': RotateCcw,
    'Star': Star,
    'ShoppingBag': ShoppingBag,
    'ShoppingCart': ShoppingCart,
    'FileText': FileText,
    'Settings': Settings
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Help Center' }
          ]} 
          className="mb-8" 
        />

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="bg-blue-50 rounded-2xl p-12 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Hello.</h1>
            <p className="text-lg text-gray-600 mb-8">Choose a help topic or chat with us</p>
            
            {/* Quick Help Icons */}
            <div className="flex justify-center space-x-8 mb-8">
              <Link href="/help/track-order" className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-700 transition-colors">
                  <User className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Start an order</span>
              </Link>
              
              <Link href="/help/track-order" className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-700 transition-colors">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Track an order</span>
              </Link>
              
              <Link href="/help/return-policy" className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-700 transition-colors">
                  <RotateCcw className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Start a delivery</span>
              </Link>
              
              <Link href="/help/return-policy" className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-700 transition-colors">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Browse services</span>
              </Link>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">How may we help you?</h2>
          
          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="text-sm text-gray-600 mb-4">Search help topics</div>
            <HelpSearch placeholder="Ex. where's my order" />
          </div>
        </div>

        {/* Help Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {helpCategories.map((category, index) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || User;
            
            return (
              <div key={category.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Topic Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center mb-3">
                    <IconComponent className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                
                {/* Topic Links */}
                <div className="p-6">
                  <ul className="space-y-3">
                    {category.articles.map((article, linkIndex) => (
                      <li key={article.id}>
                        <Link 
                          href={article.url}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline block"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Chat Section - Reused from HelpPage */}
        <div className="text-center">
          <div className="mt-8 p-6 bg-gray-50 rounded-lg max-w-md mx-auto">
            <h4 className="font-medium text-gray-900 mb-2">Didn&apos;t find what you were looking for?</h4>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Chat with us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
