'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedElementProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleUp';
  delay?: number;
  className?: string;
}

export default function AnimatedElement({ 
  children, 
  animation = 'fadeIn', 
  delay = 0, 
  className = '' 
}: AnimatedElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true); // Start visible for better UX

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
        // Don't reset to false when out of view to maintain visibility
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-700 ease-out';
    
    // Always start visible with opacity 100 for better UX
    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`;
  };

  return (
    <div ref={ref} className={`${getAnimationClasses()} ${className}`}>
      {children}
    </div>
  );
}
