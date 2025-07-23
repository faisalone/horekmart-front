'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  size = 'md',
  label,
  description,
  className
}: SwitchProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleToggle = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  const sizeClasses = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      thumbTranslate: 'translate-x-4',
      text: 'text-sm'
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      thumbTranslate: 'translate-x-5',
      text: 'text-base'
    },
    lg: {
      track: 'w-14 h-8',
      thumb: 'w-7 h-7',
      thumbTranslate: 'translate-x-6',
      text: 'text-lg'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex items-start gap-3', className)}>
      {/* Switch Button */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleToggle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          // Base styles
          'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          // Focus styles
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
          // Size
          sizes.track,
          // State styles
          checked
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600',
          // Disabled styles
          disabled && 'opacity-50 cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700',
          // Focus ring visibility
          isFocused && 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800'
        )}
      >
        {/* Thumb */}
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-lg transform ring-0 transition duration-200 ease-in-out',
            sizes.thumb,
            checked ? sizes.thumbTranslate : 'translate-x-0'
          )}
        />
      </button>

      {/* Label and Description */}
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              className={cn(
                'font-medium text-gray-900 dark:text-gray-100 cursor-pointer',
                sizes.text,
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={!disabled ? handleToggle : undefined}
            >
              {label}
            </label>
          )}
          {description && (
            <span className={cn(
              'text-gray-500 dark:text-gray-400',
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
              disabled && 'opacity-50'
            )}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
