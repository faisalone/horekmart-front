'use client';

import { useCallback } from 'react';
import {
	gtmEvent,
	gtmAddToCart,
	gtmViewItem,
	gtmSearch,
	gtmPurchase,
} from '@/lib/gtm';
import { Product } from '@/types';

/**
 * Hook for easy GTM tracking throughout the app
 */
export const useGTM = () => {
	// Track product view
	const trackProductView = useCallback((product: Product) => {
		const price = product.sale_price
			? parseFloat(product.sale_price)
			: parseFloat(product.price);

		gtmViewItem({
			currency: 'BDT', // or get from site settings
			value: price,
			items: [
				{
					item_id: product.id.toString(),
					item_name: product.name,
					category: product.category?.name || 'Unknown',
					price: price,
				},
			],
		});
	}, []);

	// Track add to cart
	const trackAddToCart = useCallback(
		(product: Product, quantity: number = 1) => {
			const price = product.sale_price
				? parseFloat(product.sale_price)
				: parseFloat(product.price);

			gtmAddToCart({
				currency: 'BDT',
				value: price * quantity,
				items: [
					{
						item_id: product.id.toString(),
						item_name: product.name,
						category: product.category?.name || 'Unknown',
						quantity: quantity,
						price: price,
					},
				],
			});
		},
		[]
	);

	// Track search
	const trackSearch = useCallback((searchTerm: string) => {
		gtmSearch(searchTerm);
	}, []);

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
			gtmPurchase({
				transaction_id: orderData.orderId,
				value: orderData.total,
				currency: 'BDT',
				items: orderData.items.map((item) => {
					const price = item.product.sale_price
						? parseFloat(item.product.sale_price)
						: parseFloat(item.product.price);

					return {
						item_id: item.product.id.toString(),
						item_name: item.product.name,
						category: item.product.category?.name || 'Unknown',
						quantity: item.quantity,
						price: price,
					};
				}),
			});
		},
		[]
	);

	// Track custom events
	const trackEvent = useCallback(
		(eventName: string, parameters?: Record<string, any>) => {
			gtmEvent(eventName, parameters);
		},
		[]
	);

	// Track button clicks
	const trackButtonClick = useCallback(
		(buttonName: string, location?: string) => {
			gtmEvent('button_click', {
				button_name: buttonName,
				location: location || window.location.pathname,
			});
		},
		[]
	);

	// Track form submissions
	const trackFormSubmit = useCallback((formName: string) => {
		gtmEvent('form_submit', {
			form_name: formName,
		});
	}, []);

	return {
		trackProductView,
		trackAddToCart,
		trackSearch,
		trackPurchase,
		trackEvent,
		trackButtonClick,
		trackFormSubmit,
	};
};
