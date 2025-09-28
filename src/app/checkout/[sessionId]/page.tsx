'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock, Edit3, X, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/currency';
import { getProductUrl } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { checkoutService, type FormOrderData as CheckoutOrderData, type CheckoutSessionData } from '@/services/CheckoutService';
import { useSetPageTitle } from '@/contexts/PageTitleContext';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useGTM } from '@/hooks/useGTM';

interface City {
  id: number;
  name: string;
  zones_count?: number;
}

interface Zone {
  id: number;
  name: string;
  city_id: number;
  areas_count?: number;
}

interface OrderData {
  email: string;
  name: string;
  phone: string;
  address: string;
  cityId: number | null;
  zoneId: number | null;
  paymentMethod: 'bkash' | 'nagad' | 'pay_later' | '';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  saveInfo: boolean;
  agreeTerms: boolean;
}

type FormField = 'phone' | 'name' | 'address' | 'city' | 'zone' | 'paymentMethod';
type FieldErrors = Partial<Record<FormField, string[]>>;

const renderErrorList = (messages?: string[]) => {
  if (!messages || messages.length === 0) return null;
  return (
    <div className="mt-1 space-y-0.5">
      {messages.map((msg, idx) => (
        <p key={idx} className="text-red-500 text-sm">{msg}</p>
      ))}
    </div>
  );
};



