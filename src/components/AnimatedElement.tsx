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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        } else {
          setIsVisible(false); // Reset for reverse animation
        }
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
    
    if (!isVisible) {
      switch (animation) {
        case 'fadeIn': return `${baseClasses} opacity-0`;
        case 'slideUp': return `${baseClasses} opacity-0 translate-y-8`;
        case 'slideDown': return `${baseClasses} opacity-0 -translate-y-8`;
        case 'slideLeft': return `${baseClasses} opacity-0 translate-x-8`;
        case 'slideRight': return `${baseClasses} opacity-0 -translate-x-8`;
        case 'scaleUp': return `${baseClasses} opacity-0 scale-95`;
        default: return `${baseClasses} opacity-0`;
      }
    }
    
    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`;
  };

  return (
    <div ref={ref} className={`${getAnimationClasses()} ${className}`}>
      {children}
    </div>
  );
}
