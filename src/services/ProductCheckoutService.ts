import { publicApi } from '@/lib/public-api';
import { Product, ApiProductVariant } from '@/types';

// ==================== TYPES ====================
export interface ProductVariantInfo {
	id: number;
	sku: string;
	price: number;
	originalPrice?: number;
	combinations: Record<string, string>;
	quantity: number;
}

export interface CheckoutItem {
	productId: string;
	variantId?: string;
	quantity: number;
	productName: string;
	productImage?: string;
	productSlug?: string;
	categorySlug?: string;
	price: number;
	originalPrice?: number;
	variantOptions?: Record<string, string>;
	sku?: string;
	maxQuantity?: number;
	weight?: number;
	weightUnit?: string;
	isDirectBuy?: boolean;
	id: string;
	addedAt: Date;
}

export interface CheckoutConfig {
	mode: 'cart' | 'buy_now';
	productSlug?: string;
	variantId?: string;
	quantity?: number;
}

export interface PricingInfo {
	price: number;
	originalPrice?: number;
	hasDiscount: boolean;
	savings: number;
}

// ==================== CORE SERVICE ====================
class ProductCheckoutService {
	private static instance: ProductCheckoutService;

	public static getInstance(): ProductCheckoutService {
		if (!ProductCheckoutService.instance) {
			ProductCheckoutService.instance = new ProductCheckoutService();
		}
		return ProductCheckoutService.instance;
	}

