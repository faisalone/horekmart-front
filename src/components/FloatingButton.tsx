'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface FloatingButtonProps {
  type: 'whatsapp' | 'filter';
  onClick: () => void;
  phoneNumber?: string;
  message?: string;
  className?: string;
}

export default function FloatingButton({
  type,
  onClick,
  phoneNumber,
  message = 'Hello! I need assistance.',
  className = ''
}: FloatingButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [moved, setMoved] = useState(false);
  const animationFrameRef = React.useRef<number>(0);

  // Get screen size category
  const getScreenSize = () => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
  };

  // Get default position based on button type
  const getDefaultPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 20, y: 20 };
    
    const margin = 24;
    const buttonSize = 56;
    
    if (type === 'whatsapp') {
      return {
        x: window.innerWidth - buttonSize - margin,
        y: window.innerHeight - buttonSize - margin
      };
    } else {
      return {
        x: margin,
        y: window.innerHeight - buttonSize - margin
      };
    }
  }, [type]);

  // Keep position within viewport
  const constrainPosition = useCallback((x: number, y: number) => {
    const margin = 8;
    const buttonSize = 56;
    return {
      x: Math.max(margin, Math.min(window.innerWidth - buttonSize - margin, x)),
      y: Math.max(margin, Math.min(window.innerHeight - buttonSize - margin, y))
    };
  }, []);

  // Cookie management
  const savePosition = useCallback((pos: { x: number; y: number }) => {
    const key = `${type}-button-${getScreenSize()}`;
    document.cookie = `${key}=${JSON.stringify(pos)};path=/;max-age=31536000;SameSite=Lax`;
  }, [type]);

  const loadPosition = useCallback(() => {
    const key = `${type}-button-${getScreenSize()}`;
    const saved = document.cookie
      .split(';')
      .find(row => row.trim().startsWith(`${key}=`));
    
    if (saved) {
      try {
        const pos = JSON.parse(saved.split('=')[1]);
        setPosition(constrainPosition(pos.x, pos.y));
        return;
      } catch (e) {
        console.warn('Failed to load saved position');
      }
    }
    
    setPosition(getDefaultPosition());
  }, [type, constrainPosition, getDefaultPosition]);

  // Mount only on client
  useEffect(() => {
    setMounted(true);
    loadPosition();
  }, [loadPosition]);

  // Optimized position update with requestAnimationFrame
  const updatePosition = useCallback((newPos: { x: number; y: number }) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      setPosition(newPos);
    });
  }, []);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setMoved(false);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setMoved(true);
    const newPos = constrainPosition(e.clientX - dragStart.x, e.clientY - dragStart.y);
    updatePosition(newPos);
  }, [isDragging, dragStart, updatePosition, constrainPosition]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      if (moved) savePosition(position);
    }
  }, [isDragging, moved, position, savePosition]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setMoved(false);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    e.preventDefault();
    setMoved(true);
    const touch = e.touches[0];
    const newPos = constrainPosition(touch.clientX - dragStart.x, touch.clientY - dragStart.y);
    updatePosition(newPos);
  }, [isDragging, dragStart, updatePosition, constrainPosition]);

  // Click handler
  const handleClick = () => {
    if (moved) return;
    
    if (type === 'whatsapp' && phoneNumber) {
      const formattedPhone = phoneNumber.replace(/[\s-()]/g, '');
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
    } else {
      onClick();
    }
  };

  // Global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Reset position on screen size change
  useEffect(() => {
    const handleResize = () => {
      const newPos = constrainPosition(position.x, position.y);
      if (newPos.x !== position.x || newPos.y !== position.y) {
        setPosition(newPos);
        savePosition(newPos);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, constrainPosition, savePosition]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!mounted) return null;

  // Don't render WhatsApp button if no phone number is provided
  const isWhatsApp = type === 'whatsapp';
  if (isWhatsApp && !phoneNumber) return null;

  // Button styling
  const bgColor = isWhatsApp ? 'bg-[#25D366] hover:bg-[#128C7E]' : 'bg-blue-600 hover:bg-blue-700';
  const visibility = type === 'filter' ? 'lg:hidden' : '';

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`
        fixed w-14 h-14 ${bgColor} text-white rounded-full shadow-lg
        flex items-center justify-center transition-all duration-150
        ${isDragging 
          ? 'scale-110 shadow-2xl cursor-grabbing z-[9999] transition-none' 
          : 'hover:scale-105 active:scale-95 cursor-grab hover:shadow-xl z-50'
        }
        ${visibility} ${className}
      `}
      style={{
        left: position.x,
        top: position.y,
        touchAction: 'none',
        willChange: isDragging ? 'transform' : 'auto'
      }}
      aria-label={isWhatsApp ? 'Contact us on WhatsApp' : 'Open filters'}
    >
      {isWhatsApp ? (
        <Image
          src="/WhatsApp_Digital_Glyph_Green.svg"
          alt="WhatsApp"
          width={24}
          height={24}
          className="filter brightness-0 invert"
        />
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" 
          />
        </svg>
      )}
    </button>
  );
}