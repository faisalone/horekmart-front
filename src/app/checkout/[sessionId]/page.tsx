'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CreditCard, MapPin, Phone, Mail, Lock, CheckCircle, Edit3, X, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Button from '@/components/ui/Button';
import { useRouter, useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'react-hot-toast';

interface OrderData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: 'bkash' | 'nagad' | 'pay_later';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  shippingMethod: 'inside_chattogram' | 'inside_dhaka' | 'outside_dhaka';
  saveInfo: boolean;
  agreeTerms: boolean;
}

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;
  
  const [isValidSession, setIsValidSession] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [isDirectBuy, setIsDirectBuy] = useState(false);

  // Validate session on mount
  useEffect(() => {
    const validateSession = () => {
      // Check if session exists in localStorage
      const storedSession = localStorage.getItem('checkout_session');
      const storedItems = localStorage.getItem('checkout_items');
      const storedTimestamp = localStorage.getItem('checkout_timestamp');
      const directBuyFlag = localStorage.getItem('is_direct_buy');
      
      if (storedSession === sessionId && storedItems && storedTimestamp) {
        // Check if session is not expired (24 hours)
        const sessionAge = Date.now() - parseInt(storedTimestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (sessionAge > maxAge) {
          // Session expired
          localStorage.removeItem('checkout_session');
          localStorage.removeItem('checkout_items');
          localStorage.removeItem('checkout_timestamp');
          localStorage.removeItem('is_direct_buy');
          router.replace('/cart');
          return;
        }
        
        try {
          const items = JSON.parse(storedItems);
          if (items.length === 0) {
            router.replace('/cart');
            return;
          }
          
          // Set checkout items from localStorage
          setCheckoutItems(items);
          setIsDirectBuy(directBuyFlag === 'true');
          setIsValidSession(true);
          
        } catch (error) {
          console.error('Error parsing stored items:', error);
          router.replace('/cart');
          return;
        }
      } else {
        // Invalid session, redirect to cart
        router.replace('/cart');
        return;
      }
      
      setSessionLoading(false);
    };

    if (sessionId) {
      validateSession();
    } else {
      router.replace('/cart');
    }
  }, [sessionId, router]);

  const [formData, setFormData] = useState<OrderData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh',
    paymentMethod: 'bkash',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    shippingMethod: 'outside_dhaka',
    saveInfo: false,
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Partial<OrderData>>({});
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    description: string;
  } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  const handleInputChange = (field: keyof OrderData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Mock discount codes for demo
  const validDiscountCodes = {
    'SAVE10': { type: 'percentage' as const, value: 10, description: 'Save 10% on your order' },
    'FLAT50': { type: 'fixed' as const, value: 50, description: 'Get ৳50 off your order' },
    'WELCOME20': { type: 'percentage' as const, value: 20, description: 'Welcome! Save 20% on your first order' },
    'FREESHIP': { type: 'fixed' as const, value: 0, description: 'Free shipping on your order' },
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    setDiscountLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const discount = validDiscountCodes[discountCode.toUpperCase() as keyof typeof validDiscountCodes];
    
    if (discount) {
      setAppliedDiscount({
        code: discountCode.toUpperCase(),
        ...discount
      });
      toast.success(`Discount applied: ${discount.description}`);
    } else {
      toast.error('Invalid discount code');
    }
    
    setDiscountLoading(false);
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    toast.success('Discount removed');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderData> = {};

    // Required fields
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.firstName) newErrors.firstName = 'Full name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';

    // Terms agreement
    if (!formData.agreeTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy to continue.');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    try {
      // Create order payload
      const orderPayload = {
        customer: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        payment: {
          method: formData.paymentMethod,
        },
        items: checkoutItems.map(item => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          price: item.price,
          product_name: item.productName,
          variant_options: item.variantOptions || {},
        })),
        totals: {
          subtotal: subtotal,
          shipping: shipping,
          discountAmount: discountAmount,
          total: total,
        }
      };

      console.log('Order payload:', orderPayload);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock order ID
      const mockOrderId = `ORDER-${Date.now()}`;
      setOrderId(mockOrderId);
      setOrderComplete(true);
      
      // Clear items after successful order
      if (isDirectBuy) {
        // For direct buy, only clear localStorage
        localStorage.removeItem('checkout_session');
        localStorage.removeItem('checkout_items');
        localStorage.removeItem('checkout_timestamp');
        localStorage.removeItem('is_direct_buy');
      } else {
        // For regular checkout, clear cart
        clearCart();
        localStorage.removeItem('checkout_session');
        localStorage.removeItem('checkout_items');
        localStorage.removeItem('checkout_timestamp');
      }

    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // No need for cart redirect - session validation handles it
  // The session validation useEffect handles redirects

  // Calculate totals with dynamic shipping
  const subtotal = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const getShippingCost = () => {
    switch (formData.shippingMethod) {
      case 'inside_chattogram':
        return 50;
      case 'inside_dhaka':
        return 70;
      case 'outside_dhaka':
        return 130;
      default:
        return 130;
    }
  };
  const shipping = getShippingCost();
  
  // Calculate discount amount
  const discountAmount = appliedDiscount 
    ? appliedDiscount.type === 'percentage' 
      ? (subtotal * appliedDiscount.value) / 100
      : appliedDiscount.value
    : 0;
  
  const total = subtotal + shipping - discountAmount;

  // Calculate total savings from all discounted items
  const getTotalSavings = () => {
    return checkoutItems.reduce((totalSavings, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        const itemSavings = (item.originalPrice - item.price) * item.quantity;
        return totalSavings + itemSavings;
      }
      return totalSavings;
    }, 0);
  };
  
  const totalSavings = getTotalSavings();

  // Show session loading first
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating session...</p>
        </div>
      </div>
    );
  }

  // Show invalid session if not valid
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid checkout session. Redirecting...</p>
        </div>
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been successfully placed.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono font-semibold text-gray-900">{orderId}</p>
          </div>
          <div className="space-y-3">
            <Link href="/products">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Go to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <Link href="/cart">
              <Button variant="outline" className="flex items-center gap-2 text-gray-800 border-gray-400">
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Phone Number</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[var(--theme-red)] transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-gray-400'
                      }`}
                      placeholder="+880*****-119"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      We may require your phone number and confirmations and delivery updates. Follow our 
                      <span className="text-[var(--theme-red)]"> Terms & service</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[var(--theme-red)] transition-colors ${
                        errors.firstName ? 'border-red-500' : 'border-gray-400'
                      }`}
                      placeholder="Full Name"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[var(--theme-red)] transition-colors ${
                        errors.address ? 'border-red-500' : 'border-gray-400'
                      }`}
                      placeholder="Address"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[var(--theme-red)] transition-colors ${
                          errors.city ? 'border-red-500' : 'border-gray-400'
                        }`}
                        placeholder="City"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal code
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[var(--theme-red)] transition-colors ${
                          errors.zipCode ? 'border-red-500' : 'border-gray-400'
                        }`}
                        placeholder="Postal code"
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping method */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping method</h2>
                <div className="space-y-3">
                  <div 
                    onClick={() => handleInputChange('shippingMethod', 'inside_chattogram')}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.shippingMethod === 'inside_chattogram' 
                        ? 'border-[var(--theme-red)] bg-[var(--theme-red-light)]' 
                        : 'border-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-gray-900">Inside Chattogram City</span>
                    <span className={`font-semibold ${
                      formData.shippingMethod === 'inside_chattogram' ? 'text-[var(--theme-red)]' : ''
                    }`}>{formatCurrency(50)}</span>
                  </div>
                  
                  <div 
                    onClick={() => handleInputChange('shippingMethod', 'inside_dhaka')}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.shippingMethod === 'inside_dhaka' 
                        ? 'border-[var(--theme-red)] bg-[var(--theme-red-light)]' 
                        : 'border-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-gray-900">Inside Dhaka City</span>
                    <span className={`font-semibold ${
                      formData.shippingMethod === 'inside_dhaka' ? 'text-[var(--theme-red)]' : ''
                    }`}>{formatCurrency(70)}</span>
                  </div>
                  
                  <div 
                    onClick={() => handleInputChange('shippingMethod', 'outside_dhaka')}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.shippingMethod === 'outside_dhaka' 
                        ? 'border-[var(--theme-red)] bg-[var(--theme-red-light)]' 
                        : 'border-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-gray-900">Outside Dhaka & Chittagong</span>
                    <span className={`font-semibold ${
                      formData.shippingMethod === 'outside_dhaka' ? 'text-[var(--theme-red)]' : ''
                    }`}>{formatCurrency(130)}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
                <p className="text-sm text-gray-600 mb-4">All transactions are secure and encrypted.</p>
                
                <div className="space-y-3">
                  {/* bKash */}
                  <div 
                    onClick={() => handleInputChange('paymentMethod', 'bkash')}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.paymentMethod === 'bkash' 
                        ? 'bg-pink-50 border-pink-500' 
                        : 'border-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-pink-600 rounded text-white text-xs font-bold flex items-center justify-center">
                          bKash
                        </div>
                        <span className="font-medium text-gray-900">bKash</span>
                      </div>
                      {formData.paymentMethod === 'bkash' && (
                        <div className="w-5 h-5 bg-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Pay securely with your bKash account</p>
                  </div>

                  {/* Nagad */}
                  <div 
                    onClick={() => handleInputChange('paymentMethod', 'nagad')}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.paymentMethod === 'nagad' 
                        ? 'bg-orange-50 border-orange-500' 
                        : 'border-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-orange-600 rounded text-white text-xs font-bold flex items-center justify-center">
                          Nagad
                        </div>
                        <span className="font-medium text-gray-900">Nagad</span>
                      </div>
                      {formData.paymentMethod === 'nagad' && (
                        <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Pay instantly with your Nagad wallet</p>
                  </div>

                  {/* Pay Later */}
                  <div 
                    onClick={() => handleInputChange('paymentMethod', 'pay_later')}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.paymentMethod === 'pay_later' 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'border-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">
                          COD
                        </div>
                        <span className="font-medium text-gray-900">Cash on Delivery</span>
                      </div>
                      {formData.paymentMethod === 'pay_later' && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Pay when you receive your order</p>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 sticky top-4">
              {/* Edit Cart Button */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                {!isDirectBuy && (
                  <Link href="/cart">
                    <button className="text-[var(--theme-blue)] hover:text-[var(--theme-blue-dark)] p-1 rounded transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </Link>
                )}
              </div>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {checkoutItems.map((item) => (
                  <Link 
                    key={item.id} 
                    href={item.categorySlug ? `/products/${item.categorySlug}/${item.productSlug}` : `/products/${item.productSlug}`}
                    className="block transition-transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.productImage || '/placeholder-product.svg'}
                          alt={item.productName}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-[var(--theme-red)] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 mb-1 hover:text-[var(--theme-blue)] transition-colors">{item.productName}</p>
                        {(item.variantId && item.variantOptions) && (
                          <p className="text-sm text-gray-600 mb-1">
                            {Object.entries(item.variantOptions).map(([key, value]) => `${key}: ${value}`).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                {appliedDiscount ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <span className="text-green-700 font-medium">{appliedDiscount.code}</span>
                      <p className="text-green-600 text-sm">{appliedDiscount.description}</p>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                      className="w-full px-4 py-3 pr-20 border border-gray-400 rounded-lg focus:outline-none focus:border-[var(--theme-red)] transition-colors"
                    />
                    <button 
                      onClick={handleApplyDiscount}
                      disabled={discountLoading || !discountCode.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm bg-[var(--theme-red)] text-white rounded hover:bg-[var(--theme-red-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {discountLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                      Apply
                    </button>
                  </div>
                )}
              </div>
              
              {/* Totals */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal • {checkoutItems.length} items</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatCurrency(shipping)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount ({appliedDiscount.code})</span>
                    <span className="font-medium text-green-600">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <div className="text-right">
                    <span>{formatCurrency(total)}</span>
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
              
              {/* Terms and Conditions Checkbox */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                    className="mr-3 mt-1 text-[var(--theme-red)] focus:ring-[var(--theme-red)]"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-[var(--theme-blue)] underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-[var(--theme-blue)] underline">Privacy Policy</a>
                    . I confirm that all information provided is accurate and complete.
                  </span>
                </label>
              </div>
              
              {/* Pay Now Button */}
              <Button
                onClick={handleSubmit}
                disabled={isProcessing || !formData.agreeTerms}
                className="w-full py-4 mt-6 bg-[var(--theme-red)] hover:bg-[var(--theme-red-dark)] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-colors"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  formData.paymentMethod === 'pay_later' ? 'Confirm Order' : 'Pay Now'
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                🔒 Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
