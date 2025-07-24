import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  theme?: 'light' | 'dark';
}

export default function Breadcrumb({ items, className = '', theme = 'light' }: BreadcrumbProps) {
  const homeClass = theme === 'dark' 
    ? 'text-white/80 hover:text-white' 
    : 'text-gray-500 hover:text-theme-secondary';
  const separatorClass = theme === 'dark' 
    ? 'text-white/60' 
    : 'text-gray-400';
  const linkClass = theme === 'dark' 
    ? 'text-white/80 hover:text-white' 
    : 'text-gray-500 hover:text-theme-secondary';
  const activeClass = theme === 'dark' 
    ? 'text-white font-medium' 
    : 'text-gray-900 font-medium';

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link 
        href="/" 
        className={`flex items-center transition-colors ${homeClass}`}
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className={`w-4 h-4 ${separatorClass}`} />
          {item.href ? (
            <Link 
              href={item.href}
              className={`transition-colors ${linkClass}`}
            >
              {item.label}
            </Link>
          ) : (
            <span className={activeClass}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
