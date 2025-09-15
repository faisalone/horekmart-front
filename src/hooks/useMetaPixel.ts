'use client';

import { useCallback } from 'react';
import {
	metaPixelEvent,
	metaPixelCustomEvent,
	metaPixelAddToCart,
	metaPixelViewContent,
	metaPixelSearch,
	metaPixelPurchase,
	metaPixelInitiateCheckout,
	metaPixelAddToWishlist,
	metaPixelCompleteRegistration,
	metaPixelLead,
} from '@/lib/meta-pixel';
import { Product } from '@/types';

/**
 * Hook for easy Meta Pixel tracking throughout the app
 */
export const useMetaPixel = () => {
	// Track product view
	const trackProductView = useCallback((product: Product) => {
		const price = product.sale_price
			? parseFloat(product.sale_price)
			: parseFloat(product.price);

		metaPixelViewContent({
			value: price,
			currency: 'BDT', // or get from site settings
			content_ids: [product.id.toString()],
			content_name: product.name,
			content_type: 'product',
			content_category: product.category?.name || 'Unknown',
		});
	}, []);

	// Track add to cart
	const trackAddToCart = useCallback(
		(product: Product, quantity: number = 1) => {
			const price = product.sale_price
				? parseFloat(product.sale_price)
				: parseFloat(product.price);

			metaPixelAddToCart({
				value: price * quantity,
				currency: 'BDT',
				content_ids: [product.id.toString()],
				content_name: product.name,
				content_type: 'product',
			});
		},
		[]
	);

	// Track search
	const trackSearch = useCallback(
		(searchTerm: string, productIds?: string[]) => {
			metaPixelSearch({
				search_string: searchTerm,
				content_ids: productIds,
				content_type: 'product',
			});
		},
		[]
	);

	// Track purchase/checkout completion
	const trackPurchase = useCallback(
		(orderData: {
			orderId: string;
			total: number;
			items: Array<{
				product: Product;
				quantity: number;
			}>;
		}) => {
			const contentIds = orderData.items.map((item) =>
				item.product.id.toString()
			);

			metaPixelPurchase({
				value: orderData.total,
				currency: 'BDT',
				content_ids: contentIds,
				content_type: 'product',
				num_items: orderData.items.reduce(
					(total, item) => total + item.quantity,
					0
				),
			});
		},
		[]
	);

	// Track initiate checkout
	const trackInitiateCheckout = useCallback(
		(checkoutData: {
			total: number;
			items: Array<{
				product: Product;
				quantity: number;
			}>;
		}) => {
			const contentIds = checkoutData.items.map((item) =>
				item.product.id.toString()
			);

			metaPixelInitiateCheckout({
				value: checkoutData.total,
				currency: 'BDT',
				content_ids: contentIds,
				content_type: 'product',
				num_items: checkoutData.items.reduce(
					(total, item) => total + item.quantity,
					0
				),
			});
		},
		[]
	);

	// Track add to wishlist
	const trackAddToWishlist = useCallback((product: Product) => {
		const price = product.sale_price
			? parseFloat(product.sale_price)
			: parseFloat(product.price);

		metaPixelAddToWishlist({
			value: price,
			currency: 'BDT',
			content_ids: [product.id.toString()],
			content_name: product.name,
			content_type: 'product',
		});
	}, []);

	// Track user registration
	const trackRegistration = useCallback((userData?: { email?: string }) => {
		metaPixelCompleteRegistration({
			status: true,
		});
	}, []);

	// Track lead generation (newsletter signup, contact form, etc.)
	const trackLead = useCallback(
		(leadData?: { formName?: string; value?: number }) => {
			metaPixelLead({
				content_name: leadData?.formName,
				value: leadData?.value,
				currency: 'BDT',
			});
		},
		[]
	);

	// Track standard events
	const trackEvent = useCallback(
		(eventName: string, parameters?: Record<string, any>) => {
			metaPixelEvent(eventName, parameters);
		},
		[]
	);

	// Track custom events
	const trackCustomEvent = useCallback(
		(eventName: string, parameters?: Record<string, any>) => {
			metaPixelCustomEvent(eventName, parameters);
		},
		[]
	);

	// Track button clicks
	const trackButtonClick = useCallback(
		(buttonName: string, location?: string) => {
			metaPixelCustomEvent('ButtonClick', {
				button_name: buttonName,
				page_location: location || window.location.pathname,
			});
		},
		[]
	);

	// Track form submissions
	const trackFormSubmit = useCallback((formName: string) => {
		metaPixelCustomEvent('FormSubmit', {
			form_name: formName,
		});
	}, []);

	// Track page engagement
	const trackPageEngagement = useCallback((timeSpent?: number) => {
		metaPixelCustomEvent('PageEngagement', {
			time_spent: timeSpent,
			page_location: window.location.pathname,
		});
	}, []);

	return {
		trackProductView,
		trackAddToCart,
		trackSearch,
		trackPurchase,
		trackInitiateCheckout,
		trackAddToWishlist,
		trackRegistration,
		trackLead,
		trackEvent,
		trackCustomEvent,
		trackButtonClick,
		trackFormSubmit,
		trackPageEngagement,
	};
};
