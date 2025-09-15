'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { metaPixelPageView, initMetaPixel } from '@/lib/meta-pixel';

/**
 * Meta Pixel component for tracking page views
 * This should be included in the client wrapper alongside GTM
 */
export default function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Meta Pixel
    initMetaPixel();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    if (pathname && typeof window !== 'undefined') {
      // Add a small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        metaPixelPageView();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}