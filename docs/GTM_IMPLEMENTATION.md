# Google Tag Manager Implementation Guide

## Overview
This implementation provides a modern, Next.js 15+ optimized Google Tag Manager setup with TypeScript support and e-commerce tracking.

## Files Structure
```
src/
├── lib/gtm.ts                    # Core GTM utilities
├── components/GoogleTagManager.tsx  # Page view tracking component
├── hooks/useGTM.ts               # React hook for easy tracking
└── app/layout.tsx                # GTM script integration
```

## Setup Complete ✅

### 1. GTM ID Configuration
- **GTM Container ID**: `GTM-NV56QXPJ`
- Location: `/src/lib/gtm.ts`

### 2. Script Integration
- GTM script is loaded via Next.js `<Script>` component with `strategy="afterInteractive"`
- Noscript fallback included in `<body>`
- Automatic page view tracking on route changes

### 3. Available Tracking Functions

#### Using the `useGTM` Hook

```tsx
import { useGTM } from '@/hooks/useGTM';

function MyComponent() {
  const { 
    trackProductView, 
    trackAddToCart, 
    trackSearch, 
    trackPurchase,
    trackButtonClick,
    trackEvent 
  } = useGTM();

  // Track product view
  const handleProductView = (product: Product) => {
    trackProductView(product);
  };

  // Track add to cart
  const handleAddToCart = (product: Product, quantity: number) => {
    trackAddToCart(product, quantity);
  };

  // Track search
  const handleSearch = (searchTerm: string) => {
    trackSearch(searchTerm);
  };

  // Track button clicks
  const handleButtonClick = () => {
    trackButtonClick('newsletter_signup', 'footer');
  };

  // Track custom events
  const handleCustomEvent = () => {
    trackEvent('video_play', { video_title: 'Product Demo' });
  };
}
```

## E-commerce Events Implemented

### 1. Product View (`view_item`)
```tsx
trackProductView(product);
```

### 2. Add to Cart (`add_to_cart`)
```tsx
trackAddToCart(product, quantity);
```

### 3. Purchase (`purchase`)
```tsx
trackPurchase({
  orderId: "ORDER123",
  total: 299.99,
  items: [{ product, quantity: 1 }]
});
```

### 4. Search (`search`)
```tsx
trackSearch("smartphone cases");
```

## Implementation Examples

### Product Page
```tsx
// src/app/products/[slug]/page.tsx
import { useGTM } from '@/hooks/useGTM';

export default function ProductPage({ product }) {
  const { trackProductView } = useGTM();
  
  useEffect(() => {
    if (product) {
      trackProductView(product);
    }
  }, [product, trackProductView]);
}
```

### Cart Component
```tsx
// src/components/AddToCartButton.tsx
import { useGTM } from '@/hooks/useGTM';

export default function AddToCartButton({ product }) {
  const { trackAddToCart } = useGTM();
  
  const handleAddToCart = () => {
    // Your cart logic
    addToCart(product, 1);
    
    // Track the event
    trackAddToCart(product, 1);
  };
}
```

### Search Component
```tsx
// src/components/SearchBar.tsx
import { useGTM } from '@/hooks/useGTM';

export default function SearchBar() {
  const { trackSearch } = useGTM();
  
  const handleSearch = (searchTerm: string) => {
    // Your search logic
    performSearch(searchTerm);
    
    // Track the search
    trackSearch(searchTerm);
  };
}
```

### Checkout Completion
```tsx
// src/app/checkout/success/page.tsx
import { useGTM } from '@/hooks/useGTM';

export default function CheckoutSuccess({ orderData }) {
  const { trackPurchase } = useGTM();
  
  useEffect(() => {
    if (orderData) {
      trackPurchase({
        orderId: orderData.id,
        total: orderData.total,
        items: orderData.items
      });
    }
  }, [orderData, trackPurchase]);
}
```

## Data Layer Structure

The implementation automatically structures data according to Google Analytics 4 Enhanced Ecommerce format:

```javascript
// Product View Event
{
  event: 'view_item',
  currency: 'BDT',
  value: 29.99,
  items: [{
    item_id: '123',
    item_name: 'Smartphone Case',
    category: 'Electronics',
    price: 29.99
  }]
}

// Add to Cart Event
{
  event: 'add_to_cart',
  currency: 'BDT',
  value: 29.99,
  items: [{
    item_id: '123',
    item_name: 'Smartphone Case',
    category: 'Electronics',
    quantity: 1,
    price: 29.99
  }]
}

// Purchase Event
{
  event: 'purchase',
  transaction_id: 'ORDER123',
  value: 59.98,
  currency: 'BDT',
  items: [
    {
      item_id: '123',
      item_name: 'Smartphone Case',
      category: 'Electronics',
      quantity: 2,
      price: 29.99
    }
  ]
}
```

## Next Steps

1. **Configure GTM Container**: Set up your triggers and tags in GTM dashboard
2. **Test Implementation**: Use GTM Preview mode to verify events
3. **Add More Tracking**: Implement additional tracking in other components
4. **Connect GA4**: Link your GTM container to Google Analytics 4

## Testing

To test your GTM implementation:

1. Open GTM in Preview mode
2. Visit your website
3. Perform actions (view products, add to cart, search)
4. Verify events appear in the GTM debugger

## Security & Performance

- ✅ **Next.js Script Optimization**: Uses `strategy="afterInteractive"` for optimal performance
- ✅ **TypeScript Support**: Full type safety for all GTM functions
- ✅ **Error Handling**: Graceful fallbacks when GTM is not available
- ✅ **Client-Side Only**: No server-side rendering issues
- ✅ **Memory Efficient**: Automatic cleanup and optimization

Your GTM implementation is now complete and ready for production! 🎉