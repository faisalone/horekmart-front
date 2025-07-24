'use client';

interface BannerBlockSkeletonProps {
  className?: string;
  height?: string;
}

const BannerBlockSkeleton = ({ className = '', height = 'h-48' }: BannerBlockSkeletonProps) => {
  return (
    <div className={`relative ${height} rounded-xl border border-gray-200 overflow-hidden group ${className}`}>
      {/* Background image skeleton with shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
      
      {/* Bottom overlay that matches the actual BannerBlock design */}
      <div className="absolute -bottom-1 -left-1 -right-1 bg-gray-800/60 overflow-hidden h-14 md:h-16">
        {/* Title skeleton container */}
        <div className="px-4 py-3 text-center h-full flex items-center justify-center">
          {/* Single title skeleton line - matching the actual banner */}
          <div className="h-5 md:h-6 bg-white/30 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
      
      {/* Optional badge skeleton in top-right corner */}
      <div className="absolute top-4 right-4">
        <div className="h-6 w-12 bg-white/20 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default BannerBlockSkeleton;
