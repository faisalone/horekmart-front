import { FilterConfig } from '@/components/admin/Filters';

// Products page filter configuration
export const productsFilterConfig: FilterConfig = {
	title: 'Filters',
	description: 'Filter and search products in real-time',
	fields: [
		{
			key: 'search',
			type: 'search',
			placeholder: 'Search products...',
		},
		{
			key: 'status',
			type: 'select',
			label: 'Status',
			placeholder: 'All Status',
			options: [
				{ value: 'draft', label: 'Draft' },
				{ value: 'published', label: 'Published' },
				{ value: 'inactive', label: 'Inactive' },
			],
		},
		{
			key: 'category_id',
			type: 'select',
			label: 'Category',
			placeholder: 'All Categories',
			options: [], // This will be populated dynamically
		},
		{
			key: 'vendor_id',
			type: 'select',
			label: 'Vendor',
			placeholder: 'All Vendors',
			options: [], // This will be populated dynamically
		},
		{
			key: 'sort',
			type: 'sort',
			label: 'Sort By',
			placeholder: 'Sort by...',
			options: [
				{ value: 'created_at_desc', label: 'Newest First' },
				{ value: 'created_at_asc', label: 'Oldest First' },
				{ value: 'name_asc', label: 'Name A-Z' },
				{ value: 'name_desc', label: 'Name Z-A' },
				{ value: 'price_desc', label: 'Price High to Low' },
				{ value: 'price_asc', label: 'Price Low to High' },
				{ value: 'stock_quantity_desc', label: 'Stock High to Low' },
				{ value: 'stock_quantity_asc', label: 'Stock Low to High' },
			],
		},
		{
			key: 'clear',
			type: 'toggle',
		},
	],
	showToggle: true,
	gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
};

// Vendors page filter configuration
export const vendorsFilterConfig: FilterConfig = {
	title: 'Filters',
	description: 'Filter and search vendors',
	fields: [
		{
			key: 'search',
			type: 'search',
			placeholder: 'Search vendors...',
		},
		{
			key: 'status',
			type: 'select',
			label: 'Status',
			placeholder: 'All Status',
			options: [
				{ value: 'pending', label: 'Pending' },
				{ value: 'approved', label: 'Approved' },
				{ value: 'rejected', label: 'Rejected' },
				{ value: 'suspended', label: 'Suspended' },
			],
		},
		{
			key: 'sort',
			type: 'sort',
			label: 'Sort By',
			placeholder: 'Sort by...',
			options: [
				{ value: 'created_at_desc', label: 'Newest First' },
				{ value: 'created_at_asc', label: 'Oldest First' },
				{ value: 'business_name_asc', label: 'Business Name A-Z' },
				{ value: 'business_name_desc', label: 'Business Name Z-A' },
				{ value: 'name_asc', label: 'Name A-Z' },
				{ value: 'name_desc', label: 'Name Z-A' },
			],
		},
		{
			key: 'clear',
			type: 'toggle',
		},
	],
	showToggle: false,
	gridCols: 'grid-cols-1 md:grid-cols-3',
};

