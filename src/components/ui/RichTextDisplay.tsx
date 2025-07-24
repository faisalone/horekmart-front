'use client';

import React from 'react';
import '@/styles/tiptap.css';

interface RichTextDisplayProps {
  content: string;
  className?: string;
  textColor?: 'white' | 'gray' | 'black';
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = '',
  textColor = 'black'
}) => {
  if (!content) {
    return null;
  }

  const getTextColorClass = () => {
    switch (textColor) {
      case 'white':
        return 'text-white';
      case 'gray':
        return 'text-gray-700';
      case 'black':
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div 
      className={`prose prose-sm max-w-none rich-text-display ${getTextColorClass()} ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
