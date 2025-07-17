# Horekmart Backend API

Laravel backend API for the Horekmart multi-vendor eCommerce platform.

## Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── Admin/
│   │   │           ├── AuthController.php
│   │   │           ├── DashboardController.php
│   │   │           ├── ProductController.php
│   │   │           ├── VendorController.php
│   │   │           └── OrderController.php
│   │   └── Middleware/
│   │       └── AdminMiddleware.php
│   └── Models/
│       ├── User.php
│       ├── Product.php
│       ├── Category.php
│       ├── Vendor.php
│       ├── Order.php
│       └── OrderItem.php
├── database/
│   ├── migrations/
│   └── seeders/
│       └── AdminUserSeeder.php
├── routes/
│   ├── api.php
│   └── admin.php
└── config/
    ├── cors.php
    └── sanctum.php
```

## Features

### 🔐 Authentication & Authorization
- Laravel Sanctum for API authentication
- Role-based access control with Spatie Permissions
- Admin, Super Admin, and Moderator roles
- Protected admin routes

### 📊 Admin Dashboard API
- Dashboard statistics (revenue, orders, customers, vendors)
- Sales charts data
- Recent activities
- Real-time metrics

### 🛍️ Product Management API
- CRUD operations for products
- Advanced filtering and search
- Bulk operations
- Category and vendor relationships
- Stock management
- Featured products

### 🏪 Vendor Management API  
- Vendor application processing
- Approve/reject/suspend vendors
- Document verification
- Performance tracking

### 📦 Order Management API
- Order tracking and status updates
- Payment status management
- Customer information access
- Multi-vendor order support

## Database Schema

### Tables Created
- `users` - Customer and admin users
- `vendors` - Vendor applications and data
- `categories` - Product categories (hierarchical)
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `roles` & `permissions` - Access control (Spatie)

## API Endpoints

### Authentication
```
POST /api/admin/login              - Admin login
POST /api/admin/logout             - Admin logout
GET  /api/admin/profile            - Get admin profile
POST /api/admin/refresh            - Refresh token
```

### Dashboard
```
GET  /api/admin/dashboard/stats    - Dashboard statistics
GET  /api/admin/dashboard/sales    - Sales chart data
GET  /api/admin/dashboard/activities - Recent activities
```

### Products
```
GET    /api/admin/products         - List products
POST   /api/admin/products         - Create product
GET    /api/admin/products/{id}    - Get product
PUT    /api/admin/products/{id}    - Update product
DELETE /api/admin/products/{id}    - Delete product
POST   /api/admin/products/bulk-action - Bulk actions
POST   /api/admin/products/{id}/toggle-featured - Toggle featured
```

### Vendors
```
GET    /api/admin/vendors          - List vendors
POST   /api/admin/vendors          - Create vendor
GET    /api/admin/vendors/{id}     - Get vendor
PUT    /api/admin/vendors/{id}     - Update vendor
DELETE /api/admin/vendors/{id}     - Delete vendor
POST   /api/admin/vendors/{id}/approve - Approve vendor
POST   /api/admin/vendors/{id}/reject  - Reject vendor
POST   /api/admin/vendors/{id}/suspend - Suspend vendor
POST   /api/admin/vendors/bulk-action  - Bulk actions
```

### Orders
```
GET    /api/admin/orders           - List orders
GET    /api/admin/orders/{id}      - Get order
PATCH  /api/admin/orders/{id}/status - Update order status
PATCH  /api/admin/orders/{id}/payment-status - Update payment status
```

## Setup Instructions

### 1. Prerequisites
- PHP 8.1+
- Composer
- SQLite (included) or MySQL/PostgreSQL

### 2. Installation
The backend is already installed in the `backend/` directory.

### 3. Configuration
Environment variables are configured in `.env`:
```
APP_NAME="Horekmart Admin API"
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
```

### 4. Database Setup
Database is already migrated and seeded with:
```bash
php artisan migrate:fresh --seed
```

### 5. Admin Credentials
Default admin accounts created:
- **Super Admin**: admin@example.com / password123
- **Moderator**: moderator@example.com / password123

### 6. Start the Server
```bash
cd backend
php artisan serve
```
API will be available at: `http://localhost:8000`

### 7. Test API
Test admin login:
```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

## CORS Configuration
CORS is configured to allow requests from:
- `http://localhost:3000` (Next.js frontend)

## Security Features
- API token authentication
- Role-based permissions
- Admin-only route protection
- Request validation
- SQL injection prevention

## Development

### Adding New Endpoints
1. Create controller: `php artisan make:controller Api/Admin/NewController`
2. Add routes in `routes/admin.php`
3. Add middleware protection
4. Test with authentication

### Database Changes
1. Create migration: `php artisan make:migration create_new_table`
2. Run migration: `php artisan migrate`
3. Update models and relationships

### Testing
- Use Postman or curl to test API endpoints
- Include Authorization header: `Bearer {token}`
- All admin routes require authentication

## Integration with Frontend

The frontend should make API calls to:
- Base URL: `http://localhost:8000/api`
- Authentication: Include `Authorization: Bearer {token}` header
- CORS: Already configured for localhost:3000

Example frontend API client configuration:
```javascript
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});
```

## Troubleshooting

### Common Issues
1. **CORS errors**: Check `config/cors.php` configuration
2. **Authentication errors**: Verify token in Authorization header
3. **Database errors**: Run `php artisan migrate:fresh --seed`
4. **Permission errors**: Check user roles and permissions

### Logs
Check Laravel logs: `storage/logs/laravel.log`

## Next Steps

1. **File Upload**: Add image upload functionality for products
2. **Email System**: Configure SMTP for notifications
3. **Payment Integration**: Add Stripe/PayPal webhook handlers
4. **Analytics**: Expand dashboard metrics
5. **API Documentation**: Generate Swagger/OpenAPI docs
6. **Testing**: Add unit and feature tests
7. **Caching**: Implement Redis caching
8. **Queue System**: Add background job processing

## License
MIT License
