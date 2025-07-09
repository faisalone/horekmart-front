export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	salePrice?: number;
	image: string;
	images?: string[];
	category: string;
	subcategory?: string;
	brand: string;
	rating: number;
	reviewCount: number;
	inStock: boolean;
	variants?: ProductVariant[];
	tags?: string[];
	createdAt: Date;
	updatedAt: Date;
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

export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string;
	image?: string;
	parentId?: string;
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
