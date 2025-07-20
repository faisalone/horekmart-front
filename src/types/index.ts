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

export interface Product {
	id: number;
	name: string;
	slug: string;
	description: string;
	sku: string;
	price: string;
	sale_price?: string | null;
	stock_quantity: number;
	in_stock: boolean;
	image?: string | null;
	thumbnail?: string | null;
	images?: ProductImage[];
	status: string;
	category_id: number;
	vendor_id: number;
	is_featured: boolean;
	weight?: number | string;
	weight_unit?: 'kg' | 'g' | 'lb' | 'oz';
	created_at: string;
	updated_at: string;
	category?: Category;
	vendor?: Vendor;
	// Legacy properties for compatibility
	salePrice?: number;
	inStock?: boolean;
}

export interface ProductVariant {
	id: string;
	type: 'color' | 'size' | 'material' | 'style';
	name: string;
	value: string;
	available: boolean;
	priceAdjustment?: number;
	image?: string;
}

// API Response variant structure
export interface ApiProductVariant {
	id: number;
	sku: string;
	price_override?: string | null;
	offer_price_override?: string | null;
	final_price: string;
	final_offer_price?: string | null;
	quantity: number;
	combinations: Record<
		string,
		Array<{
			id: number;
			variation_id: number;
			name: string;
			slug: string;
			created_at: string;
			updated_at: string;
			pivot: {
				product_variant_id: number;
				variation_value_id: number;
			};
			variation: {
				id: number;
				name: string;
				slug: string;
				created_at: string;
				updated_at: string;
			};
		}>
	>;
	created_at: string;
	updated_at: string;
}

export interface CartItem {
	id: string;
	productId: string;
	quantity: number;
	selectedVariants?: Record<string, string>;
	price: number;
}

export interface Cart {
	items: CartItem[];
	total: number;
	subtotal: number;
	tax: number;
	shipping: number;
}

export interface Vendor {
	id: number;
	name: string;
	email: string;
	business_name: string;
	business_registration_number?: string | null;
	description?: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	country: string;
	postal_code: string;
	status: string;
	documents?: string | null;
	approved_at?: string | null;
	approved_by?: number | null;
	commission_rate: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface Category {
	id: number;
	name: string;
	slug: string;
	description?: string;
	image?: string | null;
	parent_id?: number | null;
	sort_order: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	children?: Category[];
}

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	avatar?: string;
	addresses?: Address[];
	orders?: Order[];
}

export interface Address {
	id: string;
	type: 'billing' | 'shipping';
	firstName: string;
	lastName: string;
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	isDefault?: boolean;
}

export interface Order {
	id: string;
	userId: string;
	items: CartItem[];
	total: number;
	status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
	shippingAddress: Address;
	billingAddress: Address;
	createdAt: Date;
	updatedAt: Date;
}

export interface SearchFilters {
	category?: string;
	priceRange?: [number, number];
	brand?: string[];
	rating?: number;
	inStock?: boolean;
	sortBy?: 'name' | 'price' | 'rating' | 'newest';
	sortOrder?: 'asc' | 'desc';
}
