'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListDropdownOption {
  value: string;
  label: string;
}

interface ListDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ListDropdownOption[];
  variant?: 'light' | 'dark';
  className?: string;
  placeholder?: string;
}

export function ListDropdown({
  value,
  onValueChange,
  options,
  variant = 'light',
  className,
  placeholder = 'Select option...'
}: ListDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        const rect = triggerRef.current!.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      };

      updatePosition();

      // Update position on scroll and resize
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  const handleSelect = (option: ListDropdownOption) => {
    onValueChange(option.value);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Theme-based styles
  const triggerStyles = variant === 'light' 
    ? 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300'
    : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500';

  const dropdownStyles = variant === 'light'
    ? 'bg-white border-gray-200 shadow-xl'
    : 'bg-gray-800 border-gray-600 shadow-xl';

  const optionStyles = variant === 'light'
    ? 'text-gray-900 hover:bg-gray-100'
    : 'text-white hover:bg-gray-700';

  return (
    <>
      <div className={cn("relative", className)}>
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          className={cn(
            "flex items-center justify-between w-full px-4 py-3 text-left border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            triggerStyles
          )}
        >
          <span className="truncate font-medium">
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown 
            className={cn(
              "h-5 w-5 transition-transform duration-200 flex-shrink-0 ml-2",
              isOpen ? "transform rotate-180" : "",
              variant === 'light' ? 'text-gray-500' : 'text-gray-400'
            )} 
          />
        </button>
      </div>

      {/* Dropdown Menu Portal */}
      {isOpen && mounted && createPortal(
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-[999999] rounded-xl border overflow-hidden",
            dropdownStyles
          )}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          {/* Options List - Simple, no scrolling */}
          <div className="py-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-150 focus:outline-none",
                  optionStyles,
                  value === option.value && (variant === 'light' ? 'bg-blue-50 text-blue-700' : 'bg-blue-900 text-blue-200')
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default ListDropdown;
