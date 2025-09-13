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
