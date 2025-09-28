/**
 * Google Tag Manager utilities for Next.js
 */

export const GTM_ID = 'GTM-NV56QXPJ';

// GTM script for head section
export const gtmScript = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
`;

// GTM noscript fallback
export const gtmNoscript = `
<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe>
`;

// Declare gtag for TypeScript
declare global {
	interface Window {
		dataLayer: any[];
		gtag: (...args: any[]) => void;
	}
}

// Initialize dataLayer
export const initGTM = () => {
	if (typeof window !== 'undefined') {
		window.dataLayer = window.dataLayer || [];
	}
};

// GTM event tracking functions
export const gtmEvent = (
	eventName: string,
	parameters?: Record<string, any>
) => {
	if (typeof window !== 'undefined' && window.dataLayer) {
		window.dataLayer.push({
			event: eventName,
			...parameters,
		});
	}
};

// Page view tracking
export const gtmPageView = (url: string) => {
	gtmEvent('page_view', {
		page_location: url,
		page_title: document?.title || '',
	});
};

// E-commerce events
export const gtmPurchase = (transactionData: {
	transaction_id: string;
	value: number;
	currency: string;
	items: Array<{
		item_id: string;
		item_name: string;
		category: string;
		quantity: number;
		price: number;
	}>;
}) => {
	gtmEvent('purchase', transactionData);
};

export const gtmAddToCart = (itemData: {
	currency: string;
	value: number;
	items: Array<{
		item_id: string;
		item_name: string;
		category: string;
		quantity: number;
		price: number;
	}>;
}) => {
	gtmEvent('add_to_cart', itemData);
};

export const gtmViewItem = (itemData: {
	currency: string;
	value: number;
	items: Array<{
		item_id: string;
		item_name: string;
		category: string;
		price: number;
	}>;
}) => {
	gtmEvent('view_item', itemData);
};

export const gtmSearch = (searchTerm: string) => {
	gtmEvent('search', {
		search_term: searchTerm,
	});
};

// Checkout funnel tracking
export const gtmBeginCheckout = (checkoutData: {
	currency: string;
	value: number;
	items: Array<{
		item_id: string;
		item_name: string;
		category: string;
		quantity: number;
		price: number;
	}>;
	checkout_type?: 'cart' | 'buy_now';
	session_id?: string;
}) => {
	gtmEvent('begin_checkout', {
		...checkoutData,
		checkout_step: 1,
		checkout_step_name: 'begin_checkout',
	});
};

// Checkout progress tracking with detailed steps
export const gtmCheckoutProgress = (stepData: {
	step_number: number;
	step_name: string;
	currency?: string;
	value?: number;
	session_id?: string;
	checkout_type?: 'cart' | 'buy_now';
	additional_data?: Record<string, any>;
}) => {
	gtmEvent('checkout_progress', {
		checkout_step: stepData.step_number,
		checkout_step_name: stepData.step_name,
		...stepData,
	});
};

// Form field interactions
export const gtmFieldInteraction = (fieldData: {
	field_name: string;
	field_type: string;
	action: 'focus' | 'blur' | 'input' | 'error' | 'valid';
	form_name: string;
	session_id?: string;
	field_value_length?: number;
	error_message?: string;
}) => {
	gtmEvent('form_field_interaction', fieldData);
};

// Payment method selection
export const gtmPaymentMethodSelect = (paymentData: {
	payment_method: string;
	session_id?: string;
	currency?: string;
	value?: number;
	checkout_type?: 'cart' | 'buy_now';
}) => {
	gtmEvent('add_payment_info', paymentData);
};

// Shipping method selection
export const gtmShippingInfo = (shippingData: {
	shipping_tier: string;
	shipping_cost: number;
	city?: string;
	zone?: string;
	session_id?: string;
	currency?: string;
	value?: number;
}) => {
	gtmEvent('add_shipping_info', shippingData);
};

// Checkout abandonment tracking
export const gtmCheckoutAbandonment = (abandonData: {
	step_name: string;
	step_number: number;
	session_id?: string;
	time_on_step?: number;
	fields_completed?: string[];
	fields_incomplete?: string[];
	last_interaction?: string;
	checkout_type?: 'cart' | 'buy_now';
}) => {
	gtmEvent('checkout_abandonment', abandonData);
};

// User engagement tracking
export const gtmUserEngagement = (engagementData: {
	engagement_type:
		| 'scroll'
		| 'time_on_page'
		| 'field_focus'
		| 'button_hover'
		| 'help_click';
	page_section?: string;
	time_spent?: number;
	session_id?: string;
	additional_context?: Record<string, any>;
}) => {
	gtmEvent('user_engagement', engagementData);
};

// Error tracking
export const gtmErrorTracking = (errorData: {
	error_type: 'validation' | 'network' | 'payment' | 'system';
	error_message: string;
	error_field?: string;
	form_name?: string;
	session_id?: string;
	user_action?: string;
}) => {
	gtmEvent('checkout_error', errorData);
};
