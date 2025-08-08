import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
	ApiResponse,
	PaginatedResponse,
	AdminUser,
	AuthTokens,
	LoginCredentials,
	UserCheckResult,
	OtpResult,
	AuthMethodSelection,
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
	SocialMediaPost,
	SocialMediaPostResponse,
	SocialMediaTokenStatus,
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
					window.location.href = '/login';
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

	// Multi-step authentication methods
	async checkIdentifier(identifier: string): Promise<UserCheckResult> {
		const response = await this.client.post<{ data: UserCheckResult }>(
			'/admin/auth/check-identifier',
			{ identifier }
		);
		return response.data.data;
	}

	// New improved authentication methods
	async lookup(identifier: string): Promise<UserCheckResult> {
		const response = await this.client.post<{ data: UserCheckResult }>(
			'/admin/auth/lookup',
			{ identifier }
		);
		return response.data.data;
	}

	async loginWithPasswordNew(
		identifier: string,
		type: 'email' | 'phone',
		password: string
	): Promise<AuthTokens> {
		const response = await this.client.post<{ data: AuthTokens }>(
			'/admin/auth/login-password',
			{ identifier, type, password }
		);
		const tokens = response.data.data;
		this.setToken(tokens.access_token);
		return tokens;
	}

	async loginWithOtpNew(
		identifier: string,
		type: 'email' | 'phone',
		otp: string
	): Promise<AuthTokens> {
		const response = await this.client.post<{ data: AuthTokens }>(
			'/admin/auth/login-otp',
			{ identifier, type, otp }
		);
		const tokens = response.data.data;
		this.setToken(tokens.access_token);
		return tokens;
	}

	async resendOtp(
		identifier: string,
		type: 'email' | 'phone'
	): Promise<OtpResult> {
		const response = await this.client.post<{ data: OtpResult }>(
			'/admin/auth/resend-otp',
			{ identifier, type }
		);
		return response.data.data;
	}

	async forgotPassword(
		identifier: string
	): Promise<{ type: string; identifier: string; expires_at?: string }> {
		const response = await this.client.post<{
			data: { type: string; identifier: string; expires_at?: string };
		}>('/admin/auth/forgot-password', { identifier });
		return response.data.data;
	}

	async resetPassword(
		identifier: string,
		type: 'email' | 'phone',
		otp: string,
		password: string,
		passwordConfirmation: string
	): Promise<void> {
		await this.client.post('/admin/auth/reset-password', {
			identifier,
			type,
			otp,
			password,
			password_confirmation: passwordConfirmation,
		});
	}

	async register(
		name: string,
		identifier: string,
		password: string
	): Promise<{ type: string; identifier: string; expires_at?: string }> {
		const response = await this.client.post<{
			data: { type: string; identifier: string; expires_at?: string };
		}>('/admin/auth/register', { name, identifier, password });
		return response.data.data;
	}

	async verifyRegistration(
		identifier: string,
		type: 'email' | 'phone',
		otp: string
	): Promise<AuthTokens> {
		const response = await this.client.post<{ data: AuthTokens }>(
			'/admin/auth/verify-registration',
			{ identifier, type, otp }
		);
		const tokens = response.data.data;
		this.setToken(tokens.access_token);
		return tokens;
	}

	async sendOtp(
		identifier: string,
		type: 'email' | 'phone'
	): Promise<OtpResult> {
		const response = await this.client.post<OtpResult>(
			'/admin/auth/send-otp',
			{ identifier, type }
		);
		return response.data;
	}

	async verifyOtpAndLogin(
		identifier: string,
		type: 'email' | 'phone',
		otpCode: string,
		name?: string
	): Promise<AuthTokens> {
		const response = await this.client.post<{ data: AuthTokens }>(
			'/admin/auth/verify-otp',
			{ identifier, type, otp_code: otpCode, name }
		);
		const tokens = response.data.data;
		this.setToken(tokens.access_token);
		return tokens;
	}

	async loginWithPassword(
		identifier: string,
		type: 'email' | 'phone',
		password: string
	): Promise<AuthTokens> {
		const response = await this.client.post<{ data: AuthTokens }>(
			'/admin/auth/login-password',
			{ identifier, type, password }
		);
		const tokens = response.data.data;
		this.setToken(tokens.access_token);
		return tokens;
	}

	async setPassword(
		password: string,
		passwordConfirmation: string
	): Promise<void> {
		await this.client.post('/admin/auth/set-password', {
			password,
			password_confirmation: passwordConfirmation,
		});
	}

	// Dashboard endpoints
	async getDashboardStats(): Promise<DashboardStats> {
		const response = await this.client.get<DashboardStats>(
			'/admin/admin/stats'
		);
		return response.data;
	}

	async getSalesData(
		period: '7d' | '30d' | '90d' | '1y' = '30d'
	): Promise<SalesData[]> {
		const response = await this.client.get<SalesData[]>(
			`/admin/admin/sales?period=${period}`
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
			const response = await this.client.get<{ data: Product }>(
				`/admin/products/${id}`
			);

			if (!response.data || !response.data.data) {
				throw new Error(`Product with ID ${id} not found`);
			}

			// The API returns the product wrapped in a data object
			return response.data.data;
		} catch (error) {
			console.error(`Error fetching product ${id}:`, error);
			throw error;
		}
	}

	async createProduct(
		product: Partial<Product>,
		images?: File[],
		thumbnail?: File
	): Promise<Product> {
		// Use FormData if files are included
		if (images?.length || thumbnail) {
			const formData = new FormData();

			// Add all product data fields with proper type conversion
			Object.entries(product).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					// Handle boolean values properly for FormData
					if (typeof value === 'boolean') {
						formData.append(key, value ? '1' : '0');
					} else if (
						key === 'social_links' &&
						typeof value === 'object'
					) {
						formData.append('social_links', JSON.stringify(value));
					} else {
						formData.append(key, value.toString());
					}
				}
			});

			// Add thumbnail if provided
			if (thumbnail) {
				formData.append('thumb', thumbnail);
			}

			// Add images if provided
			if (images?.length) {
				images.forEach((image) => {
					formData.append('images[]', image);
				});
			}

			const response = await this.client.post<{ data: Product }>(
				'/admin/products',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);
			return response.data.data;
		} else {
			// Regular JSON creation for product data only
			const response = await this.client.post<{ data: Product }>(
				'/admin/products',
				product
			);
			return response.data.data;
		}
	}

	async updateProduct(
		id: string | number,
		product: Partial<Product>,
		images?: File[],
		thumbnail?: File,
		orderedImages?: Array<string>, // Array of UUIDs or empty strings
		removeThumbnail?: boolean
	): Promise<Product> {
		// Use FormData if files are included or if we have ordered images or thumbnail operations
		if (
			images?.length ||
			thumbnail ||
			orderedImages?.length ||
			removeThumbnail
		) {
			const formData = new FormData();

			// Add all product data fields with proper type conversion
			Object.entries(product).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					// Handle boolean values properly for FormData
					if (typeof value === 'boolean') {
						formData.append(key, value ? '1' : '0');
					} else if (
						key === 'social_links' &&
						typeof value === 'object'
					) {
						formData.append('social_links', JSON.stringify(value));
					} else {
						formData.append(key, value.toString());
					}
				}
			});

			// Add thumbnail if provided
			if (thumbnail) {
				formData.append('thumb', thumbnail);
			}

			// Add flag to remove thumbnail if needed
			if (removeThumbnail) {
				formData.append('remove_thumb', '1');
			}

			// Add ordered images as JSON string (UUIDs and empty strings)
			if (orderedImages?.length) {
				formData.append('images', JSON.stringify(orderedImages));
			}

			// Add new image files under 'new_files[]'
			if (images?.length) {
				images.forEach((image, index) => {
					formData.append(`new_files[${index}]`, image);
				});
			}

			const response = await this.client.post(
				`/admin/products/${id}?_method=PUT`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);
			return response.data;
		} else {
			// Regular JSON update for product data only
			const response = await this.client.put<{ data: Product }>(
				`/admin/products/${id}`,
				product
			);
			return response.data.data;
		}
	}
	async deleteProduct(id: string | number): Promise<void> {
		await this.client.delete(`/admin/products/${id}`);
	}

	async bulkProductAction(action: BulkAction): Promise<void> {
		await this.client.post('/admin/products/bulk', action);
	}

	// Note: Image management is now handled through the main updateProduct method
	// Old separate image endpoints are no longer used per new backend logic

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

	async updateVendor(
		id: string | number,
		vendorData: Partial<Vendor>
	): Promise<Vendor> {
		const response = await this.client.put<ApiResponse<Vendor>>(
			`/admin/vendors/${id}`,
			vendorData
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

	async createCategory(
		category: Partial<Category>,
		image?: File
	): Promise<Category> {
		// If image is provided, upload it first and get the URL
		let imageUrl = undefined;
		if (image) {
			try {
				const uploadResult = await this.uploadFile(image, 'categories');
				imageUrl = uploadResult.url;
			} catch (error) {
				console.error('Error uploading category image:', error);
				throw new Error('Failed to upload category image');
			}
		}

		// Create category with image URL (if uploaded)
		const categoryData = {
			...category,
			...(imageUrl && { image: imageUrl }),
		};

		const response = await this.client.post(
			'/admin/categories',
			categoryData
		);
		return response.data.data;
	}

	async updateCategory(
		id: string,
		category: Partial<Category>,
		image?: File
	): Promise<Category> {
		// If image is provided, upload it first and get the URL
		let imageUrl = undefined;
		if (image) {
			try {
				const uploadResult = await this.uploadFile(image, 'categories');
				imageUrl = uploadResult.url;
			} catch (error) {
				console.error('Error uploading category image:', error);
				throw new Error('Failed to upload category image');
			}
		}

		// Update category with image URL (if uploaded)
		const categoryData = {
			...category,
			...(imageUrl && { image: imageUrl }),
		};

		const response = await this.client.put(
			`/admin/categories/${id}`,
			categoryData
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
		const response = await this.client.get<{ data: Variation[] }>(
			'/admin/variations'
		);
		return response.data.data;
	}

	async createVariation(data: {
		name: string;
		slug?: string;
	}): Promise<Variation> {
		const response = await this.client.post<{ data: Variation }>(
			'/admin/variations',
			data
		);
		return response.data.data;
	}

	async updateVariation(
		id: number,
		data: { name: string; slug?: string }
	): Promise<Variation> {
		const response = await this.client.put<{ data: Variation }>(
			`/admin/variations/${id}`,
			data
		);
		return response.data.data;
	}

	async deleteVariation(id: number): Promise<void> {
		await this.client.delete(`/admin/variations/${id}`);
	}

	// Variation Values Management
	async getVariationValues(variationId?: number): Promise<VariationValue[]> {
		const url = variationId
			? `/admin/variation-values?variation_id=${variationId}`
			: '/admin/variation-values';
		const response = await this.client.get<{ data: VariationValue[] }>(url);
		return response.data.data;
	}

	async createVariationValue(data: {
		variation_id: number;
		name: string;
		slug?: string;
	}): Promise<VariationValue> {
		const response = await this.client.post<{ data: VariationValue }>(
			'/admin/variation-values',
			data
		);
		return response.data.data;
	}

	async updateVariationValue(
		id: number,
		data: { variation_id: number; name: string; slug?: string }
	): Promise<VariationValue> {
		const response = await this.client.put<{ data: VariationValue }>(
			`/admin/variation-values/${id}`,
			data
		);
		return response.data.data;
	}

	async deleteVariationValue(id: number): Promise<void> {
		await this.client.delete(`/admin/variation-values/${id}`);
	}

	// Product Variants Management
	async getProductVariants(productId?: number): Promise<ProductVariant[]> {
		const url = productId
			? `/admin/product-variants?product_id=${productId}`
			: '/admin/product-variants';
		const response = await this.client.get<{ data: ProductVariant[] }>(url);
		return response.data.data;
	}

	async getProductVariantsForProduct(
		productId: number
	): Promise<ProductVariant[]> {
		const response = await this.client.get<{
			data: { variants: ProductVariant[] };
		}>(`/admin/products/${productId}/variants`);
		return response.data.data.variants;
	}

	async createProductVariant(data: {
		product_id: number;
		sku: string;
		price_override?: number;
		quantity: number;
		variation_values: number[];
	}): Promise<ProductVariant> {
		const response = await this.client.post<{ data: ProductVariant }>(
			'/admin/product-variants',
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
		const response = await this.client.put<{ data: ProductVariant }>(
			`/admin/product-variants/${id}`,
			data
		);
		return response.data.data;
	}

	async deleteProductVariant(id: number): Promise<void> {
		await this.client.delete(`/admin/product-variants/${id}`);
	}

	// Social Media Methods
	async generateSocialMediaCaption(
		productId: number,
		platform: string
	): Promise<{ caption: string }> {
		const response = await this.client.post<{ data: { caption: string } }>(
			'/admin/social/generate-caption',
			{ product_id: productId, platform }
		);
		return response.data.data;
	}

	async postToSocialMedia(
		posts: SocialMediaPost[]
	): Promise<SocialMediaPostResponse> {
		const platforms = posts.map((p) => p.platform);
		const firstPost = posts[0];

		const response = await this.client.post(`/social/post`, {
			platforms,
			caption: firstPost?.caption || '',
			images: firstPost?.images || [], // Add selected images to payload
			...(firstPost?.scheduled_at && {
				scheduled_for: firstPost.scheduled_at,
				published: false,
			}),
		});

		// Handle different response formats
		if (response.data.data) {
			return response.data.data; // Extract from nested data object
		} else {
			return response.data; // Direct response format
		}
	}

	async getSocialMediaTokens(): Promise<SocialMediaTokenStatus> {
		const response = await this.client.get<{
			data: SocialMediaTokenStatus;
		}>('/admin/social/tokens');
		return response.data.data;
	}
}

// Create a singleton instance
export const adminApi = new AdminApiClient();

// Export individual methods for easier testing and usage
export default adminApi;
