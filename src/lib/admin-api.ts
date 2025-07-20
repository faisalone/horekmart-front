import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
	ApiResponse,
	PaginatedResponse,
	AdminUser,
	AuthTokens,
	LoginCredentials,
	Vendor,
	Product,
	Order,
	Customer,
	DashboardStats,
	SalesData,
	TableFilter,
	BulkAction,
	GeneralSettings,
	Category,
	Variation,
	VariationValue,
	ProductVariant,
} from '@/types/admin';

class AdminApiClient {
	private client: AxiosInstance;
	private tokenKey = 'admin_access_token';

	constructor() {
		this.client = axios.create({
			baseURL:
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			withCredentials: true,
		});

		// Request interceptor to add auth token
		this.client.interceptors.request.use(
			(config) => {
				const token = this.getToken();
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		// Response interceptor to handle errors
		this.client.interceptors.response.use(
			(response) => response,
			(error: AxiosError) => {
				if (error.response?.status === 401) {
					this.clearToken();
					window.location.href = '/admin/login';
				}
				return Promise.reject(error);
			}
		);
	}

	// Token management
	setToken(token: string): void {
		localStorage.setItem(this.tokenKey, token);
	}

	getToken(): string | null {
		if (typeof window !== 'undefined') {
			return localStorage.getItem(this.tokenKey);
		}
		return null;
	}

	clearToken(): void {
		if (typeof window !== 'undefined') {
			localStorage.removeItem(this.tokenKey);
		}
	}

	// Auth endpoints
	async login(credentials: LoginCredentials): Promise<AuthTokens> {
		const response = await this.client.post<AuthTokens>(
			'/admin/login',
			credentials
		);
		// Backend returns token directly in response, not wrapped in data
		const tokens = response.data;
		this.setToken(tokens.access_token);
		return tokens;
	}

	async logout(): Promise<void> {
		try {
			await this.client.post('/admin/logout');
		} finally {
			this.clearToken();
		}
	}

	async getProfile(): Promise<AdminUser> {
		const response = await this.client.get<{ user: AdminUser }>(
			'/admin/profile'
		);
		return response.data.user;
	}

	async refreshToken(): Promise<AuthTokens> {
		const response = await this.client.post<AuthTokens>('/admin/refresh');
		const tokens = response.data;
		this.setToken(tokens.access_token);
		return tokens;
	}

	// Dashboard endpoints
	async getDashboardStats(): Promise<DashboardStats> {
		const response = await this.client.get<DashboardStats>(
			'/admin/dashboard/stats'
		);
		return response.data;
	}

	async getSalesData(
		period: '7d' | '30d' | '90d' | '1y' = '30d'
	): Promise<SalesData[]> {
		const response = await this.client.get<SalesData[]>(
			`/admin/dashboard/sales?period=${period}`
		);
		return response.data;
	}

	// Products endpoints
	async getProducts(
		filters: TableFilter = {}
	): Promise<PaginatedResponse<Product>> {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== '') {
				params.append(key, value.toString());
			}
		});