	// ==================== SESSION MANAGEMENT ====================
	private generateSessionId(): string {
		const chars =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < 24; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	private createCheckoutSession(
		items: CheckoutItem[],
		isDirectBuy: boolean = false
	): string {
		const sessionId = this.generateSessionId();

		localStorage.setItem('checkout_session', sessionId);
		localStorage.setItem('checkout_items', JSON.stringify(items));
		localStorage.setItem('checkout_timestamp', Date.now().toString());

		if (isDirectBuy) {
			localStorage.setItem('is_direct_buy', 'true');
		} else {
			localStorage.removeItem('is_direct_buy');
		}

		return sessionId;
	}

	// ==================== PRODUCT OPERATIONS ====================
	async getProductWithVariants(productSlug: string): Promise<{
		product: Product;
		variants: ApiProductVariant[];
	}> {
		const product = await publicApi.getProduct(productSlug);

		// Variants are now included in the product response
		const variants = product.variants || [];

		return { product, variants };
	}

	// ==================== VARIANT OPERATIONS ====================
	getVariantInfo(variant: ApiProductVariant): ProductVariantInfo {
		// Extract variant combinations
		const combinations: Record<string, string> = {};

		// Handle simple combinations format (preferred)
		if (variant.combinations) {
			// combinations is already Record<string, string>
			Object.assign(combinations, variant.combinations);
		}

		// Fallback: Handle variation_values format if combinations is not available
		if (
			Object.keys(combinations).length === 0 &&
			variant.variation_values
		) {
			variant.variation_values.forEach((variationValue) => {
				combinations[variationValue.variation.name] =
					variationValue.name;
			});
		}

		// Calculate pricing
		const price = variant.final_offer_price
			? parseFloat(variant.final_offer_price)
			: parseFloat(variant.final_price);

		const originalPrice =
			variant.final_offer_price && variant.final_price
				? parseFloat(variant.final_price)
				: undefined;

		return {
			id: variant.id,
			sku: variant.sku,
			price,
			originalPrice,
			combinations,
			quantity: variant.quantity,
		};
	}

	// ==================== PRICING OPERATIONS ====================
	calculatePricing(
		product: Product,
		variant?: ApiProductVariant
	): PricingInfo {
		let price: number;
		let originalPrice: number | undefined;

		if (variant) {
			price = variant.final_offer_price
				? parseFloat(variant.final_offer_price)
				: parseFloat(variant.final_price);

			originalPrice =
				variant.final_offer_price && variant.final_price
					? parseFloat(variant.final_price)
					: undefined;
		} else {
			price = product.sale_price
				? parseFloat(product.sale_price)
				: parseFloat(product.price);
			originalPrice = product.sale_price
				? parseFloat(product.price)
				: undefined;
		}

		const hasDiscount =
			originalPrice !== undefined && originalPrice > price;
		const savings = hasDiscount ? originalPrice! - price : 0;

		return {
			price,
			originalPrice,
			hasDiscount,
			savings,
		};
	}

	// ==================== CHECKOUT ITEM CREATION ====================
	async createCheckoutItem(
		productSlug: string,
		quantity: number,
		variantId?: string,
		isDirectBuy: boolean = false
	): Promise<CheckoutItem> {
		const { product, variants } = await this.getProductWithVariants(
			productSlug
		);

		// Find variant if specified
		const selectedVariant = variantId
			? variants.find((v) => v.id.toString() === variantId)
			: undefined;

		// Get pricing info
		const pricing = this.calculatePricing(product, selectedVariant);

		// Get variant info if applicable
		const variantInfo = selectedVariant
			? this.getVariantInfo(selectedVariant)
			: undefined;

		// Create checkout item
		const checkoutItem: CheckoutItem = {
			productId: product.id.toString(),
			variantId: variantId,
			quantity,
			productName: product.name,
			productImage: (() => {
				if (product.images && product.images.length > 0) {
					const firstImage = product.images[0] as any;
					if (typeof firstImage === 'object' && firstImage.url) {
						return firstImage.url;
					} else if (
						typeof firstImage === 'object' &&
						firstImage.file_url
					) {
						return firstImage.file_url;
					} else if (typeof firstImage === 'string') {
						return firstImage;
					}
				}
				return product.image || undefined;
			})(),
			productSlug: product.slug,
			categorySlug: product.category?.slug,
			price: pricing.price,
			originalPrice: pricing.originalPrice,
			variantOptions: variantInfo?.combinations,
			sku: variantInfo?.sku || product.sku,
			maxQuantity: variantInfo?.quantity || product.stock_quantity,
			weight:
				typeof product.weight === 'string'
					? parseFloat(product.weight)
					: product.weight || 0.5,
			weightUnit: product.weight_unit || 'kg',
			isDirectBuy,
			id: `${product.id}-${variantId || 'default'}-${Date.now()}`,
			addedAt: new Date(),
		};

		console.log('Created checkout item:', checkoutItem);
		console.log('Variant info:', variantInfo);
		console.log('Variant options:', checkoutItem.variantOptions);

		return checkoutItem;
	}

	// ==================== CART OPERATIONS ====================
	async addToCart(
		productSlug: string,
		quantity: number,
		variantId?: string,
		addToCartCallback?: (item: CheckoutItem) => void
	): Promise<void> {
		const checkoutItem = await this.createCheckoutItem(
			productSlug,
			quantity,
			variantId,
			false
		);

		if (addToCartCallback) {
			addToCartCallback(checkoutItem);
		}
	}

	// ==================== BUY NOW OPERATIONS ====================
	async buyNow(
		productSlug: string,
		quantity: number,
		variantId?: string
	): Promise<string> {
		const checkoutItem = await this.createCheckoutItem(
			productSlug,
			quantity,
			variantId,
			true
		);
		const sessionId = this.createCheckoutSession([checkoutItem], true);
		return sessionId;
	}

	// ==================== CHECKOUT OPERATIONS ====================
	async prepareCartCheckout(cartItems: any[]): Promise<string> {
		const sessionId = this.createCheckoutSession(cartItems, false);
		return sessionId;
	}

	// ==================== URL GENERATION ====================
	generateCheckoutUrl(config: CheckoutConfig): string {
		if (config.mode === 'buy_now') {
			const params = new URLSearchParams();
			params.set('mode', 'buy_now');
			params.set('product_slug', config.productSlug!);
			params.set('quantity', config.quantity!.toString());

			if (config.variantId) {
				params.set('variant_id', config.variantId);
			}

			return `/checkout?${params.toString()}`;
		} else {
			return '/checkout?mode=cart';
		}
	}

	// ==================== CLEANUP ====================
	clearCheckoutSession(): void {
		localStorage.removeItem('checkout_session');
		localStorage.removeItem('checkout_items');
		localStorage.removeItem('checkout_timestamp');
		localStorage.removeItem('is_direct_buy');
	}
}

// ==================== EXPORT SINGLETON ====================
export const productCheckoutService = ProductCheckoutService.getInstance();

// ==================== UTILITY HOOKS ====================
export const useProductCheckout = () => {
	const service = productCheckoutService;

	const addToCart = async (
		productSlug: string,
		quantity: number,
		variantId?: string,
		addToCartCallback?: (item: CheckoutItem) => void
	) => {
		return service.addToCart(
			productSlug,
			quantity,
			variantId,
			addToCartCallback
		);
	};

	const buyNow = async (
		productSlug: string,
		quantity: number,
		variantId?: string
	) => {
		const sessionId = await service.buyNow(
			productSlug,
			quantity,
			variantId
		);
		return `/checkout/${sessionId}`;
	};

	const prepareCartCheckout = async (cartItems: any[]) => {
		const sessionId = await service.prepareCartCheckout(cartItems);
		return `/checkout/${sessionId}`;
	};

	return {
		addToCart,
		buyNow,
		prepareCartCheckout,
		generateCheckoutUrl: service.generateCheckoutUrl.bind(service),
		clearSession: service.clearCheckoutSession.bind(service),
	};
};
