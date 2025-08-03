'use client';

import { Mail, Phone, MapPin, ArrowLeft, CheckCircle, ChevronRight, User, ShoppingCart, RotateCcw, Star, HelpCircle, ShoppingBag, CreditCard, Settings, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import HelpSearch from '@/components/HelpSearch';
import { HelpPageData, HelpSection, HelpContent, GridItem, ContactInfo, StepItem, getAllCategories } from '@/data/helpData';

interface HelpPageProps {
  pageData: HelpPageData;
}

const HelpPage: React.FC<HelpPageProps> = ({ pageData }) => {
  // Auto-detect which section should be expanded based on current page
  const getCurrentSectionIndex = () => {
    const pageId = pageData.id;
    
    // Map page IDs to section indices
    const sectionMap: Record<string, number> = {
      'track-order': 0,
      'order-history': 0,
      'cancel-order': 0,
      'return-item': 0,
      'payment-methods': 1,
      'account-settings': 1,
      'billing-information': 1,
      'gift-cards': 1,
      'return-policy': 2,
      'refund-return-policy': 2,
      'start-return': 2,
      'refund-status': 2,
      'exchange-items': 2,
      'delivery-options': 3,
      'installation-services': 3,
      'customer-support': 3,
      'warranty': 3,
      'membership-benefits': 4,
      'free-shipping': 4,
      'exclusive-deals': 4,
      'priority-support': 4,
      'how-to-shop': 5,
      'product-availability': 5,
      'store-locations': 5,
      'mobile-app': 5,
      'privacy-policy': 6,
      'terms-and-conditions': 6,
      'cookie-policy': 6,
      'legal-information': 6,
      'shipping-policy': 7,
      'price-matching': 7,
      'accessibility': 7
    };
    
    return sectionMap[pageId] ?? -1;
  };

  const [selectedSection, setSelectedSection] = useState(getCurrentSectionIndex());

  // Get help navigation items from centralized data
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

  // Transform categories to navigation items format
  const helpNavItems = helpCategories.map(category => ({
    icon: iconMap[category.icon as keyof typeof iconMap] || User,
    title: category.title,
    items: category.articles.map(article => article.title)
  }));

  const renderContent = (content: HelpContent) => {
    switch (content.type) {
      case 'paragraph':
        return (
          <div className="text-gray-800 leading-relaxed text-base mb-6">
            {content.content as string}
          </div>
        );

      case 'list':
        return (
          <ul className="space-y-2 text-gray-800 mb-6">
            {(content.content as string[]).map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );

      case 'highlight':
        return (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 mt-0.5 mr-3 text-blue-400 flex-shrink-0" />
              <p className="text-blue-800 font-medium">{content.content as string}</p>
            </div>
          </div>
        );

      case 'warning':
        return (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-800">{content.content as string}</p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSection = (section: HelpSection) => (
    <div key={section.id} className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
      <div className="space-y-4">
        {section.content.map((content, index) => (
          <div key={index}>
            {renderContent(content)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Help Center', href: '/help' },
            { label: pageData.title }
          ]} 
          className="mb-8" 
        />

        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg">
              {/* Search */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Need more help?</h2>
                <div className="text-sm text-gray-600 mb-4">Search help topics</div>
                <HelpSearch placeholder="Ex. where's my order" />
              </div>

              {/* Navigation Items */}
              <div className="p-4">
                {helpNavItems.map((item, index) => (
                  <div key={index} className="mb-2">
                    <button
                      onClick={() => setSelectedSection(selectedSection === index ? -1 : index)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="font-medium text-gray-900">{item.title}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transform transition-transform ${selectedSection === index ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {selectedSection === index && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.items.map((subItem, subIndex) => {
                          // Find the corresponding article from our data
                          const category = helpCategories[index];
                          const article = category?.articles[subIndex];
                          const href = article?.url || `/help/${subItem.toLowerCase().replace(/\s+/g, '-')}`;
                          const isCurrentPage = href === `/help/${pageData.id}`;
                          
                          return (
                            <Link
                              key={subIndex}
                              href={href}
                              className={`block px-3 py-2 text-sm rounded transition-colors ${
                                isCurrentPage 
                                  ? 'text-blue-600 bg-blue-50 font-medium' 
                                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              {subItem}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header - Clean without background */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{pageData.title}</h1>
              <p className="text-sm text-gray-500 mb-6">
                Last Updated {pageData.lastUpdated || 'July 17, 2025'}
              </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-8">
              {pageData.sections.map(renderSection)}
            </div>

            {/* Bottom Actions */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-4">Was this article helpful?</p>
                <div className="flex justify-center space-x-4 mb-8">
                  <button className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Yes
                  </button>
                  <button className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2M5 4H3a2 2 0 00-2 2v6a2 2 0 002 2h2.5" />
                    </svg>
                    No
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Chat Support - Full Width */}
        <div className="mt-12 p-8 bg-gray-50">
          <div className="text-center">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Didn&apos;t find what you were looking for?</h4>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-base">
              Chat with us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
