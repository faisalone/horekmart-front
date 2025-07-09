# Modern eCommerce Frontend

A beautiful, scalable eCommerce frontend built with Next.js 14+ App Router, TypeScript, and Tailwind CSS. Designed to be similar to large-scale platforms like Walmart or Target.

## Features

- 🛍️ **Product Catalog**: Browse products with filtering, search, and sorting
- 🛒 **Shopping Cart**: Add products with variant selection and quantity management
- ❤️ **Wishlist**: Save favorite products for later
- 📱 **Responsive Design**: Mobile-first approach with beautiful UI
- 🎨 **Modern UI**: Clean design with Tailwind CSS and Lucide icons
- 🔧 **TypeScript**: Fully type-safe with comprehensive interfaces
- ⚡ **Performance**: Optimized with Next.js App Router and React Server Components

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React & Heroicons
- **State Management**: React Hooks
- **Data**: Mock data (ready for API integration)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with Navbar/Footer
│   ├── page.tsx           # Homepage
│   ├── products/          # Product pages
│   └── cart/              # Shopping cart
├── components/            # Reusable UI components
│   ├── ui/                # Base UI components
│   ├── Navbar.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   ├── ProductCard.tsx    # Product display card
│   └── ProductGrid.tsx    # Product grid layout
├── lib/                   # Utility functions
│   ├── utils.ts           # Helper functions
│   └── mock-data.ts       # Sample product data
└── types/                 # TypeScript type definitions
    └── index.ts           # Core interfaces
```

## Key Components

### UI Components
- **Button**: Customizable button with variants (primary, secondary, outline, ghost)
- **Badge**: Status indicators for products (sale, new, etc.)
- **QuantitySelector**: +/- controls for item quantities
- **VariantSelector**: Choose product options (size, color, etc.)
- **ImageGallery**: Product image carousel with thumbnails

### Layout Components
- **Navbar**: Responsive navigation with search, cart, and wishlist
- **Footer**: Site links and company information
- **ProductCard**: Displays product info with quick actions
- **ProductGrid**: Responsive grid layout for product listings

## Pages

- **Homepage** (`/`): Hero section, categories, featured products
- **Products** (`/products`): Full product catalog with filters
- **Product Detail** (`/products/[id]`): Individual product page
- **Shopping Cart** (`/cart`): Cart management and checkout prep

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Mock Data

The project includes comprehensive mock data for:
- Products with variants, pricing, and inventory
- Categories and subcategories
- User reviews and ratings

### Future Enhancements

- User authentication and profiles
- Checkout and payment processing
- Order management and tracking
- Product reviews and ratings
- Search functionality
- API integration with backend services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
