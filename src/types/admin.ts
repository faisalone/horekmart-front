// Admin Dashboard Types

export interface AdminUser {
	id: string;
	email: string;
	name: string;
	role: 'super_admin' | 'admin' | 'moderator';
	avatar?: string;
	created_at: string;
	updated_at: string;
}

export interface AuthTokens {
	access_token: string;
	token_type: 'Bearer';
	user?: AdminUser;
}

export interface LoginCredentials {
	email: string;
	password: string;
	remember_me?: boolean;
}

export interface Vendor {
	id: number; // Changed from string to number
	name: string;
	email: string;
	business_name: string;
	business_registration_number?: string | null;
	description?: string;
	phone: string;
	address: string; // Added missing fields from API
	city: string;
	state: string;
	country: string;
	postal_code: string;
	status: 'pending' | 'approved' | 'rejected' | 'suspended';
	documents?: string | null;
	approved_at?: string | null;
	approved_by?: number | null;
	commission_rate: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface VendorDocument {
	id: string;
	type: 'business_license' | 'tax_certificate' | 'identity_proof';
	url: string;
	verified: boolean;
}

export interface Product {
	id: number; // Changed from string to number
	name: string;
	slug: string; // Added slug field
	description: string;
	short_description?: string;
	price: string; // Changed from number to string to match API
	sale_price?: string | null; // Changed from number to string
	sku: string;
	stock_quantity: number;
	in_stock: boolean;
	image?: string | null;
	thumbnail?: string | null; // Added thumbnail field
	images?: ProductImage[];
	variants?: ProductVariant[];
	status: 'published' | 'draft' | 'inactive'; // Updated to match API
	category_id: number; // Changed from string to number
	vendor_id: number; // Changed from string to number
	is_featured: boolean; // Changed from 'featured' to 'is_featured'
	weight?: number;
	dimensions?: string;
	meta_title?: string;
	meta_description?: string;
	created_at: string;
	updated_at: string;
	vendor?: Vendor; // Changed to full Vendor object
	category?: Category; // Changed to full Category object
}

export interface ProductImage {
	id: number;
	product_id: number;
	file_name: string;
	file_path: string;
	file_url: string;
	mime_type: string;
	file_size: number;
	width: number;
	height: number;
	alt_text?: string;
	sort_order: number;
	created_at: string;
	updated_at: string;
}

export interface ProductVariant {
	id: string;
	name: string;
	value: string;
	price: number;
	price_adjustment: number;
	stock_quantity: number;
	sku: string;
	attributes: VariantAttribute[];
}

export interface VariantAttribute {
	name: string;
	value: string;
}

export interface Category {
	id: number; // Changed from string to number
	name: string;
	slug: string;
	description?: string;
	parent_id?: number | null; // Changed from string to number
	image?: string | null;
	sort_order: number;
	is_active: boolean;
	products_count?: number;
	created_at: string;
	updated_at: string;
	parent?: Category; // Changed to full Category object
	children?: Category[];
}

export interface Order {
	id: string;
	order_number: string;
	customer_id: string;
	vendor_id: string;
	status:
		| 'pending'
		| 'processing'
		| 'shipped'
		| 'delivered'
		| 'cancelled'
		| 'refunded';
	payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
	total_amount: number;
	shipping_amount: number;
	tax_amount: number;
	items: OrderItem[];
	shipping_address: Address;
	billing_address: Address;
	created_at: string;
	updated_at: string;
	customer?: Pick<Customer, 'id' | 'name' | 'email'>;
	vendor?: Pick<Vendor, 'id' | 'business_name'>;
}

export interface OrderItem {
	id: string;
	product_id: string;
	variant_id?: string;
	quantity: number;
	unit_price: number;
	total_price: number;
	product?: Pick<Product, 'id' | 'name' | 'image'>;
}

export interface Customer {
	id: string;
	name: string;
	email: string;
	phone?: string;
	avatar?: string;
	status: 'active' | 'inactive' | 'banned';
	email_verified_at?: string;
	created_at: string;
	updated_at: string;
}

export interface Address {
	id: string;
	first_name: string;
	last_name: string;
	company?: string;
	address_line_1: string;
	address_line_2?: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
	phone?: string;
}

// Dashboard Analytics Types
export interface DashboardStats {
	total_revenue: number;
	revenue_change: number; // percentage change
	total_orders: number;
	orders_change: number;
	total_customers: number;
	customers_change: number;
	total_vendors: number;
	vendors_change: number;
	pending_vendor_approvals: number;
}

export interface SalesData {
	date: string;
	revenue: number;
	orders: number;
}

export interface TopProduct {
	id: string;
	name: string;
	sales: number;
	revenue: number;
}

export interface TopVendor {
	id: string;
	business_name: string;
	sales: number;
	revenue: number;
}

// API Response Types
export interface ApiResponse<T> {
	data: T;
	message?: string;
	status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
		from: number;
		to: number;
	};
	links: {
		first: string;
		last: string;
		prev: string | null;
		next: string | null;
	};
}

// Table/Filter Types
export interface TableFilter {
	search?: string;
	status?: string;
	category_id?: string;
	vendor_id?: string;
	date_from?: string;
	date_to?: string;
	sort_by?: string;
	sort_order?: 'asc' | 'desc';
	page?: number;
	per_page?: number;
}

export interface BulkAction {
	action: 'delete' | 'approve' | 'reject' | 'activate' | 'deactivate';
	ids: string[];
}

// Settings Types
export interface GeneralSettings {
	site_name: string;
	site_description: string;
	site_logo?: string;
	site_favicon?: string;
	admin_email: string;
	default_currency: string;
	default_timezone: string;
	maintenance_mode: boolean;
}

export interface EmailSettings {
	smtp_host: string;
	smtp_port: number;
	smtp_username: string;
	smtp_password: string;
	smtp_encryption: 'tls' | 'ssl' | 'none';
	from_email: string;
	from_name: string;
}

export interface PaymentSettings {
	stripe_publishable_key?: string;
	stripe_secret_key?: string;
	paypal_client_id?: string;
	paypal_client_secret?: string;
	payment_methods: ('stripe' | 'paypal' | 'bank_transfer')[];
}

// Navigation Types
export interface AdminMenuItem {
	title: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	children?: AdminMenuItem[];
	badge?: number;
}

// Form Types
export interface FormErrors {
	[key: string]: string[];
}

export interface ValidationError {
	field: string;
	message: string;
}