// Categories page filter configuration
export const categoriesFilterConfig: FilterConfig = {
	title: 'Filters',
	description: 'Filter and search categories',
	fields: [
		{
			key: 'search',
			type: 'search',
			placeholder: 'Search categories...',
		},
		{
			key: 'is_active',
			type: 'select',
			label: 'Status',
			placeholder: 'All Status',
			options: [
				{ value: 'true', label: 'Active' },
				{ value: 'false', label: 'Inactive' },
			],
		},
		{
			key: 'parent_id',
			type: 'select',
			label: 'Type',
			placeholder: 'All Categories',
			options: [
				{ value: 'null', label: 'Root Categories' },
				{ value: 'has_parent', label: 'Subcategories' },
			],
		},
		{
			key: 'sort',
			type: 'sort',
			label: 'Sort By',
			placeholder: 'Sort by...',
			options: [
				{ value: 'sort_order_asc', label: 'Sort Order' },
				{ value: 'name_asc', label: 'Name A-Z' },
				{ value: 'name_desc', label: 'Name Z-A' },
				{ value: 'created_at_desc', label: 'Newest First' },
				{ value: 'created_at_asc', label: 'Oldest First' },
			],
		},
		{
			key: 'clear',
			type: 'toggle',
		},
	],
	showToggle: false,
	gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

// Variants page filter configuration (if exists)
export const variantsFilterConfig: FilterConfig = {
	title: 'Filters',
	description: 'Filter and search product variants',
	fields: [
		{
			key: 'search',
			type: 'search',
			placeholder: 'Search variants...',
		},
		{
			key: 'product_id',
			type: 'select',
			label: 'Product',
			placeholder: 'All Products',
			options: [], // This will be populated dynamically
		},
		{
			key: 'status',
			type: 'select',
			label: 'Status',
			placeholder: 'All Status',
			options: [
				{ value: 'active', label: 'Active' },
				{ value: 'inactive', label: 'Inactive' },
			],
		},
		{
			key: 'sort',
			type: 'sort',
			label: 'Sort By',
			placeholder: 'Sort by...',
			options: [
				{ value: 'created_at_desc', label: 'Newest First' },
				{ value: 'created_at_asc', label: 'Oldest First' },
				{ value: 'name_asc', label: 'Name A-Z' },
				{ value: 'name_desc', label: 'Name Z-A' },
				{ value: 'price_desc', label: 'Price High to Low' },
				{ value: 'price_asc', label: 'Price Low to High' },
			],
		},
		{
			key: 'clear',
			type: 'toggle',
		},
	],
	showToggle: false,
	gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

// Orders page filter configuration
export const ordersFilterConfig: FilterConfig = {
	title: 'Filters',
	description: 'Filter and search orders',
	fields: [
		{
			key: 'search',
			type: 'search',
			placeholder: 'Search orders by ID, customer...',
		},
		{
			key: 'status',
			type: 'select',
			label: 'Status',
			placeholder: 'All Status',
			options: [
				{ value: 'pending', label: 'Pending' },
				{ value: 'processing', label: 'Processing' },
				{ value: 'shipped', label: 'Shipped' },
				{ value: 'delivered', label: 'Delivered' },
				{ value: 'cancelled', label: 'Cancelled' },
				{ value: 'refunded', label: 'Refunded' },
			],
		},
		{
			key: 'payment_status',
			type: 'select',
			label: 'Payment',
			placeholder: 'All Payments',
			options: [
				{ value: 'pending', label: 'Pending' },
				{ value: 'paid', label: 'Paid' },
				{ value: 'failed', label: 'Failed' },
				{ value: 'refunded', label: 'Refunded' },
			],
		},
		{
			key: 'vendor_id',
			type: 'select',
			label: 'Vendor',
			placeholder: 'All Vendors',
			options: [], // This will be populated dynamically
		},
		{
			key: 'sort',
			type: 'sort',
			label: 'Sort By',
			placeholder: 'Sort by...',
			options: [
				{ value: 'created_at_desc', label: 'Newest First' },
				{ value: 'created_at_asc', label: 'Oldest First' },
				{ value: 'total_amount_desc', label: 'Amount High to Low' },
				{ value: 'total_amount_asc', label: 'Amount Low to High' },
			],
		},
		{
			key: 'clear',
			type: 'toggle',
		},
	],
	showToggle: true,
	gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
};

// Users/Customers page filter configuration
export const usersFilterConfig: FilterConfig = {
	title: 'Filters',
	description: 'Filter and search users',
	fields: [
		{
			key: 'search',
			type: 'search',
			placeholder: 'Search users by name, email...',
		},
		{
			key: 'status',
			type: 'select',
			label: 'Status',
			placeholder: 'All Status',
			options: [
				{ value: 'active', label: 'Active' },
				{ value: 'inactive', label: 'Inactive' },
				{ value: 'suspended', label: 'Suspended' },
			],
		},
		{
			key: 'role',
			type: 'select',
			label: 'Role',
			placeholder: 'All Roles',
			options: [
				{ value: 'customer', label: 'Customer' },
				{ value: 'vendor', label: 'Vendor' },
				{ value: 'admin', label: 'Admin' },
			],
		},
		{
			key: 'sort',
			type: 'sort',
			label: 'Sort By',
			placeholder: 'Sort by...',
			options: [
				{ value: 'created_at_desc', label: 'Newest First' },
				{ value: 'created_at_asc', label: 'Oldest First' },
				{ value: 'name_asc', label: 'Name A-Z' },
				{ value: 'name_desc', label: 'Name Z-A' },
				{ value: 'email_asc', label: 'Email A-Z' },
				{ value: 'email_desc', label: 'Email Z-A' },
			],
		},
		{
			key: 'clear',
			type: 'toggle',
		},
	],
	showToggle: false,
	gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

// Helper function to get filter config by page name
export function getFilterConfig(pageName: string): FilterConfig {
	switch (pageName) {
		case 'products':
			return productsFilterConfig;
		case 'vendors':
			return vendorsFilterConfig;
		case 'categories':
			return categoriesFilterConfig;
		case 'variants':
			return variantsFilterConfig;
		case 'orders':
			return ordersFilterConfig;
		case 'users':
			return usersFilterConfig;
		default:
			return productsFilterConfig; // Default fallback
	}
}

// Helper function to update filter config options dynamically
export function updateFilterConfigOptions(
	config: FilterConfig,
	fieldKey: string,
	options: { value: string; label: string }[]
): FilterConfig {
	return {
		...config,
		fields: config.fields.map((field) =>
			field.key === fieldKey
				? {
						...field,
						options: options,
				  }
				: field
		),
	};
}
