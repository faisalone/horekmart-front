'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AdminAuthProvider } from '@/hooks/useAdminAuth';
import { ToastProvider } from '@/hooks/useToast';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const pathname = usePathname();
  
  // Check if the current path is an admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <ToastProvider>
      <AdminAuthProvider>
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
    </ToastProvider>
  );
}
