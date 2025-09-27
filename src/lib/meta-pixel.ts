/**
 * Meta Pixel utilities for Next.js
 */

export const META_PIXEL_ID = '1694830257743663';

// Meta Pixel script for head section
export const metaPixelScript = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
`;

// Meta Pixel noscript fallback
export const metaPixelNoscript = `
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" />
`;

// Declare fbq for TypeScript
declare global {
	interface Window {
		fbq: (...args: any[]) => void;
		_fbq: any;
	}
}

// Initialize Meta Pixel
export const initMetaPixel = () => {
	if (typeof window !== 'undefined' && !window.fbq) {
		// The script will be loaded by the layout, this just ensures we can track events
	}
};

// Meta Pixel event tracking functions
export const metaPixelEvent = (
	eventName: string,
	parameters?: Record<string, any>
) => {
	if (typeof window !== 'undefined' && window.fbq) {
		if (parameters) {
			window.fbq('track', eventName, parameters);
		} else {
			window.fbq('track', eventName);
		}
	}
};

// Custom event tracking
export const metaPixelCustomEvent = (
	eventName: string,
	parameters?: Record<string, any>
) => {
	if (typeof window !== 'undefined' && window.fbq) {
		if (parameters) {
			window.fbq('trackCustom', eventName, parameters);
		} else {
			window.fbq('trackCustom', eventName);
		}
	}
};

// Page view tracking
export const metaPixelPageView = () => {
	metaPixelEvent('PageView');
};

// E-commerce events
export const metaPixelPurchase = (purchaseData: {
	value: number;
	currency: string;
	content_ids?: string[];
	content_type?: string;
	num_items?: number;
}) => {
	metaPixelEvent('Purchase', purchaseData);
};

export const metaPixelAddToCart = (cartData: {
	value: number;
	currency: string;
	content_ids?: string[];
	content_name?: string;
	content_type?: string;
}) => {
	metaPixelEvent('AddToCart', cartData);
};

export const metaPixelViewContent = (contentData: {
	value?: number;
	currency?: string;
	content_ids?: string[];
	content_name?: string;
	content_type?: string;
	content_category?: string;
}) => {
	metaPixelEvent('ViewContent', contentData);
};

export const metaPixelInitiateCheckout = (checkoutData: {
	value: number;
	currency: string;
	content_ids?: string[];
	content_type?: string;
	num_items?: number;
}) => {
	metaPixelEvent('InitiateCheckout', checkoutData);
};

export const metaPixelSearch = (searchData: {
	search_string: string;
	content_ids?: string[];
	content_type?: string;
}) => {
	metaPixelEvent('Search', searchData);
};

export const metaPixelAddToWishlist = (wishlistData: {
	value?: number;
	currency?: string;
	content_ids?: string[];
	content_name?: string;
	content_type?: string;
}) => {
	metaPixelEvent('AddToWishlist', wishlistData);
};

export const metaPixelCompleteRegistration = (registrationData?: {
	value?: number;
	currency?: string;
	status?: boolean;
}) => {
	metaPixelEvent('CompleteRegistration', registrationData);
};

export const metaPixelLead = (leadData?: {
	value?: number;
	currency?: string;
	content_name?: string;
}) => {
	metaPixelEvent('Lead', leadData);
};
