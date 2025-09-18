// Admin Dashboard Types

export interface AdminUser {
	id: string;
	email: string;
	name: string;
	phone?: string;
	role: 'super_admin' | 'admin' | 'moderator';
	avatar?: string;
	has_password: boolean;
	preferred_auth_method: 'email' | 'phone';
	created_at: string;
	updated_at: string;
}

export interface AuthTokens {
	access_token: string;
	token_type: 'Bearer';
	user?: AdminUser;
	requires_password_setup?: boolean;
}

export interface LoginCredentials {
	email: string;
	password: string;
	remember_me?: boolean;
}

// Multi-step auth types
export interface AuthStep {
	step:
		| 'identifier'
		| 'auth-method'
		| 'otp'
		| 'password'
		| 'set-password'
		| 'complete';
	data?: any;
}

export interface UserCheckResult {
	exists: boolean;
	type: 'email' | 'phone';
	identifier: string;
	user_id?: string;
	auth_methods: ('otp' | 'password')[];
	auth_method?: 'otp' | 'password';
	preferred_method?: 'email' | 'phone';
	requires_password_setup: boolean;
	requires_name: boolean;
	otp_sent?: boolean;
	expires_at?: string;
}

export interface OtpResult {
	success: boolean;
	message: string;
	expires_at?: string;
}

export interface AuthMethodSelection {
	method: 'otp' | 'password';
	identifier: string;
	type: 'email' | 'phone';
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
	thumb?: string | null; // Thumbnail field (matches backend API)
	images?: Array<{ id: string; url: string } | ProductImage | string>; // Support all formats for compatibility
	variants?: ProductVariant[];
	status: 'published' | 'draft' | 'archived'; // Updated to match API
	category_id: number; // Changed from string to number
	vendor_id: number; // Changed from string to number
	is_featured: boolean; // Changed from 'featured' to 'is_featured'
	social_links?: {
		facebook?: string[];
		instagram?: string[];
		youtube?: string[];
	} | null;
	weight?: number;
	weight_unit?: 'kg' | 'g';
	dimensions?: string;
	// SEO fields for admin management
	meta_title?: string;
	meta_description?: string;
	meta_keywords?: string;
	canonical_url?: string;
	og_title?: string;
	og_description?: string;
	focus_keyword?: string;
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

// Variation system types based on API documentation
export interface Variation {
	id: number;
	name: string;
	slug: string;
	created_at: string;
	updated_at: string;
	values?: VariationValue[];
}

export interface VariationValue {
	id: number;
	variation_id: number;
	name: string;
	slug: string;
	created_at: string;
	updated_at: string;
	variation?: Variation;
}

export interface ProductVariant {
	id: number;
	product_id: number;
	sku: string;
	price_override?: string | null;
	offer_price_override?: string | null;
	quantity: number;
	created_at: string;
	updated_at: string;
	variation_values: VariationValue[];
	combinations?: { [key: string]: string }; // For organized display like {Size: "Large", Color: "Red"}
}

// Legacy interface for backward compatibility
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
	image_url?: string | null; // Full URL for the image
	sort_order: number;
	is_active: boolean;
	products_count?: number;
	created_at: string;
	updated_at: string;
	parent?: Category; // Changed to full Category object
	children?: Category[];
}

export interface Order {
	id: number;
	order_number: string;
	status:
		| 'pending'
		| 'processing'
		| 'shipped'
		| 'delivered'
		| 'cancelled'
		| 'refunded';
	payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
	payment_method?: string;
	subtotal: number;
	discount_amount: number;
	total_amount: number;
	items?: OrderItem[];
	shipping?: {
		address: string;
		city_id: number | null;
		zone_id: number | null;
		shipping_amount: number;
		status: string;
		consignment_id?: string | null;
		city?: {
			id: number;
			name: string;
		} | null;
		zone?: {
			id: number;
			name: string;
		} | null;
	};
	created_at: string;
	updated_at: string;
	customer?: {
		id: number;
		name: string;
		phone: string;
	};
	items_count?: number;
}

export interface OrderItem {
	id: string;
	product_id: string;
	variant_id?: string;
	quantity: number;
	price: number; // Backend uses 'price' for unit price
	total: number; // Backend uses 'total' for total price
	product_name: string;
	product_sku: string;
	product_variants?: any;
	product?: Pick<Product, 'id' | 'name' | 'image'>;
}

export interface OrderShippingAddress {
	address: string;
	city: string;
	zip_code: string;
	country: string;
}

export interface OrderBillingAddress {
	name: string;
	email?: string;
	phone: string;
	address: string;
	city: string;
	zip_code: string;
	country: string;
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

// Social Media Types
export interface SocialMediaPost {
	platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
	caption: string;
	images: string[];
	scheduled_at?: string;
}

export interface SocialMediaTokenStatus {
	facebook?: { status: string; expires_at?: string };
	instagram?: { status: string; expires_at?: string };
	twitter?: { status: string; expires_at?: string };
	linkedin?: { status: string; expires_at?: string };
}

export interface SocialMediaCaption {
	caption: string;
	platform: string;
	hashtags?: string[];
}

export interface SocialMediaPostResult {
	success: boolean;
	message?: string;
	post_id?: string;
	post_url?: string;
	platform: string;
	scheduled_at?: string;
	error?: string;
}

export interface SocialMediaPostResponse {
	success: boolean;
	message: string;
	execution_time: string;
	results: Record<string, SocialMediaPostResult> | SocialMediaPostResult[];
	product_id?: number | string;
	summary?: {
		total_platforms: number;
		successful_posts: number;
		failed_posts: number;
		platforms_attempted: string[];
	};
}

// Site Settings Types
export interface SiteSetting {
	id: number;
	key: string;
	value: string | null;
	type: 'string' | 'text' | 'boolean' | 'integer' | 'json';
	group: string;
	description?: string;
	is_public: boolean;
	created_at: string;
	updated_at: string;
}

export interface GroupedSiteSettings {
	[group: string]: SiteSetting[];
}

export interface SiteSettingCreateRequest {
	key: string;
	value: string | null;
	type: 'string' | 'text' | 'boolean' | 'integer' | 'json';
	group: string;
	description?: string;
	is_public: boolean;
}

export interface SiteSettingUpdateRequest {
	value?: string | null;
	type?: 'string' | 'text' | 'boolean' | 'integer' | 'json';
	group?: string;
	description?: string;
	is_public?: boolean;
}

export interface SiteSettingBulkUpdateRequest {
	settings: Array<{
		key: string;
		value: string | null;
	}>;
}

// Asset Upload Types
export interface AssetUploadOptions {
	path?: string;
	disk?: 'local' | 'public' | 's3';
}

export interface Asset {
	id: string;
	disk: string;
	path: string;
	url: string | null; // null for local/private storage
	name: string;
	size: number;
	mime_type: string;
	extension: string;
	metadata?: any;
	created_at?: string;
	updated_at?: string;
}
