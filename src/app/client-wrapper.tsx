'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingButton from '@/components/FloatingButton';
import { AdminAuthProvider } from '@/hooks/useAdminAuth';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { Toaster } from 'sonner';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const pathname = usePathname();
  
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
    <CartProvider>
      <WishlistProvider>
        <CategoriesProvider>
          <AdminAuthProvider>
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
                phoneNumber="+880 1763 223035"
                message="Hello! I'm interested in your products."
              />
            </div>
          )}
          </AdminAuthProvider>
        </CategoriesProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
