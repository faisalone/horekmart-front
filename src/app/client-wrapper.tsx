'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AdminAuthProvider } from '@/hooks/useAdminAuth';
import { ToastProvider } from '@/hooks/useToast';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { Toaster } from 'react-hot-toast';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const pathname = usePathname();
  
  // Check if the current path is an admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <AdminAuthProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#059669',
                  },
                },
                error: {
                  style: {
                    background: '#DC2626',
                  },
                },
              }}
            />
            {/* For admin routes, render children without the frontend layout */}
            {isAdminRoute ? (
              <>{children}</>
            ) : (
              /* For all other routes, render with the frontend layout */
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            )}
          </AdminAuthProvider>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}
