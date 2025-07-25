'use client';

export function ProductImageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-gray-200 animate-pulse"
          />
        ))}
      </div>
      <div className="flex justify-center">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function ProductInfoSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6 space-y-6">
        {/* Tags and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>

        {/* Vendor Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
              </div>
            </div>
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse flex-shrink-0" />
          </div>
        </div>

        {/* Price */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
        </div>

        {/* Variants */}
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Stock Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            <div className="h-6 w-16 bg-gray-200 rounded-md animate-pulse" />
          </div>
          <div className="flex items-center justify-end text-sm">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="h-12 flex-1 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 flex-1 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Section 1 */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          ))}
        </div>
      </div>

      {/* Section 2 */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-28" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BreadcrumbSkeleton() {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
          {i < 4 && <span className="text-gray-300">›</span>}
        </div>
      ))}
    </nav>
  );
}
