'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProductsCategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export default function ProductsCategoryPage({ params }: ProductsCategoryPageProps) {
  const router = useRouter();

  useEffect(() => {
    const redirectToProducts = async () => {
      const resolvedParams = await params;
      const categorySlug = resolvedParams.categorySlug;
      
      // Redirect to products page with category query parameter
      router.replace(`/products?category=${encodeURIComponent(categorySlug)}`);
    };

    redirectToProducts();
  }, [params, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading products...</p>
      </div>
    </div>
  );
}