'use client';

import { useCallback } from 'react';
import {
	gtmEvent,
	gtmAddToCart,
	gtmViewItem,
	gtmSearch,
	gtmPurchase,
	gtmBeginCheckout,
	gtmCheckoutProgress,
	gtmFieldInteraction,
	gtmPaymentMethodSelect,
	gtmShippingInfo,
	gtmCheckoutAbandonment,
	gtmUserEngagement,
	gtmErrorTracking,
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

	// Track checkout initiation
	const trackBeginCheckout = useCallback(
		(checkoutData: {
			items: Array<{ product: Product; quantity: number }>;
			total: number;
			checkoutType: 'cart' | 'buy_now';
			sessionId?: string;
		}) => {
			gtmBeginCheckout({
				currency: 'BDT',
				value: checkoutData.total,
				checkout_type: checkoutData.checkoutType,
				session_id: checkoutData.sessionId,
				items: checkoutData.items.map((item) => {
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

	// Track checkout step progress
	const trackCheckoutStep = useCallback(
		(stepData: {
			stepNumber: number;
			stepName: string;
			sessionId?: string;
			checkoutType?: 'cart' | 'buy_now';
			total?: number;
			additionalData?: Record<string, any>;
		}) => {
			gtmCheckoutProgress({
				step_number: stepData.stepNumber,
				step_name: stepData.stepName,
				currency: 'BDT',
				value: stepData.total,
				session_id: stepData.sessionId,
				checkout_type: stepData.checkoutType,
				additional_data: stepData.additionalData,
			});
		},
		[]
	);

	// Track form field interactions
	const trackFieldInteraction = useCallback(
		(fieldData: {
			fieldName: string;
			fieldType: string;
			action: 'focus' | 'blur' | 'input' | 'error' | 'valid';
			formName: string;
			sessionId?: string;
			fieldValueLength?: number;
			errorMessage?: string;
		}) => {
			gtmFieldInteraction({
				field_name: fieldData.fieldName,
				field_type: fieldData.fieldType,
				action: fieldData.action,
				form_name: fieldData.formName,
				session_id: fieldData.sessionId,
				field_value_length: fieldData.fieldValueLength,
				error_message: fieldData.errorMessage,
			});
		},
		[]
	);

	// Track payment method selection
	const trackPaymentMethodSelect = useCallback(
		(paymentData: {
			paymentMethod: string;
			sessionId?: string;
			total?: number;
			checkoutType?: 'cart' | 'buy_now';
		}) => {
			gtmPaymentMethodSelect({
				payment_method: paymentData.paymentMethod,
				session_id: paymentData.sessionId,
				currency: 'BDT',
				value: paymentData.total,
				checkout_type: paymentData.checkoutType,
			});
		},
		[]
	);

	// Track shipping information
	const trackShippingInfo = useCallback(
		(shippingData: {
			shippingCost: number;
			city?: string;
			zone?: string;
			sessionId?: string;
			total?: number;
		}) => {
			gtmShippingInfo({
				shipping_tier:
					shippingData.city && shippingData.zone
						? `${shippingData.city} - ${shippingData.zone}`
						: 'Standard',
				shipping_cost: shippingData.shippingCost,
				city: shippingData.city,
				zone: shippingData.zone,
				session_id: shippingData.sessionId,
				currency: 'BDT',
				value: shippingData.total,
			});
		},
		[]
	);

	// Track checkout abandonment
	const trackCheckoutAbandonment = useCallback(
		(abandonData: {
			stepName: string;
			stepNumber: number;
			sessionId?: string;
			timeOnStep?: number;
			fieldsCompleted?: string[];
			fieldsIncomplete?: string[];
			lastInteraction?: string;
			checkoutType?: 'cart' | 'buy_now';
		}) => {
			gtmCheckoutAbandonment({
				step_name: abandonData.stepName,
				step_number: abandonData.stepNumber,
				session_id: abandonData.sessionId,
				time_on_step: abandonData.timeOnStep,
				fields_completed: abandonData.fieldsCompleted,
				fields_incomplete: abandonData.fieldsIncomplete,
				last_interaction: abandonData.lastInteraction,
				checkout_type: abandonData.checkoutType,
			});
		},
		[]
	);

	// Track user engagement
	const trackUserEngagement = useCallback(
		(engagementData: {
			engagementType:
				| 'scroll'
				| 'time_on_page'
				| 'field_focus'
				| 'button_hover'
				| 'help_click';
			pageSection?: string;
			timeSpent?: number;
			sessionId?: string;
			additionalContext?: Record<string, any>;
		}) => {
			gtmUserEngagement({
				engagement_type: engagementData.engagementType,
				page_section: engagementData.pageSection,
				time_spent: engagementData.timeSpent,
				session_id: engagementData.sessionId,
				additional_context: engagementData.additionalContext,
			});
		},
		[]
	);

	// Track errors
	const trackError = useCallback(
		(errorData: {
			errorType: 'validation' | 'network' | 'payment' | 'system';
			errorMessage: string;
			errorField?: string;
			formName?: string;
			sessionId?: string;
			userAction?: string;
		}) => {
			gtmErrorTracking({
				error_type: errorData.errorType,
				error_message: errorData.errorMessage,
				error_field: errorData.errorField,
				form_name: errorData.formName,
				session_id: errorData.sessionId,
				user_action: errorData.userAction,
			});
		},
		[]
	);

	return {
		trackProductView,
		trackAddToCart,
		trackSearch,
		trackPurchase,
		trackEvent,
		trackButtonClick,
		trackFormSubmit,
		trackBeginCheckout,
		trackCheckoutStep,
		trackFieldInteraction,
		trackPaymentMethodSelect,
		trackShippingInfo,
		trackCheckoutAbandonment,
		trackUserEngagement,
		trackError,
	};
};
