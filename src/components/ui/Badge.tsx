import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = ({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium ring-offset-background';
  
  const variants = {
    default: 'bg-theme-gray-light text-gray-900',
    secondary: 'bg-theme-blue-light text-theme-blue-dark border border-blue-200',
    success: 'bg-theme-green-light text-theme-green-dark',
    warning: 'bg-theme-orange-light text-theme-orange-dark',
    error: 'bg-theme-red-light text-theme-red-dark',
    info: 'bg-theme-cyan-light text-theme-cyan-dark',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Badge;
