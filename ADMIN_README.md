# Horekmart Admin Dashboard

A comprehensive admin dashboard for the Horekmart multi-vendor eCommerce platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

### 🚀 **Core Features**
- **Modern Tech Stack**: Built with Next.js 15+ App Router, TypeScript, and Tailwind CSS
- **Authentication**: Token-based authentication with Laravel Sanctum support
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS
- **Data Management**: TanStack Query for efficient data fetching and caching
- **Type Safety**: Full TypeScript support with comprehensive type definitions

### 📊 **Dashboard Features**
- **Analytics Dashboard**: Revenue, orders, customers, and vendor statistics
- **Real-time Charts**: Interactive charts using Recharts library
- **Quick Actions**: Easy access to pending tasks and notifications

### 🛍️ **Product Management**
- **Product Catalog**: Complete CRUD operations for products
- **Bulk Operations**: Select and perform bulk actions on multiple products
- **Advanced Filtering**: Search, filter, and sort products by various criteria
- **Stock Management**: Track inventory levels with visual indicators
- **Category Management**: Organize products into categories

### 🏪 **Vendor Management**
- **Application Review**: Approve, reject, or suspend vendor applications
- **Document Verification**: Review and verify vendor documents
- **Vendor Dashboard**: Monitor vendor performance and status
- **Bulk Actions**: Process multiple vendor applications efficiently

### 📦 **Order Management**
- **Order Tracking**: View and manage all customer orders
- **Status Updates**: Update order and payment status
- **Customer Information**: Access customer details and shipping information
- **Vendor Assignment**: View which vendor fulfills each order

### ⚙️ **Settings Management**
- **General Settings**: Site information, currency, timezone configuration
- **Email Configuration**: SMTP settings for transactional emails
- **Payment Gateways**: Configure Stripe, PayPal, and other payment methods
- **Security Settings**: Authentication and security configurations

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Laravel backend API (optional for development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the environment template:
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# App Configuration  
NEXT_PUBLIC_APP_NAME=Horekmart Admin
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```

The admin dashboard will be available at:
- **Admin Login**: `http://localhost:3000/admin/login`
- **Admin Dashboard**: `http://localhost:3000/admin`

### 4. Demo Credentials
For testing purposes, you can use these demo credentials:
- **Email**: `admin@example.com`
- **Password**: `password123`

## Project Structure

```
src/
├── app/
│   └── admin/                 # Admin routes
│       ├── layout.tsx         # Admin layout with sidebar/topbar
│       ├── page.tsx           # Dashboard homepage
│       ├── login/             # Authentication
│       ├── products/          # Product management
│       ├── vendors/           # Vendor management
│       ├── orders/            # Order management
│       ├── customers/         # Customer management
│       └── settings/          # System settings
├── components/
│   ├── admin/                 # Admin-specific components
│   │   ├── AdminSidebar.tsx   # Navigation sidebar
│   │   └── AdminTopbar.tsx    # Header with user menu
│   └── ui/                    # Reusable UI components
├── hooks/
│   └── useAdminAuth.tsx       # Authentication context/hooks
├── lib/
│   ├── admin-api.ts           # API client for backend
│   ├── admin-query-provider.tsx # React Query provider
│   └── utils.ts               # Utility functions
└── types/
    ├── admin.ts               # Admin-related TypeScript types
    └── index.ts               # General types
```

## API Integration

### Backend Requirements
The admin dashboard expects a Laravel backend with the following endpoints:

#### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout  
- `GET /api/admin/profile` - Get admin profile
- `POST /api/admin/refresh` - Refresh token

#### Dashboard
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/sales` - Sales data for charts

#### Products
- `GET /api/admin/products` - List products with pagination/filters
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product

#### Vendors
- `GET /api/admin/vendors` - List vendors with filters
- `POST /api/admin/vendors/{id}/approve` - Approve vendor
- `POST /api/admin/vendors/{id}/reject` - Reject vendor
- `POST /api/admin/vendors/{id}/suspend` - Suspend vendor

#### Orders
- `GET /api/admin/orders` - List orders with filters
- `PATCH /api/admin/orders/{id}/status` - Update order status
- `PATCH /api/admin/orders/{id}/payment-status` - Update payment status

### Mock Data
For development and testing, the dashboard includes mock data that simulates API responses. This allows you to see the full functionality without needing a backend.

## Features in Detail

### Authentication System
- **Secure Token Storage**: JWT tokens stored in localStorage
- **Auto-redirect**: Automatic redirect to login for unauthenticated users
- **Route Protection**: All admin routes are protected by authentication middleware
- **Session Management**: Automatic token refresh and logout on expiry

### Data Management
- **Caching**: Intelligent caching with React Query
- **Optimistic Updates**: Immediate UI updates with rollback on failure
- **Background Refresh**: Automatic data refresh when tab becomes active
- **Error Handling**: Comprehensive error handling with user feedback

### UI/UX Features
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode Ready**: Components structured for easy dark mode implementation
- **Loading States**: Skeleton screens and loading indicators
- **Empty States**: Helpful empty state messages and call-to-actions

## Customization

### Styling
The dashboard uses Tailwind CSS for styling. You can customize:
- **Colors**: Modify the color palette in `tailwind.config.ts`
- **Components**: Update component styles in the `components/` directory
- **Layout**: Modify the admin layout in `app/admin/layout.tsx`

### Adding New Features
1. **Create Types**: Add TypeScript types in `types/admin.ts`
2. **Add API Methods**: Extend the API client in `lib/admin-api.ts`
3. **Create Components**: Build UI components in `components/admin/`
4. **Add Routes**: Create new pages in `app/admin/`

### Environment Variables
Available environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API base URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_URL`: Frontend application URL

## Development Guidelines

### Code Style
- **TypeScript**: Use strict TypeScript with proper typing
- **Components**: Prefer functional components with hooks
- **Naming**: Use descriptive, consistent naming conventions
- **Imports**: Use absolute imports with the `@/` alias

### Performance
- **Code Splitting**: Pages are automatically code-split by Next.js
- **Image Optimization**: Use Next.js Image component for images
- **Bundle Analysis**: Use `npm run build` to check bundle size

### Testing
- **Type Checking**: Run `npm run type-check` for TypeScript validation
- **Linting**: Use `npm run lint` for code quality checks
- **Build**: Test production build with `npm run build`

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=Your Marketplace Admin
NEXT_PUBLIC_APP_URL=https://your-admin-domain.com
```

## Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## Support

For support and questions:
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on the repository
- **API**: Ensure your Laravel backend implements the expected endpoints

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the Horekmart multi-vendor eCommerce platform**
