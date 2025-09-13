'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { gtmPageView, initGTM } from '@/lib/gtm';

/**
 * Google Tag Manager component for tracking page views
 * This should be included in the root layout
 */
export default function GoogleTagManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize GTM dataLayer
    initGTM();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    if (pathname && typeof window !== 'undefined') {
      const url = window.location.origin + pathname;
      gtmPageView(url);
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}