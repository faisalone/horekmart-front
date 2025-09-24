'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, ArrowUp, Shield, Truck, Award, Globe, ChevronRight } from 'lucide-react';
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface SiteSettings {
  site_logo?: string;
  site_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  address_map_url?: string;
  company_info?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_instagram?: string;
  social_youtube?: string;
}

const Footer = () => {
  const [mounted, setMounted] = useState(false);

  // Use reactive site settings hook
  const {
    siteLogo = "/logo-light.svg",
    siteName = "Your Store",
    contactEmail,
    contactPhone,
    settings
  } = useSiteSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use static fallbacks for server-side rendering to prevent hydration mismatch
  const address = mounted && settings?.address ? settings.address : "";
  const addressMapUrl = mounted && settings?.address_map_url ? settings.address_map_url : "";
  const companyInfo = mounted && settings?.company_info ? settings.company_info : "";
  const socialFacebook = mounted && settings?.social_facebook ? settings.social_facebook : "";
  const socialTwitter = mounted && settings?.social_twitter ? settings.social_twitter : "";
  const socialInstagram = mounted && settings?.social_instagram ? settings.social_instagram : "";
  const socialYoutube = mounted && settings?.social_youtube ? settings.social_youtube : "";

  return (
    <footer className="bg-gray-900 text-white">
      
      {/* Payment Methods Banner - Professional */}


      {/* Main Footer Content - Professional Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top Row - Main Navigation Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Company Info - Professional */}
          <div className="lg:col-span-2 lg:pr-8 lg:border-r lg:border-gray-700">
            <div className="mb-6 flex flex-col items-center">
              <Image 
                src={siteLogo} 
                alt={siteName} 
                width={180} 
                height={60} 
                className="mb-4 h-40 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/logo-light.svg';
                }}
              />
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                {companyInfo || "Your trusted global marketplace for quality products. We deliver excellence, reliability, and exceptional customer service worldwide."}
              </p>
            </div>
          </div>

          {/* Shop & Customer Service - Two Columns on Mobile */}
          <div className="grid grid-cols-2 gap-6 lg:col-span-2 lg:grid-cols-2 lg:gap-8">
            {/* Shop Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Shop</h3>
              <ul className="space-y-3">
                {[
                  { name: 'All Products', href: '/products' },
                  { name: 'Trendings', href: '/products?type=trendings' },
                  { name: 'Deal & Offers', href: '/products?type=deals' },
                  { name: 'New Arrivals', href: '/products?type=new-arrivals' },
                  { name: 'Best Sellers', href: '/products?type=best-sellers' },
                ].map((item, index) => (
                  <li key={index}>
                    <Link href={item.href} className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Customer Service</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/help" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/help/refund-return-policy" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/help/shipping-policy" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="pt-8">
          {/* Bottom Row - Contact & Support Horizontally */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-center">Contact & Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {contactPhone && (
                <div className="text-center bg-gray-800 rounded-lg p-6">
                  <Phone className="h-8 w-8 mx-auto mb-3 text-blue-400" />
                  <p className="text-white font-medium text-lg">{contactPhone}</p>
                  <p className="text-sm text-gray-400 mt-1">24/7 Customer Support</p>
                </div>
              )}
              {contactEmail && (
                <div className="text-center bg-gray-800 rounded-lg p-6">
                  <Mail className="h-8 w-8 mx-auto mb-3 text-green-400" />
                  <p className="text-white font-medium text-lg">{contactEmail}</p>
                  <p className="text-sm text-gray-400 mt-1">Response within 1 hour</p>
                </div>
              )}
              <div className="text-center bg-gray-800 rounded-lg p-6">
                <MapPin className="h-8 w-8 mx-auto mb-3 text-orange-400" />
                {addressMapUrl ? (
                  <a 
                    href={addressMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-medium text-lg hover:text-orange-400 transition-colors duration-200"
                  >
                    {siteName} HQ
                  </a>
                ) : (
                  <p className="text-white font-medium text-lg">
                    {siteName} HQ
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-1">{address || "123 Main St, City, State 12345"}</p>
              </div>
            </div>
            
            {/* Social Media Section */}
            <div className="mt-12 text-center">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">Follow Us</h4>
              <div className="flex justify-center space-x-4">
                {[
                  ...(socialFacebook ? [{
                    Icon: FaFacebook,
                    name: 'Facebook',
                    color: 'hover:bg-blue-600',
                    url: socialFacebook
                  }] : []),
                  ...(socialInstagram ? [{
                    Icon: FaInstagram,
                    name: 'Instagram',
                    color: 'hover:bg-pink-600',
                    url: socialInstagram
                  }] : []),
                  ...(socialTwitter ? [{
                    Icon: FaSquareXTwitter,
                    name: 'Twitter/X',
                    color: 'hover:bg-gray-600',
                    url: socialTwitter
                  }] : []),
                  ...(socialYoutube ? [{
                    Icon: FaYoutube,
                    name: 'YouTube',
                    color: 'hover:bg-red-600',
                    url: socialYoutube
                  }] : [])
                ].map((social, index) => (
                  <a
                    key={`social-${social.name}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className={`w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center transition-colors duration-200 ${social.color}`}
                  >
                    <social.Icon className="h-6 w-6 text-gray-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer - Clean & Professional */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4 md:mb-0">
              <span>© 2025 {siteName}. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex space-x-6 text-sm">
                <Link href="/help/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href="/help/terms-and-conditions" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Terms & Conditions
                </Link>
                <Link href="/help/refund-return-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Return Policy
                </Link>
                <Link href="/help/cookie-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Cookie Policy
                </Link>
              </div>
              
              {/* Professional Back to Top */}
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Back to top"
              >
                <ArrowUp className="h-4 w-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
