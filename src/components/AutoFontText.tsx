import React, { ElementType } from 'react';
import { getAutoFontClasses, containsBengali } from '@/utils/fontUtils';

interface AutoFontTextProps {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  [key: string]: any;
}

/**
 * AutoFontText component that automatically applies the correct font
 * based on the text content (Bengali or English)
 */
export const AutoFontText: React.FC<AutoFontTextProps> = ({ 
  children, 
  className = '', 
  as: Component = 'span',
  ...props 
}) => {
  // Extract text content to determine font
  const textContent = typeof children === 'string' 
    ? children 
    : React.Children.toArray(children).join('');
  
  const fontClasses = getAutoFontClasses(textContent, className);
  
  return (
    <Component className={fontClasses} {...props}>
      {children}
    </Component>
  );
};

interface SmartTextProps {
  text: string;
  className?: string;
  as?: ElementType;
  [key: string]: any;
}

/**
 * SmartText component for direct text rendering with automatic font detection
 */
export const SmartText: React.FC<SmartTextProps> = ({ 
  text, 
  className = '', 
  as: Component = 'span',
  ...props 
}) => {
  const isBengali = containsBengali(text);
  const fontClass = isBengali ? 'font-mixed' : 'font-quicksand';
  const combinedClasses = `${fontClass} ${className}`.trim();
  
  return (
    <Component className={combinedClasses} {...props}>
      {text}
    </Component>
  );
};

export default AutoFontText;
