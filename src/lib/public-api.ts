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

		// Ensure all products have their images loaded
		const productsWithImages = await Promise.all(
			response.data.data.map(async (product) => {
				if (!product.images || product.images.length === 0) {
					try {
						const productWithImages = await this.getProduct(
							product.id.toString()
						);
						return { ...product, images: productWithImages.images };
					} catch (error) {
						console.warn(
							`Could not fetch images for product ${product.id}:`,
							error
						);
						return product;
					}
				}
				return product;
			})
		);

		return {
			...response.data,
			data: productsWithImages,
		};
	}

	/**
	 * Get a single product by ID
	 */
	async getProduct(id: string): Promise<Product> {
		const response = await this.client.get<Product>(`/v1/products/${id}`);
		return response.data;
	}

	/**
	 * Get a single product by category path and slug
	 */
	async getProductByPath(
		categoryPath: string,
		slug: string
	): Promise<{
		product: Product;
		category_path: string[];
		full_category_path: string[];
		breadcrumb: Category[];
	}> {
		const response = await this.client.get(`/v1/${categoryPath}/${slug}`);
		const data = response.data;

		// If the product doesn't have images, fetch them separately
		if (
			data.product &&
			(!data.product.images || data.product.images.length === 0)
		) {
			try {
				const productWithImages = await this.getProduct(
					data.product.id.toString()
				);
				data.product = { ...data.product, ...productWithImages };
			} catch (error) {
				console.warn('Could not fetch product images:', error);
			}
		}

		return data;
	}

	/**
	 * Get product variants by product ID
	 */
	async getProductVariants(productId: string): Promise<{
		success: boolean;
		data: {
			product: Product;
			variants: any[];
		};
	}> {
		const response = await this.client.get(
			`/v1/products/${productId}/variants`
		);
		return response.data;
	}

	/**
	 * Get all categories
	 */
	async getCategories(): Promise<Category[]> {
		const response = await this.client.get<Category[]>('/v1/categories');
		return response.data;
	}

	/**
	 * Get featured products
	 */
	async getFeaturedProducts(): Promise<Product[]> {
		const response = await this.client.get<Product[]>(
			'/v1/featured-products'
		);

		// Ensure all products have their images loaded
		const productsWithImages = await Promise.all(
			response.data.map(async (product) => {
				if (!product.images || product.images.length === 0) {
					try {
						const productWithImages = await this.getProduct(
							product.id.toString()
						);
						return { ...product, images: productWithImages.images };
					} catch (error) {
						console.warn(
							`Could not fetch images for product ${product.id}:`,
							error
						);
						return product;
					}
				}
				return product;
			})
		);

		return productsWithImages;
	}
}

export const publicApi = new PublicApiClient();
