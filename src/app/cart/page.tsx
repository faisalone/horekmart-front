'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X, ArrowLeft, ShoppingBag, Trash2, ChevronDown } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { useProductCheckout } from '@/services/ProductCheckoutService';

function CartContent() {
  const { state, updateQuantity, updateVariant, removeItem, clearCart } = useCart();
  const { prepareCartCheckout } = useProductCheckout();

  // Simple cart totals without shipping calculation
  const subtotal = state.totalPrice;

  const total = subtotal; // No shipping cost added here
  
  // Calculate total savings from all discounted items
  const getTotalSavings = () => {
    return state.items.reduce((totalSavings, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        const itemSavings = (item.originalPrice - item.price) * item.quantity;
        return totalSavings + itemSavings;
      }
      return totalSavings;
    }, 0);
  };
  
  const totalSavings = getTotalSavings();

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-theme-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <Link href="/products" className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 transition-colors px-4 py-2 rounded-md font-medium text-gray-700">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Empty Cart */}
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link href="/products" className="bg-theme-secondary hover:bg-theme-secondary-dark text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center justify-center">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Shopping Cart ({state.totalItems} {state.totalItems === 1 ? 'item' : 'items'})
            </h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
              <Link href="/products" className="flex items-center justify-center gap-2 w-full sm:w-auto text-gray-800 border border-gray-800 hover:bg-gray-50 transition-colors px-4 py-2 rounded-md font-medium">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {state.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
                {/* Responsive Layout: Mobile 2-row structure, desktop 3-column preserved */}
                <div className="space-y-4 md:grid md:grid-cols-3 md:gap-6 md:items-stretch md:min-h-[140px] md:space-y-0">
                  
                  {/* Mobile Row 1: Image + Product Info / Desktop: Separate columns */}
                  <div className="grid grid-cols-2 gap-4 items-start md:contents">
                    {/* Image Section - Left side on mobile, first column on desktop */}
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden md:h-full md:min-h-[140px]">
                      <Image
                        src={item.productImage || '/placeholder-product.svg'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>

                    {/* Product Info Section - Right side on mobile, second column on desktop */}
                    <div className="space-y-2 md:flex md:flex-col md:justify-between md:py-2 md:min-h-[140px]">
                      {/* Product Details */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                          <Link 
                            href={item.categorySlug ? `/products/${item.categorySlug}/${item.productSlug}` : `/products/${item.productSlug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {item.productName}
                          </Link>
                        </h3>

                        {/* SKU */}
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">SKU:</span> {item.sku || 'N/A'}
                        </p>

                        {/* Variant */}
                        {item.variantOptions && Object.keys(item.variantOptions).length > 0 ? (
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(item.variantOptions).map(([key, value]) => (
                                <span 
                                  key={key}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-theme-secondary text-white"
                                >
                                  <span className="font-medium">{key}:</span>&nbsp;{String(value)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : item.variantId ? (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Variant:</span> {item.variantId}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">Standard Product</p>
                        )}
                      </div>

                      {/* Price Section - On mobile row 1, desktop keeps quantity here */}
                      <div className="md:hidden">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(item.price)}
                        </div>
                        {/* Original Price (if different from current price) */}
                        {item.originalPrice && item.originalPrice > item.price && (
                          <div className="text-sm text-gray-400 line-through">
                            {formatCurrency(item.originalPrice)}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">per item</div>
                      </div>

                      {/* Quantity Section - Hidden on mobile (shown in row 2), visible on desktop */}
                      <div className="hidden md:flex items-center border border-gray-300 rounded-md w-fit">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={!!(item.maxQuantity && item.quantity >= item.maxQuantity)}
                          className="p-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Row 2: Quantity + Remove Button / Desktop: Third column */}
                  <div className="flex justify-between items-center md:flex-col md:justify-between md:items-end md:py-2 md:min-h-[140px]">
                    {/* Quantity Section - Left on mobile, hidden on desktop (shown in column 2) */}
                    <div className="flex items-center border border-gray-300 rounded-md w-fit md:hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={!!(item.maxQuantity && item.quantity >= item.maxQuantity)}
                        className="p-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Pricing - Hidden on mobile (shown in row 1), visible on desktop */}
                    <div className="hidden md:block md:text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(item.price)}
                      </div>
                      {/* Original Price (if different from current price) */}
                      {item.originalPrice && item.originalPrice > item.price && (
                        <div className="text-sm text-gray-400 line-through">
                          {formatCurrency(item.originalPrice)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">per item</div>
                    </div>
                    
                    {/* Remove Button - Right on mobile, bottom on desktop */}
                    <div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 transition-colors"
                        title="Remove item"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>

                </div>

                {/* Stock Warning - Full width at bottom if needed */}
                {item.maxQuantity && item.quantity > item.maxQuantity && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">
                      ⚠️ Only {item.maxQuantity} items available. Please adjust quantity.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:sticky lg:top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary ({state.totalItems})
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <div className="text-right">
                    <span className="font-medium text-gray-500">To be calculated</span>
                  </div>
                </div>
                
				<div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    *Shipping will be calculated at checkout
                  </div>
                </div>
                
                {/* Total Savings Badge */}
                {totalSavings > 0 && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      💰 You Save {formatCurrency(totalSavings)}
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <Button 
                onClick={async () => {
                  try {
                    const checkoutUrl = await prepareCartCheckout(state.items);
                    window.location.href = checkoutUrl;
                  } catch (error) {
                    console.error('Error preparing checkout:', error);
                  }
                }}
                className="w-full bg-theme-primary hover:bg-theme-primary-dark text-white transition-colors mt-6"
              >
                Proceed to Checkout
              </Button>

              {/* Continue Shopping */}
              <Link href="/products" className="block mt-3 w-full text-gray-800 border border-gray-800 hover:bg-gray-50 transition-colors px-4 py-2 rounded-md font-medium text-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-theme-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    }>
      <CartContent />
    </Suspense>
  );
}