		const response = await this.client.get<PaginatedResponse<Product>>(
			`/admin/products?${params}`
		);
		return response.data;
	}

	async getProduct(id: string | number): Promise<Product> {
		try {
			const response = await this.client.get<Product>(
				`/admin/products/${id}`
			);

			if (!response.data) {
				throw new Error(`Product with ID ${id} not found`);
			}

			// The API returns the product directly, not wrapped in a data object
			return response.data;
		} catch (error) {
			console.error(`Error fetching product ${id}:`, error);
			throw error;
		}
	}

	async createProduct(product: Partial<Product>): Promise<Product> {
		const response = await this.client.post<Product>(
			'/admin/products',
			product
		);
		return response.data;
	}

	async updateProduct(
		id: string | number,
		product: Partial<Product>
	): Promise<Product> {
		const response = await this.client.put<Product>(
			`/admin/products/${id}`,
			product
		);
		return response.data;
	}

	async deleteProduct(id: string | number): Promise<void> {
		await this.client.delete(`/admin/products/${id}`);
	}

	async bulkProductAction(action: BulkAction): Promise<void> {
		await this.client.post('/admin/products/bulk', action);
	}

	// Product image endpoints
	async uploadProductImages(
		productId: string | number,
		images: File[],
		sortOrders?: number[]
	): Promise<any> {
		const formData = new FormData();
		images.forEach((image, index) => {
			formData.append(`images[${index}]`, image);
			// If sort_order is provided, include it in the request
			if (sortOrders && sortOrders[index] !== undefined) {
				formData.append(
					`sort_orders[${index}]`,
					sortOrders[index].toString()
				);
			}
		});

		try {
			const response = await this.client.post(
				`/admin/products/${productId}/images`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);
			return response.data;
		} catch (error: any) {
			// Handle and re-throw with more specific error information
			if (error.response?.data?.message) {
				throw new Error(error.response.data.message);
			} else if (error.response?.data?.errors) {
				// Handle validation errors
				const errorMessages = Object.values(
					error.response.data.errors
				).flat();
				throw new Error(errorMessages.join(', '));
			}
			throw error;
		}
	}

	async uploadProductThumbnail(
		productId: string | number,
		thumbnail: File
	): Promise<any> {
		const formData = new FormData();
		formData.append('thumbnail', thumbnail);

		try {
			const response = await this.client.post(
				`/admin/products/${productId}/thumbnail`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);
			return response.data;
		} catch (error: any) {
			// Handle and re-throw with more specific error information
			if (error.response?.data?.message) {
				throw new Error(error.response.data.message);
			} else if (error.response?.data?.errors) {
				// Handle validation errors
				const errorMessages = Object.values(
					error.response.data.errors
				).flat();
				throw new Error(errorMessages.join(', '));
			}
			throw error;
		}
	}

	async deleteProductThumbnail(productId: string | number): Promise<void> {
		try {
			await this.client.delete(`/admin/products/${productId}/thumbnail`);
		} catch (error: any) {
			if (error.response?.data?.message) {
				throw new Error(error.response.data.message);
			}
			throw error;
		}
	}

	async deleteProductImage(
		productId: string | number,
		imageId: string | number
	): Promise<void> {
		await this.client.delete(
			`/admin/products/${productId}/images/${imageId}`
		);
	}

	async reorderProductImages(
		productId: string | number,
		imageIds: number[]
	): Promise<any> {
		const response = await this.client.patch(
			`/admin/products/${productId}/images/reorder`,
			{ image_ids: imageIds }
		);
		return response.data;
	}

	// Vendors endpoints
	async getVendors(
		filters: TableFilter = {}
	): Promise<PaginatedResponse<Vendor>> {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== '') {
				params.append(key, value.toString());
			}
		});

		const response = await this.client.get<PaginatedResponse<Vendor>>(
			`/admin/vendors?${params}`
		);
		return response.data;
	}

	async getVendor(id: string | number): Promise<Vendor> {
		const response = await this.client.get<ApiResponse<Vendor>>(
			`/admin/vendors/${id}`
		);
		return response.data.data;
	}

	async approveVendor(id: string | number): Promise<Vendor> {
		const response = await this.client.post<ApiResponse<Vendor>>(
			`/admin/vendors/${id}/approve`
		);
		return response.data.data;
	}

	async rejectVendor(id: string | number, reason?: string): Promise<Vendor> {
		const response = await this.client.post<ApiResponse<Vendor>>(
			`/admin/vendors/${id}/reject`,
			{ reason }
		);
		return response.data.data;
	}

	async suspendVendor(id: string | number, reason?: string): Promise<Vendor> {
		const response = await this.client.post<ApiResponse<Vendor>>(
			`/admin/vendors/${id}/suspend`,
			{ reason }
		);
		return response.data.data;
	}

	async bulkVendorAction(action: BulkAction): Promise<void> {
		await this.client.post('/admin/vendors/bulk', action);
	}

	// Orders endpoints
	async getOrders(
		filters: TableFilter = {}
	): Promise<PaginatedResponse<Order>> {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== '') {
				params.append(key, value.toString());
			}
		});

		const response = await this.client.get<PaginatedResponse<Order>>(
			`/admin/orders?${params}`
		);
		return response.data;
	}

	async getOrder(id: string): Promise<Order> {
		const response = await this.client.get<ApiResponse<Order>>(
			`/admin/orders/${id}`
		);
		return response.data.data;
	}

	async updateOrderStatus(
		id: string,
		status: Order['status']
	): Promise<Order> {
		const response = await this.client.patch<ApiResponse<Order>>(
			`/admin/orders/${id}/status`,
			{ status }
		);
		return response.data.data;
	}

	async updatePaymentStatus(
		id: string,
		status: Order['payment_status']
	): Promise<Order> {
		const response = await this.client.patch<ApiResponse<Order>>(
			`/admin/orders/${id}/payment-status`,
			{ status }
		);
		return response.data.data;
	}

	// Customers endpoints
	async getCustomers(
		filters: TableFilter = {}
	): Promise<PaginatedResponse<Customer>> {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== '') {
				params.append(key, value.toString());
			}
		});

		const response = await this.client.get<PaginatedResponse<Customer>>(
			`/admin/customers?${params}`
		);
		return response.data;
	}

	async getCustomer(id: string): Promise<Customer> {
		const response = await this.client.get<ApiResponse<Customer>>(
			`/admin/customers/${id}`
		);
		return response.data.data;
	}

	async banCustomer(id: string, reason?: string): Promise<Customer> {
		const response = await this.client.post<ApiResponse<Customer>>(
			`/admin/customers/${id}/ban`,
			{ reason }
		);
		return response.data.data;
	}

	async unbanCustomer(id: string): Promise<Customer> {
		const response = await this.client.post<ApiResponse<Customer>>(
			`/admin/customers/${id}/unban`
		);
		return response.data.data;
	}

	// Categories endpoints
	async getCategories(
		filters: TableFilter = {}
	): Promise<PaginatedResponse<Category>> {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== '') {
				params.append(key, value.toString());
			}
		});

		const response = await this.client.get(`/admin/categories?${params}`);

		// Transform Laravel pagination format to our expected format
		return {
			data: response.data.data,
			meta: {
				current_page: response.data.current_page,
				from: response.data.from,
				last_page: response.data.last_page,
				per_page: response.data.per_page,
				to: response.data.to,
				total: response.data.total,
			},
			links: {
				first: response.data.first_page_url,
				last: response.data.last_page_url,
				prev: response.data.prev_page_url,
				next: response.data.next_page_url,
			},
		};
	}

	async getCategory(id: string | number): Promise<Category> {
		const response = await this.client.get(`/admin/categories/${id}`);
		return response.data.data;
	}

	async createCategory(category: Partial<Category>): Promise<Category> {
		const response = await this.client.post('/admin/categories', category);
		return response.data.data;
	}

	async updateCategory(
		id: string,
		category: Partial<Category>
	): Promise<Category> {
		const response = await this.client.put(
			`/admin/categories/${id}`,
			category
		);
		return response.data.data;
	}

	async deleteCategory(id: number): Promise<void> {
		await this.client.delete(`/admin/categories/${id}`);
	}

	// Settings endpoints
	async getGeneralSettings(): Promise<GeneralSettings> {
		const response = await this.client.get<ApiResponse<GeneralSettings>>(
			'/admin/settings/general'
		);
		return response.data.data;
	}

	async updateGeneralSettings(
		settings: Partial<GeneralSettings>
	): Promise<GeneralSettings> {
		const response = await this.client.put<ApiResponse<GeneralSettings>>(
			'/admin/settings/general',
			settings
		);
		return response.data.data;
	}

	// File upload
	async uploadFile(
		file: File,
		path: string = 'uploads'
	): Promise<{ url: string }> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('path', path);

		const response = await this.client.post<ApiResponse<{ url: string }>>(
			'/admin/upload',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);

		return response.data.data;
	}

	// Variation Management
	async getVariations(): Promise<Variation[]> {
		const response = await this.client.get<ApiResponse<Variation[]>>(
			'/v1/variations'
		);
		return response.data.data;
	}

	async createVariation(data: {
		name: string;
		slug?: string;
	}): Promise<Variation> {
		const response = await this.client.post<ApiResponse<Variation>>(
			'/variations',
			data
		);
		return response.data.data;
	}

	async updateVariation(
		id: number,
		data: { name: string; slug?: string }
	): Promise<Variation> {
		const response = await this.client.put<ApiResponse<Variation>>(
			`/variations/${id}`,
			data
		);
		return response.data.data;
	}

	async deleteVariation(id: number): Promise<void> {
		await this.client.delete(`/variations/${id}`);
	}

	// Variation Values Management
	async getVariationValues(variationId?: number): Promise<VariationValue[]> {
		const params = variationId ? { variation_id: variationId } : {};
		const response = await this.client.get<ApiResponse<VariationValue[]>>(
			'/v1/variation-values',
			{ params }
		);
		return response.data.data;
	}

	async createVariationValue(data: {
		variation_id: number;
		name: string;
		slug?: string;
	}): Promise<VariationValue> {
		const response = await this.client.post<ApiResponse<VariationValue>>(
			'/variation-values',
			data
		);
		return response.data.data;
	}

	async updateVariationValue(
		id: number,
		data: { variation_id: number; name: string; slug?: string }
	): Promise<VariationValue> {
		const response = await this.client.put<ApiResponse<VariationValue>>(
			`/variation-values/${id}`,
			data
		);
		return response.data.data;
	}

	async deleteVariationValue(id: number): Promise<void> {
		await this.client.delete(`/variation-values/${id}`);
	}

	// Product Variants Management
	async getProductVariants(productId?: number): Promise<ProductVariant[]> {
		const params = productId ? { product_id: productId } : {};
		const response = await this.client.get<ApiResponse<ProductVariant[]>>(
			'/v1/product-variants',
			{ params }
		);
		return response.data.data;
	}

	async getProductVariantsForProduct(
		productId: number
	): Promise<ProductVariant[]> {
		const response = await this.client.get<ApiResponse<ProductVariant[]>>(
			`/v1/products/${productId}/variants`
		);
		return response.data.data;
	}

	async createProductVariant(data: {
		product_id: number;
		sku: string;
		price_override?: number;
		quantity: number;
		variation_values: number[];
	}): Promise<ProductVariant> {
		const response = await this.client.post<ApiResponse<ProductVariant>>(
			'/product-variants',
			data
		);
		return response.data.data;
	}

	async updateProductVariant(
		id: number,
		data: {
			product_id: number;
			sku: string;
			price_override?: number;
			quantity: number;
			variation_values: number[];
		}
	): Promise<ProductVariant> {
		const response = await this.client.put<ApiResponse<ProductVariant>>(
			`/product-variants/${id}`,
			data
		);
		return response.data.data;
	}

	async deleteProductVariant(id: number): Promise<void> {
		await this.client.delete(`/product-variants/${id}`);
	}
}

// Create a singleton instance
export const adminApi = new AdminApiClient();

// Export individual methods for easier testing and usage
export default adminApi;
