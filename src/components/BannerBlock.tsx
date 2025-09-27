'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AutoFontText } from '@/components/AutoFontText';

interface BannerBlockProps {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  className?: string;
  height?: string;
  badge?: string;
  textSize?: 'small' | 'medium' | 'large' | 'xlarge';
  priority?: boolean;
}

const BannerBlock = ({
  title,
  imageUrl,
  link,
  className = '',
  height = 'h-48',
  badge,
  priority = false
}: BannerBlockProps) => {
  const getBgColor = () => {
    // Use theme primary overlay for better brand consistency
    return 'theme-overlay-primary';
  };

  const getTextColor = () => {
    // Always use white text for better contrast and consistency
    return 'text-white';
  };

  const bgColorClass = getBgColor();
  const textColorClass = getTextColor();

  return (
    <Link href={link} className={`group relative overflow-hidden rounded-xl ${height} cursor-pointer block ${className}`}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        priority={priority}
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Mobile: Static title overlay (always visible) */}
      <div className={`md:hidden absolute -bottom-1 -left-1 -right-1 ${bgColorClass} overflow-hidden h-14`}>
        <div className="px-4 py-3 text-center h-full flex items-center justify-center">
          <AutoFontText className={`text-sm font-bold ${textColorClass} truncate w-full max-w-full`}>
            {title}
          </AutoFontText>
        </div>
      </div>

      {/* Desktop: Interactive title with hover effects */}
      <div className={`hidden md:block absolute -bottom-1 -left-1 -right-1 ${bgColorClass} overflow-hidden h-14 md:h-16`}>
        {/* Title container - slides up and disappears completely on hover */}
        <div className="transform translate-y-0 group-hover:-translate-y-full transition-transform duration-300 ease-out h-full">
          <div className="px-4 py-3 text-center h-full flex items-center justify-center">
            <AutoFontText className={`text-lg font-bold ${textColorClass} truncate w-full max-w-full`}>
              {title}
            </AutoFontText>
          </div>
        </div>
        
        {/* Shop Now button - slides up from bottom on hover - Theme styled */}
        <div className="absolute inset-x-0 top-full group-hover:top-0 transition-all duration-300 ease-out theme-overlay-secondary text-white h-full">
          <div className="px-4 py-3 text-center h-full flex items-center justify-center">
            <AutoFontText className="text-lg font-bold hover:text-white/90 transition-colors duration-200 truncate w-full max-w-full">
              Visit Now
            </AutoFontText>
          </div>
        </div>
      </div>
      
      {/* Optional badge with theme styling */}
      {badge && (
        <div className="absolute top-4 right-4 theme-badge-gradient text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg">
          <AutoFontText className="font-bold text-xs">
            {badge}
          </AutoFontText>
        </div>
      )}
    </Link>
  );
};

export default BannerBlock;
