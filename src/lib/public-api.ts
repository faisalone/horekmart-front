import axios, { AxiosInstance } from 'axios';
import { Product, Category } from '@/types';

interface PaginatedResponse<T> {
	data: T[];
	current_page: number;
	last_page: number;
	per_page: number;
	total: number;
}

class PublicApiClient {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL:
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		});
	}

	/**
	 * Get all products with pagination and filters
	 */
	async getProducts(params?: {
		search?: string;
		category?: string;
		vendor?: string;
		featured?: boolean;
		sort_by?: string;
		sort_order?: 'asc' | 'desc';
		per_page?: number;
		page?: number;
	}): Promise<PaginatedResponse<Product>> {
		const queryParams = new URLSearchParams();

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== '') {
					queryParams.append(key, value.toString());
				}
			});
		}

		const response = await this.client.get<PaginatedResponse<Product>>(
			`/v1/products?${queryParams}`
		);

		// Directly return the enriched product data
		return response.data;
	}

	/**
	 * Get a single product by ID
	 */
	async getProduct(slug: string): Promise<Product> {
		const response = await this.client.get<{ data: Product }>(
			`/v1/products/${slug}`
		);
		return response.data.data;
	}

	/**
	 * Get all categories
	 */
	async getCategories(): Promise<Category[]> {
		const response = await this.client.get<Category[]>('v1/categories');
		return response.data;
	}

	/**
	 * Get only parent categories (categories with parent_id: null)
	 */
	async getParentCategories(): Promise<Category[]> {
		const categories = await this.getCategories();
		return categories.filter((category) => category.parent_id === null);
	}

	/**
	 * Get all vendors
	 */
	async getVendors(): Promise<PaginatedResponse<any>> {
		const response = await this.client.get<PaginatedResponse<any>>(
			'/v1/vendors'
		);
		return response.data;
	}

	/**
	 * Get featured products
	 */
	async getFeaturedProducts(): Promise<Product[]> {
		const response = await this.client.get<Product[]>(
			'/v1/featured-products'
		);
		return response.data;
	}
}

export const publicApi = new PublicApiClient();
