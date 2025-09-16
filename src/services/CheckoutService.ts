import { apiClient } from '@/lib/apiClient';
import {
	shippingCalculator,
	type ShippingZone,
	type CartItemWithWeight,
} from '@/services/ShippingCalculator';

export interface CheckoutSessionItem {
	product_slug: string;
	quantity: number;
	variant_id?: number;
}

export interface CheckoutSessionData {
	type: 'cart' | 'buy_now';
	items: Array<{
		product_id: number;
		product_slug: string;
		product_name: string;
		variant_id?: number;
		variant_name?: string;
		variant_combinations?: Record<string, string>;
		price: number;
		original_price?: number; // Original/regular price before discount
		quantity: number;
		image: string;
		category_slug?: string;
		weight?: number | string;
		weight_unit?: string;
	}>;
	created_at: string;
}

export interface OrderData {
	session_id: string;
	customer: {
		email?: string;
		name: string;
		phone: string;
	};
	shipping_address: {
		address: string;
		city: string;
		zip_code: string;
		country: string;
	};
	shipping_method: ShippingZone;
	payment_method: 'bkash' | 'nagad' | 'pay_later';
	discount_code?: string;
	notes?: string;
}

export interface OrderResponse {
	message: string;
	order: {
		id: number;
		order_number: string;
		total_amount: number;
		status: string;
		payment_status: string;
		payment_method: string;
	};
}

class CheckoutService {
	async createCheckoutSession(
		type: 'cart' | 'buy_now',
		items: CheckoutSessionItem[]
	): Promise<{ session_id: string; expires_at: string }> {
		const response = await apiClient.post('/v1/orders/checkout-session', {
			type,
			items,
		});
		return response.data;
	}

	async getCheckoutSession(sessionId: string): Promise<CheckoutSessionData> {
		const response = await apiClient.get(
			`/v1/orders/checkout-session/${sessionId}`
		);
		return response.data;
	}

	async createOrder(orderData: OrderData): Promise<OrderResponse> {
		const response = await apiClient.post('/v1/orders', orderData);
		return response.data;
	}

	async buyNow(
		productSlug: string,
		quantity: number,
		variantId?: number
	): Promise<string> {
		const items: CheckoutSessionItem[] = [
			{
				product_slug: productSlug,
				quantity,
				variant_id: variantId,
			},
		];

		const session = await this.createCheckoutSession('buy_now', items);
		return session.session_id;
	}

	async createCartSession(cartItems: CheckoutSessionItem[]): Promise<string> {
		const session = await this.createCheckoutSession('cart', cartItems);
		return session.session_id;
	}

	/**
	 * Get shipping cost based on items weight and shipping zone
	 */
	getShippingCost(
		method: ShippingZone,
		cartItems?: CartItemWithWeight[]
	): number {
		if (cartItems && cartItems.length > 0) {
			const result = shippingCalculator.calculateShippingForCart(
				cartItems,
				method
			);
			return result.shippingCost;
		}

		// Fallback to legacy method for backward compatibility
		return shippingCalculator.getShippingCostLegacy(method);
	}

	/**
	 * Get all available shipping options for cart items
	 */
	getShippingOptions(cartItems: CartItemWithWeight[]) {
		return shippingCalculator.getShippingOptionsForCart(cartItems);
	}

	calculateDiscount(discountCode: string, subtotal: number): number {
		const discounts: Record<
			string,
			{ type: 'percentage' | 'fixed'; value: number }
		> = {
			SAVE10: { type: 'percentage', value: 10 },
			FLAT50: { type: 'fixed', value: 50 },
			WELCOME20: { type: 'percentage', value: 20 },
			FREESHIP: { type: 'fixed', value: 0 },
		};

		const discount = discounts[discountCode.toUpperCase()];
		if (!discount) {
			return 0;
		}

		if (discount.type === 'percentage') {
			return (subtotal * discount.value) / 100;
		}

		return discount.value;
	}
}

export const checkoutService = new CheckoutService();