export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;
  
  // Set page title using improved context
  useSetPageTitle('Checkout');
  
  // GTM tracking
  const {
    trackBeginCheckout,
    trackCheckoutStep,
    trackFieldInteraction,
    trackPaymentMethodSelect,
    trackShippingInfo,
    trackCheckoutAbandonment,
    trackUserEngagement,
    trackError,
    trackPurchase
  } = useGTM();
  
  // Tracking refs
  const pageStartTime = useRef(Date.now());
  const stepStartTimes = useRef<Record<string, number>>({});
  const fieldInteractions = useRef<Record<string, { focused: boolean; filled: boolean }>>({});
  const hasTrackedBeginCheckout = useRef(false);
  
  // Field interaction handlers
  const handleFieldFocus = (fieldName: string, fieldType: string) => {
    trackFieldInteraction({
      fieldName,
      fieldType,
      action: 'focus',
      formName: 'checkout_form',
      sessionId
    });
    
    fieldInteractions.current[fieldName] = {
      ...fieldInteractions.current[fieldName],
      focused: true
    };
  };
  
  const handleFieldBlur = (fieldName: string, fieldType: string, value: any) => {
    trackFieldInteraction({
      fieldName,
      fieldType,
      action: 'blur',
      formName: 'checkout_form',
      sessionId,
      fieldValueLength: value ? value.toString().length : 0
    });
  };
  
  const handlePaymentMethodSelect = (method: string) => {
    handleInputChange('paymentMethod', method);
    
    trackPaymentMethodSelect({
      paymentMethod: method,
      sessionId,
      total,
      checkoutType: isDirectBuy ? 'buy_now' : 'cart'
    });
    
    trackCheckoutStep({
      stepNumber: 4,
      stepName: 'payment_method_selected',
      sessionId,
      checkoutType: isDirectBuy ? 'buy_now' : 'cart',
      total,
      additionalData: {
        selected_method: method
      }
    });
  };
  
  const [isValidSession, setIsValidSession] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  // Removed inline order-complete page in favor of redirect-only
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [isDirectBuy, setIsDirectBuy] = useState(false);
  
  // Location data
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  
  // Shipping calculation
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // Load cities on mount
  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const citiesData = await checkoutService.getCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    
    loadCities();
  }, []);
  
  // Validate session on mount
  useEffect(() => {
    const validateSession = async () => {
      try {
        const sessionData = await checkoutService.getCheckoutSession(sessionId);
        
        // Transform backend session data to frontend format
        const items = sessionData.items.map(item => {
          // Try to find matching cart item to get original price information
          let originalPrice = item.original_price;
          if (!originalPrice && !isDirectBuy) {
            const cartItem = state.items.find(cartItem => 
              cartItem.productSlug === item.product_slug && 
              cartItem.variantId?.toString() === item.variant_id?.toString()
            );
            originalPrice = cartItem?.originalPrice;
          }

          return {
            id: item.product_id.toString(),
            productSlug: item.product_slug,
            productName: item.product_name,
            productImage: item.image,
            name: item.product_name,
            price: item.price,
            originalPrice: originalPrice || undefined,
            quantity: item.quantity,
            image: item.image,
            categorySlug: item.category_slug,
            variantId: item.variant_id,
            variantName: item.variant_name,
            variantOptions: item.variant_combinations,
            weight: typeof item.weight === 'string' ? parseFloat(item.weight) : (item.weight || 0.1),
            weightUnit: item.weight_unit || 'kg',
          };
        });
        
        setCheckoutItems(items);
        setIsDirectBuy(sessionData.type === 'buy_now');
        setIsValidSession(true);
        setSessionLoading(false);
        
        // Track begin checkout only once
        if (!hasTrackedBeginCheckout.current) {
          hasTrackedBeginCheckout.current = true;
          const checkoutType = sessionData.type === 'buy_now' ? 'buy_now' : 'cart';
          const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          trackBeginCheckout({
            items: items.map(item => ({
              product: {
                id: parseInt(item.id),
                name: item.productName,
                price: item.price.toString(),
                sale_price: undefined,
                category: { name: item.categorySlug || 'Unknown' }
              } as any,
              quantity: item.quantity
            })),
            total,
            checkoutType,
            sessionId
          });
          
          // Track step 1 - checkout page loaded
          trackCheckoutStep({
            stepNumber: 1,
            stepName: 'checkout_page_loaded',
            sessionId,
            checkoutType,
            total,
            additionalData: {
              items_count: items.length,
              is_direct_buy: sessionData.type === 'buy_now'
            }
          });
          
          stepStartTimes.current['checkout_page_loaded'] = Date.now();
        }
        
      } catch (error) {
        console.error('Error validating session:', error);
        setIsValidSession(false);
        setSessionLoading(false);
        router.replace('/cart');
      }
    };

    if (sessionId) {
      validateSession();
    } else {
      router.replace('/cart');
    }
  }, [sessionId, router, isDirectBuy, state.items]);
  
  // Track page abandonment on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasTrackedBeginCheckout.current && !isProcessing) {
        // Determine current step based on form completion
        let currentStep = 'checkout_page_loaded';
        let stepNumber = 1;
        
        const fieldsCompleted = [];
        const fieldsIncomplete = [];
        
        if (formData.phone) fieldsCompleted.push('phone');
        else fieldsIncomplete.push('phone');
        
        if (formData.name) fieldsCompleted.push('name');
        else fieldsIncomplete.push('name');
        
        if (formData.address) fieldsCompleted.push('address');
        else fieldsIncomplete.push('address');
        
        if (formData.cityId) {
          fieldsCompleted.push('city');
          currentStep = 'city_selected';
          stepNumber = 2;
        } else {
          fieldsIncomplete.push('city');
        }
        
        if (formData.zoneId) {
          fieldsCompleted.push('zone');
          currentStep = 'zone_selected';
          stepNumber = 3;
        } else {
          fieldsIncomplete.push('zone');
        }
        
        if (formData.paymentMethod) {
          fieldsCompleted.push('paymentMethod');
          currentStep = 'payment_method_selected';
          stepNumber = 4;
        } else {
          fieldsIncomplete.push('paymentMethod');
        }
        
        trackCheckoutAbandonment({
          stepName: currentStep,
          stepNumber,
          sessionId,
          timeOnStep: Date.now() - (stepStartTimes.current[currentStep] || pageStartTime.current),
          fieldsCompleted,
          fieldsIncomplete,
          checkoutType: isDirectBuy ? 'buy_now' : 'cart'
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also track abandonment on component unmount
      handleBeforeUnload();
    };
  }, []);

  const [formData, setFormData] = useState<OrderData>({
    email: '',
    name: '',
    phone: '',
    address: '',
    cityId: null,
    zoneId: null,
    paymentMethod: 'pay_later',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    saveInfo: false,
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  
  // Track page abandonment on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasTrackedBeginCheckout.current && !isProcessing) {
        // Determine current step based on form completion
        let currentStep = 'checkout_page_loaded';
        let stepNumber = 1;
        
        const fieldsCompleted = [];
        const fieldsIncomplete = [];
        
        if (formData.phone) fieldsCompleted.push('phone');
        else fieldsIncomplete.push('phone');
        
        if (formData.name) fieldsCompleted.push('name');
        else fieldsIncomplete.push('name');
        
        if (formData.address) fieldsCompleted.push('address');
        else fieldsIncomplete.push('address');
        
        if (formData.cityId) {
          fieldsCompleted.push('city');
          currentStep = 'city_selected';
          stepNumber = 2;
        } else {
          fieldsIncomplete.push('city');
        }
        
        if (formData.zoneId) {
          fieldsCompleted.push('zone');
          currentStep = 'zone_selected';
          stepNumber = 3;
        } else {
          fieldsIncomplete.push('zone');
        }
        
        if (formData.paymentMethod) {
          fieldsCompleted.push('paymentMethod');
          currentStep = 'payment_method_selected';
          stepNumber = 4;
        } else {
          fieldsIncomplete.push('paymentMethod');
        }
        
        trackCheckoutAbandonment({
          stepName: currentStep,
          stepNumber,
          sessionId,
          timeOnStep: Date.now() - (stepStartTimes.current[currentStep] || pageStartTime.current),
          fieldsCompleted,
          fieldsIncomplete,
          checkoutType: isDirectBuy ? 'buy_now' : 'cart'
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also track abandonment on component unmount
      handleBeforeUnload();
    };
  }, [formData, isProcessing, sessionId, isDirectBuy]);
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    description: string;
  } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  const handleInputChange = (field: keyof OrderData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track field interaction
    const fieldName = field as string;
    if (['phone', 'name', 'address', 'email'].includes(fieldName)) {
      trackFieldInteraction({
        fieldName,
        fieldType: 'text',
        action: 'input',
        formName: 'checkout_form',
        sessionId,
        fieldValueLength: value ? value.toString().length : 0
      });
      
      // Update field interaction tracking
      fieldInteractions.current[fieldName] = {
        ...fieldInteractions.current[fieldName],
        filled: !!value
      };
    }
    
    // Clear error when user starts typing
    if (['phone','name','address','paymentMethod'].includes(field as string)) {
      const f = field as FormField;
      if (errors[f]) {
        setErrors(prev => ({ ...prev, [f]: undefined }));
        // Track error resolution
        trackFieldInteraction({
          fieldName,
          fieldType: 'text',
          action: 'valid',
          formName: 'checkout_form',
          sessionId
        });
      }
    }
  };
  
  // Handle city selection
  const handleCityChange = async (cityId: number, cityName: string) => {
    setFormData(prev => ({ 
      ...prev, 
      cityId, 
      city: cityName, 
      zoneId: null, 
      zone: '' 
    }));
    // Clear city/zone related errors on change
    setErrors(prev => ({ ...prev, city: undefined, zone: undefined }));
    
    // Track step progress
    trackCheckoutStep({
      stepNumber: 2,
      stepName: 'city_selected',
      sessionId,
      checkoutType: isDirectBuy ? 'buy_now' : 'cart',
      additionalData: {
        city_name: cityName,
        city_id: cityId
      }
    });
    
    // Clear zones and shipping fee
    setZones([]);
    setShippingFee(0);
    
    // Load zones for selected city
    setLoadingZones(true);
    try {
      const zonesData = await checkoutService.getZonesByCity(cityId);
      setZones(zonesData);
    } catch (error) {
      console.error('Error loading zones:', error);
      trackError({
        errorType: 'network',
        errorMessage: error instanceof Error ? error.message : 'Failed to load zones',
        formName: 'checkout_form',
        sessionId,
        userAction: 'city_selection'
      });
    } finally {
      setLoadingZones(false);
    }
  };
  
  // Handle zone selection and calculate shipping
  const handleZoneChange = async (zoneId: number, zoneName: string) => {
    // Update form data
    setFormData(prev => {
      const newFormData = { ...prev, zoneId, zone: zoneName };
      // Clear zone error on change
      setErrors(p => ({ ...p, zone: undefined }));
      
      // Track step progress and shipping selection
      const currentCity = cities.find(c => c.id === prev.cityId);
      trackCheckoutStep({
        stepNumber: 3,
        stepName: 'zone_selected',
        sessionId,
        checkoutType: isDirectBuy ? 'buy_now' : 'cart',
        additionalData: {
          city_name: currentCity?.name,
          zone_name: zoneName,
          zone_id: zoneId
        }
      });
      
      // Calculate shipping price with the current cityId
      if (prev.cityId && sessionId) {
        console.log('Calculating shipping for:', { cityId: prev.cityId, zoneId, sessionId });
        calculateShipping(prev.cityId, zoneId, sessionId);
      } else {
        console.log('Missing data for shipping calculation:', { cityId: prev.cityId, sessionId });
      }
      
      return newFormData;
    });
  };
  
  // Separate shipping calculation function
  const calculateShipping = async (cityId: number, zoneId: number, sessionId: string) => {
    setCalculatingShipping(true);
    try {
      console.log('Calculating shipping for:', { cityId, zoneId, sessionId });
      
      const shippingData = await checkoutService.calculateShippingPrice(sessionId, cityId, zoneId);
      console.log('Shipping API response:', shippingData);
      
      const shippingPrice = shippingData.price || 0;
      console.log('Setting shipping fee to:', shippingPrice);
      setShippingFee(shippingPrice);
      
      // Track shipping info
      const currentCity = cities.find(c => c.id === cityId);
      const currentZone = zones.find(z => z.id === zoneId);
      
      trackShippingInfo({
        shippingCost: shippingPrice,
        city: currentCity?.name,
        zone: currentZone?.name,
        sessionId,
        total: subtotal + shippingPrice
      });
      
    } catch (error) {
      console.error('Error calculating shipping:', error);
      trackError({
        errorType: 'network',
        errorMessage: error instanceof Error ? error.message : 'Failed to calculate shipping',
        formName: 'checkout_form',
        sessionId,
        userAction: 'shipping_calculation'
      });
    } finally {
      setCalculatingShipping(false);
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
    const newErrors: FieldErrors = {};

    // Required fields
  if (!formData.phone) newErrors.phone = ['Phone number is required'];
  if (!formData.name) newErrors.name = ['Full name is required'];
  if (!formData.address) newErrors.address = ['Address is required'];
  if (!formData.cityId) newErrors.city = ['Please select a city'];
  if (!formData.zoneId) newErrors.zone = ['Please select a zone'];
  if (!formData.paymentMethod) newErrors.paymentMethod = ['Please select a payment method'];

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
    
    // Track form submission attempt
    trackCheckoutStep({
      stepNumber: 5,
      stepName: 'confirm_order_clicked',
      sessionId,
      checkoutType: isDirectBuy ? 'buy_now' : 'cart',
      total,
      additionalData: {
        payment_method: formData.paymentMethod,
        has_agreed_terms: formData.agreeTerms,
        shipping_fee: shippingFee,
        fields_filled: Object.keys(formData).filter(key => {
          const value = formData[key as keyof OrderData];
          return value !== '' && value !== null && value !== false;
        })
      }
    });
    
    if (!validateForm()) {
      // Track validation errors
      const errorFields = Object.keys(errors);
      trackError({
        errorType: 'validation',
        errorMessage: `Form validation failed: ${errorFields.join(', ')}`,
        formName: 'checkout_form',
        sessionId,
        userAction: 'form_submission'
      });
      return;
    }

    // Ensure shipping fee has been calculated; backend requires shipping_amount
    if (!formData.cityId || !formData.zoneId) {
      toast.error('Please select city and zone to calculate shipping.');
      trackError({
        errorType: 'validation',
        errorMessage: 'Missing shipping information',
        formName: 'checkout_form',
        sessionId,
        userAction: 'form_submission'
      });
      return;
    }
    if (calculatingShipping) {
      toast.error('Please wait until shipping is calculated.');
      return;
    }
    if (Number.isNaN(shippingFee)) {
      toast.error('Invalid shipping amount. Please reselect your zone.');
      trackError({
        errorType: 'system',
        errorMessage: 'Invalid shipping calculation',
        formName: 'checkout_form',
        sessionId,
        userAction: 'form_submission'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order using the new backend service
      const orderData: CheckoutOrderData = {
        session_id: sessionId,
        customer: {
          email: formData.email || undefined,
          name: formData.name,
          phone: formData.phone,
        },
        address: formData.address,
        city_id: formData.cityId!,
        zone_id: formData.zoneId!,
        payment_method: formData.paymentMethod,
        shipping_amount: shippingFee,
        discount_code: appliedDiscount?.code,
        notes: undefined,
      };

    const response = await checkoutService.createOrder(orderData);
    const ordNum = response.order.order_number;
      
      // Track successful purchase
      trackPurchase({
        orderId: ordNum,
        total,
        items: checkoutItems.map(item => ({
          product: {
            id: parseInt(item.id),
            name: item.productName,
            price: item.price.toString(),
            sale_price: undefined,
            category: { name: item.categorySlug || 'Unknown' }
          } as any,
          quantity: item.quantity
        }))
      });
      
      // Track successful checkout completion
      trackCheckoutStep({
        stepNumber: 6,
        stepName: 'order_completed',
        sessionId,
        checkoutType: isDirectBuy ? 'buy_now' : 'cart',
        total,
        additionalData: {
          order_number: ordNum,
          payment_method: formData.paymentMethod,
          shipping_cost: shippingFee,
          processing_time: Date.now() - pageStartTime.current
        }
      });
      
      // Clear cart if not direct buy
      if (!isDirectBuy) {
        clearCart();
      }
      
  toast.success('Order created successfully!');
  // Navigate directly to persistent order confirmation page
  router.replace(`/checkout/confirmed/${ordNum}`);
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      // Laravel validation errors (422)
      if (error.response?.status === 422 && error.response.data?.errors) {
        const be: Record<string, string[]> = error.response.data.errors;
        const mapped: FieldErrors = {};
        if (be['customer.name']) mapped.name = be['customer.name'];
        if (be['customer.phone']) mapped.phone = be['customer.phone'];
        if (be['address']) mapped.address = be['address'];
        if (be['city_id']) mapped.city = be['city_id'];
        if (be['zone_id']) mapped.zone = be['zone_id'];
        if (be['payment_method']) mapped.paymentMethod = be['payment_method'];
        if (be['shipping_amount']) mapped.zone = [ ...(mapped.zone || []), ...be['shipping_amount'] ];
        if (be['session_id']) {
          toast.error(be['session_id'][0]);
        }
        setErrors(mapped);
        
        // Track field-specific validation errors
        Object.entries(mapped).forEach(([fieldName, fieldErrors]) => {
          if (fieldErrors && fieldErrors.length > 0) {
            trackFieldInteraction({
              fieldName,
              fieldType: 'text',
              action: 'error',
              formName: 'checkout_form',
              sessionId,
              errorMessage: fieldErrors[0]
            });
          }
        });
        
        // Scroll to first error field
        const firstField = ['phone','name','address','city','zone']
          .find(k => (mapped as any)[k] && (mapped as any)[k].length > 0);
        if (firstField) {
          // Optional: could focus specific input if we add refs
          console.log('First error at field:', firstField);
        }
      } else {
        let errorMessage = 'Failed to create order. Please try again.';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        toast.error(errorMessage);
        
        // Track general order creation error
        trackError({
          errorType: error.response?.status === 422 ? 'validation' : 'network',
          errorMessage,
          formName: 'checkout_form',
          sessionId,
          userAction: 'order_creation'
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // No need for cart redirect - session validation handles it
  // The session validation useEffect handles redirects

  // Calculate totals with server-side pricing (no subtotal calculation here since backend will handle it)
  const subtotal = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = shippingFee; // Use calculated shipping fee from API
  
  // Calculate discount amount using the service
  const discountAmount = appliedDiscount 
    ? checkoutService.calculateDiscount(appliedDiscount.code, subtotal)
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

  // Inline confirmation page removed; we redirect on success

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            {!isDirectBuy && (
              <Link href="/cart">
                <Button variant="outline" className="flex items-center gap-2 text-gray-800 border-gray-400">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Cart
                </Button>
              </Link>
            )}
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
					  Phone (11 digits)
					</label>
					<input
					  type="tel"
					  value={formData.phone}
					  onFocus={() => handleFieldFocus('phone', 'tel')}
					  onBlur={(e) => handleFieldBlur('phone', 'tel', e.target.value)}
					  onChange={(e) => {
						const value = e.target.value.replace(/\D/g, '').slice(0, 11);
						handleInputChange('phone', value);
					  }}
					  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors ${
						errors.phone ? 'border-red-500' : 'border-gray-300'
					  }`}
					  placeholder="01*********"
					  maxLength={11}
					/>
                    {renderErrorList(errors.phone)}
					<p className="text-xs text-gray-500 mt-2">
					  We may require your phone number for confirmations and delivery updates. Follow our
					  <a
						href="/help/terms-and-conditions"
						className="text-blue-600 underline hover:text-blue-700 transition-colors ml-1"
						target="_blank"
						rel="noopener noreferrer"
					  >
						Terms &amp; Conditions
					  </a>
					  .
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
                      value={formData.name}
                      onFocus={() => handleFieldFocus('name', 'text')}
                      onBlur={(e) => handleFieldBlur('name', 'text', e.target.value)}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Full Name"
                    />
                    {renderErrorList(errors.name)}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onFocus={() => handleFieldFocus('address', 'text')}
                      onBlur={(e) => handleFieldBlur('address', 'text', e.target.value)}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Address"
                    />
                    {renderErrorList(errors.address)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <SearchableSelect
                        value={formData.cityId || ''}
                        onValueChange={(value: string | number) => {
                          const cityId = typeof value === 'string' ? parseInt(value) : value;
                          const city = cities.find(c => c.id === cityId);
                          if (city) {
                            handleCityChange(cityId, city.name);
                          }
                        }}
                        options={cities.map(city => ({
                          value: city.id,
                          label: city.name
                        }))}
                        placeholder={loadingCities ? 'Loading cities...' : 'Search and select city'}
                        disabled={loadingCities}
                        error={!!(errors.city && errors.city.length)}
                        theme="light"
                      />
                      {renderErrorList(errors.city)}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                      <SearchableSelect
                        value={formData.zoneId || ''}
                        onValueChange={(value: string | number) => {
                          const zoneId = typeof value === 'string' ? parseInt(value) : value;
                          const zone = zones.find(z => z.id === zoneId);
                          if (zone) {
                            handleZoneChange(zoneId, zone.name);
                          }
                        }}
                        options={zones.map(zone => ({
                          value: zone.id,
                          label: zone.name
                        }))}
                        placeholder={
                          loadingZones ? 'Loading zones...' : 
                          !formData.cityId ? 'Select city first' : 
                          'Search and select zone'
                        }
                        disabled={loadingZones || !formData.cityId}
                        error={!!(errors.zone && errors.zone.length)}
                        theme="light"
                      />
                      {renderErrorList(errors.zone)}
                    </div>
                  </div>
                  

                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Payment <span className="text-red-500">*</span></h2>
                </div>
                <p className="text-sm text-gray-600 mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> All transactions are secure and encrypted.</p>
                
                <div className="space-y-3">
                  {/* bKash */}
                  {/* <div 
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
                  </div> */}

                  {/* Nagad */}
                  {/* <div 
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
                  </div> */}

                  {/* Pay Later */}
                  <div 
                    onClick={() => handlePaymentMethodSelect('pay_later')}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.paymentMethod === 'pay_later' 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'border-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">COD</div>
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
                  {renderErrorList(errors.paymentMethod)}
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
                    <button className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors">
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
                    href={getProductUrl({ category: { slug: item.categorySlug }, slug: item.productSlug })}
                    className="block transition-transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.productImage || '/placeholder-product.svg'}
                          alt={item.productName || 'Product image'}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors">{item.productName}</p>
                        {(item.variantId && item.variantOptions) && (
                          <p className="text-sm text-gray-600 mb-1">
                            {Object.entries(item.variantOptions).map(([key, value]) => `${key}: ${value}`).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          {/* Show original price if it exists and is higher than current price */}
                          {item.originalPrice && item.originalPrice > item.price && (
                            <p className="text-sm text-gray-400 line-through">
                              {formatCurrency(item.originalPrice * item.quantity)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
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
                      className="w-full px-4 py-3 pr-20 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
					<button 
                      onClick={handleApplyDiscount}
                      disabled={discountLoading || !discountCode.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1"
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
                  <span className="font-medium flex items-center gap-1">
                    {calculatingShipping ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      formatCurrency(shipping)
                    )}
                  </span>
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
                    className="mr-3 mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/help/terms-and-conditions" className="text-blue-600 underline hover:text-blue-700 transition-colors">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/help/privacy-policy" className="text-blue-600 underline hover:text-blue-700 transition-colors">Privacy Policy</a>
                    . I confirm that all information provided is accurate and complete.
                  </span>
                </label>
              </div>
              
              {/* Pay Now Button */}
              <Button
                onClick={handleSubmit}
                disabled={isProcessing || !formData.agreeTerms || !formData.paymentMethod}
                className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-colors"
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
              
              <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
