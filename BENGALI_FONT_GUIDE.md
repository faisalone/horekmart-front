# Bengali Font Integration Guide

## Overview
This project now includes comprehensive Bengali font support with automatic font detection. The system automatically applies the appropriate font based on text content:
- **Bengali text**: Uses Noto Sans Bengali font
- **English text**: Uses Quicksand font (default)
- **Mixed content**: Uses a combined font stack that supports both languages

## Setup

### 1. Font Configuration
The Bengali font (Noto Sans Bengali) is already configured in:
- `src/app/layout.tsx` - Font loading with Google Fonts
- `tailwind.config.ts` - Font family definitions
- `src/app/globals.css` - CSS variables and utility classes

### 2. Available Font Classes

#### CSS Classes
```css
.font-bengali          /* Pure Bengali font */
.font-mixed            /* Mixed Bengali + English support */
.font-quicksand        /* Default English font */
.auto-font             /* Auto-detection utility */
```

#### Bengali Text Utilities
```css
.bengali-text          /* Normal Bengali text styling */
.bengali-text-bold     /* Bold Bengali text styling */
```

## Usage

### 1. Auto Font Components

#### AutoFontText Component
Automatically detects text content and applies appropriate font:

```tsx
import { AutoFontText } from '@/components/AutoFontText';

// Automatically handles any text content
<AutoFontText className="text-lg font-bold">
  আমাদের দোকানে স্বাগতম
</AutoFontText>

// Works with mixed content
<AutoFontText className="text-base">
  Best Products - সেরা পণ্য
</AutoFontText>
```

#### SmartText Component
For direct text rendering with auto-detection:

```tsx
import { SmartText } from '@/components/AutoFontText';

<SmartText 
  text="আপনার প্রিয় পণ্য" 
  className="text-xl font-semibold"
  as="h2" 
/>
```

### 2. Utility Functions

```tsx
import { 
  containsBengali, 
  getTextFontClass, 
  getMixedFontClass, 
  getAutoFontClasses 
} from '@/utils/fontUtils';

// Check if text contains Bengali
const hasBengali = containsBengali('আমার নাম'); // true

// Get appropriate font class
const fontClass = getTextFontClass('Hello World'); // 'font-quicksand'
const fontClass2 = getTextFontClass('নমস্কার'); // 'font-bengali'

// Get mixed font support
const mixedClass = getMixedFontClass('Hello আমার নাম'); // 'font-mixed'

// Get complete class string with additional classes
const classes = getAutoFontClasses('আপনার নাম', 'text-lg font-bold');
```

### 3. Updated Components

The following components have been updated with Bengali font support:

- **BannerBlock**: Banner titles and buttons now support Bengali text
- **ProductCard**: Product names, categories, and vendor names use auto-font detection
- **Navbar**: Navigation items, cart text, and department names support Bengali
- **AutoFontText**: New reusable component for automatic font handling

## Examples

### Product Names
```tsx
// Product card with Bengali name
<AutoFontText className="text-base font-medium text-gray-900">
  স্মার্টফোন - Samsung Galaxy
</AutoFontText>
```

### Category Names
```tsx
// Navigation with Bengali categories
<AutoFontText>ইলেকট্রনিক্স</AutoFontText>
<AutoFontText>পোশাক ও আনুষাঙ্গিক</AutoFontText>
<AutoFontText>গৃহস্থালী পণ্য</AutoFontText>
```

### Mixed Content
```tsx
// Banner with mixed content
<AutoFontText className="text-lg font-bold text-white">
  Flash Sale - ফ্ল্যাশ সেল ৫০% ছাড়
</AutoFontText>
```

## Font Characteristics

### Noto Sans Bengali
- **Weight support**: 300, 400, 500, 600, 700
- **Features**: Proper Bengali character rendering, conjunct characters, matras
- **Display**: Optimized for web with font-display: swap
- **Performance**: Subset loading for faster initial render

### Font Fallbacks
The font stack ensures graceful degradation:
1. Custom variable font (--font-noto-bengali)
2. Noto Sans Bengali (Google Fonts)
3. System default fonts

## Best Practices

### 1. Always Use Auto Components
```tsx
// ✅ Good - Automatic font detection
<AutoFontText>{productName}</AutoFontText>

// ❌ Avoid - Manual font selection
<span className="font-bengali">{productName}</span>
```

### 2. Mixed Content Handling
```tsx
// ✅ Good - Single component handles both languages
<AutoFontText>
  Free Shipping - ফ্রি ডেলিভারি
</AutoFontText>

// ❌ Avoid - Splitting mixed content
<span className="font-quicksand">Free Shipping</span>
<span className="font-bengali"> - ফ্রি ডেলিভারি</span>
```

### 3. Performance Considerations
- The Bengali font is loaded with `font-display: swap` for better performance
- Auto-detection happens at render time with minimal overhead
- Font subsetting reduces initial bundle size

## Testing

To test Bengali font integration:

1. Add Bengali text to your components
2. Visit `/components/BengaliFontDemo` for live examples
3. Check mixed content rendering
4. Verify fallback fonts work correctly

## Common Bengali Phrases for E-commerce

```tsx
// Shopping related
'কেনাকাটা' // Shopping
'পণ্য' // Product
'দাম' // Price
'ছাড়' // Discount
'অফার' // Offer
'ডেলিভারি' // Delivery
'ফ্রি' // Free
'নতুন' // New
'জনপ্রিয়' // Popular
'বিশেষ অফার' // Special Offer
'আজকের অফার' // Today's Offer
'সেরা পণ্য' // Best Products
'ক্যাটাগরি' // Category
'ব্র্যান্ড' // Brand
'রিভিউ' // Review
'রেটিং' // Rating
'স্টক' // Stock
'অর্ডার' // Order
'কার্ট' // Cart
'চেকআউট' // Checkout
'পেমেন্ট' // Payment
'একাউন্ট' // Account
'লগইন' // Login
'রেজিস্টার' // Register
```

## Troubleshooting

### Font Not Loading
1. Check Google Fonts import in layout.tsx
2. Verify CSS variables in globals.css
3. Ensure Tailwind config includes font families

### Text Not Rendering Properly
1. Check if Bengali Unicode range is correct (\\u0980-\\u09FF)
2. Verify font-feature-settings for proper ligature support
3. Test with different font weights

### Performance Issues
1. Use font-display: swap for better loading experience
2. Consider preloading critical Bengali fonts
3. Implement font subsetting for production builds
