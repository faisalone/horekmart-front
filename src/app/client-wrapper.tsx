'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingButton from '@/components/FloatingButton';
import GoogleTagManager from '@/components/GoogleTagManager';
import MetaPixel from '@/components/MetaPixel';
import { AdminAuthProvider } from '@/hooks/useAdminAuth';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { PageTitleProvider } from '@/contexts/PageTitleContext';
import { Toaster } from 'sonner';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { siteSettingsService } from '@/services/siteSettings';
import { useEffect } from 'react';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const pathname = usePathname();
  const { contactPhone } = useSiteSettings();

  // Ensure settings are preloaded early in the app lifecycle
  useEffect(() => {
    siteSettingsService.preload();
  }, []);
  
  // Define routes that should not have the main layout (Navbar + Footer)
  const routesWithoutMainLayout = [
    '/admin',     // Admin routes
    '/dashboard', // Dashboard routes
    '/login',     // Authentication pages
    '/register',
    '/verify',
    '/forgot'
  ];
  
  // Check if the current path should exclude the main layout
  const shouldExcludeMainLayout = routesWithoutMainLayout.some(route => 
    pathname?.startsWith(route)
  );

  return (
    <PageTitleProvider>
      <CartProvider>
        <WishlistProvider>
          <CategoriesProvider>
            <AdminAuthProvider>
              {/* Google Tag Manager - Track page views */}
              <GoogleTagManager />
              
              {/* Meta Pixel - Track page views and events */}
              <MetaPixel />
              
              <Toaster 
                position="top-center"
                richColors
                closeButton
                expand={false}
                duration={4000}
              />
          {/* Routes without main layout render children directly */}
          {shouldExcludeMainLayout ? (
            <>{children}</>
          ) : (
            /* All other routes render with the main frontend layout */
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              {/* WhatsApp Float Button - Only show on main layout pages */}
              <FloatingButton 
                type="whatsapp"
                onClick={() => {}}
                phoneNumber={contactPhone}
                message="Hello! I'm interested in your products."
              />
            </div>
          )}
            </AdminAuthProvider>
          </CategoriesProvider>
        </WishlistProvider>
      </CartProvider>
    </PageTitleProvider>
  );
}
