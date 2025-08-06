'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminQueryProvider } from '@/lib/admin-query-provider';
import { AdminAuthProvider } from '@/hooks/useAdminAuth';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/components/dashboard/DashboardTopbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Define authentication pages that don't require login
  const authPages = ['/login', '/register', '/verify', '/forgot'];
  const isAuthPage = authPages.includes(pathname);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isAuthPage) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router, isAuthPage]);

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show authentication pages without layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-900 dark">
      {/* Sidebar */}
      <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <DashboardTopbar onMenuToggle={toggleSidebar} />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthProvider>
      <AdminQueryProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminQueryProvider>
    </AdminAuthProvider>
  );
}
