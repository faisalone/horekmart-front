'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productCheckoutService } from '@/services/ProductCheckoutService';

function CheckoutRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const mode = searchParams.get('mode');
  const productSlug = searchParams.get('product_slug');
  const variantId = searchParams.get('variant_id');
  const quantity = searchParams.get('quantity');

  useEffect(() => {
    if (hasProcessed.current) return;
    
    const handleCheckout = async () => {
      try {
        hasProcessed.current = true;
        
        if (mode === 'buy_now' && productSlug && quantity) {
          // Handle Order Now flow
          const sessionId = await productCheckoutService.buyNow(
            productSlug,
            parseInt(quantity),
            variantId || undefined
          );
          router.replace(`/checkout/${sessionId}`);
          
        } else {
          // Invalid parameters, redirect to cart
          router.replace('/cart');
        }
        
      } catch (error) {
        console.error('Error setting up checkout:', error);
        router.replace('/cart');
      } finally {
        setIsLoading(false);
      }
    };

    handleCheckout();
  }, [mode, productSlug, quantity, variantId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {isLoading 
            ? (mode === 'buy_now' ? 'Setting up your order...' : 'Preparing checkout...')
            : 'Redirecting...'
          }
        </p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function CheckoutRedirect() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutRedirectContent />
    </Suspense>
  );
}