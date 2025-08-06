'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  Store,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Tags,
  X,
} from 'lucide-react';
import { AdminMenuItem } from '@/types/admin';

const menuItems: AdminMenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/dashboard/products',
    icon: Package,
  },
  {
    title: 'Categories',
    href: '/dashboard/categories',
    icon: FolderTree,
  },
  {
    title: 'Variations',
    href: '/dashboard/variations',
    icon: Tags,
  },
  {
    title: 'Vendors',
    href: '/dashboard/vendors',
    icon: Store,
    badge: 5, // This could be dynamically set based on pending approvals
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

interface DashboardSidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

function DashboardSidebar({ isOpen, onClose, className }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        className
      )}>
        {/* Mobile close button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <Link href="/admin" className="flex items-center space-x-3" onClick={handleLinkClick}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </Link>
        </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
              onClick={(e) => {
                if (item.children) {
                  e.preventDefault();
                  toggleExpanded(item.href);
                } else {
                  handleLinkClick();
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.children && (
                expandedItems.includes(item.href) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              )}
            </Link>

            {/* Submenu */}
            {item.children && expandedItems.includes(item.href) && (
              <div className="ml-8 mt-2 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'block px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive(child.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    )}
                    onClick={handleLinkClick}
                  >
                    <div className="flex items-center space-x-3">
                      <child.icon className="w-4 h-4" />
                      <span>{child.title}</span>
                      {child.badge && (
                        <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {child.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          Admin Panel v1.0.0
        </div>
      </div>
      </div>
    </>
  );
}

export default DashboardSidebar;
