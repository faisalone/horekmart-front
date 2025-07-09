'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { CartItem, Product } from '@/types';
import { getMockProductById } from '@/lib/mock-data';

// Mock cart data
const mockCartItems: CartItem[] = [
  {
    id: '1',
    productId: '1',
    quantity: 2,
    selectedVariants: { color: 'blue', size: '256gb' },
    price: 899.99,
  },
  {
    id: '2',
    productId: '3',
    quantity: 1,
    selectedVariants: { color: 'white-black', size: '9' },
    price: 119.99,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(itemId);
      return;
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  const getProductDetails = (productId: string): Product | null => {
    return getMockProductById(productId) || null;
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Start shopping to add items to your cart.</p>
          <div className="mt-6">
            <Link href="/products">
              <Button size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/products" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-2">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        {/* Cart Items */}
        <div className="lg:col-span-7">
          <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {cartItems.map((item) => {
              const product = getProductDetails(item.productId);
              if (!product) return null;

              return (
                <li key={item.id} className="p-6 sm:p-6">
                  <div className="flex items-start">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link href={`/products/${product.id}`}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="ml-6 flex-1">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <Link href={`/products/${product.id}`}>
                            <h4 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                              {product.name}
                            </h4>
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                          
                          {/* Selected Variants */}
                          {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                            <div className="mt-2">
                              {Object.entries(item.selectedVariants).map(([key, value]) => (
                                <span key={key} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Price */}
                          <p className="text-lg font-medium text-gray-900 mt-2">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <div className="ml-4">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-gray-900 font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="ml-4 text-lg font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Order Summary */}
        <div className="mt-16 lg:mt-0 lg:col-span-5">
          <div className="bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Shipping</span>
                <span className="text-sm font-medium text-gray-900">
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tax</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(tax)}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-900">Order total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Free Shipping Message */}
            {shipping > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Add {formatCurrency(50 - subtotal)} more to get free shipping!
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <div className="mt-6">
              <Link href="/checkout">
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>

            {/* Continue Shopping */}
            <div className="mt-4">
              <Link href="/products">
                <Button variant="outline" size="lg" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Secure checkout with SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
