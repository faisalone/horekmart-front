import { useEffect } from 'react';
import { SEOData } from '@/types';

/**
 * Hook to dynamically update meta tags for client-side navigation
 * This supplements the server-side metadata generation
 */
export const useSEO = (seoData: SEOData) => {
	useEffect(() => {
		if (typeof window === 'undefined') return;

		// Update document title
		if (seoData.title) {
			document.title = seoData.title;
		}

		// Update meta description
		updateMetaTag('name', 'description', seoData.description || '');

		// Update meta keywords
		if (seoData.keywords) {
			updateMetaTag('name', 'keywords', seoData.keywords);
		}

		// Update canonical URL
		if (seoData.canonicalUrl) {
			updateLinkTag('canonical', seoData.canonicalUrl);
		}

		// Update Open Graph tags
		if (seoData.ogTitle) {
			updateMetaTag('property', 'og:title', seoData.ogTitle);
		}
		if (seoData.ogDescription) {
			updateMetaTag('property', 'og:description', seoData.ogDescription);
		}
		if (seoData.ogImage) {
			updateMetaTag('property', 'og:image', seoData.ogImage);
		}

		// Update Twitter Card tags
		updateMetaTag('name', 'twitter:card', 'summary_large_image');
		if (seoData.ogTitle) {
			updateMetaTag('name', 'twitter:title', seoData.ogTitle);
		}
		if (seoData.ogDescription) {
			updateMetaTag('name', 'twitter:description', seoData.ogDescription);
		}
		if (seoData.ogImage) {
			updateMetaTag('name', 'twitter:image', seoData.ogImage);
		}
	}, [seoData]);
};

/**
 * Update or create meta tag
 */
const updateMetaTag = (attribute: string, value: string, content: string) => {
	if (!content) return;

	let metaTag = document.querySelector(`meta[${attribute}="${value}"]`);

	if (metaTag) {
		metaTag.setAttribute('content', content);
	} else {
		metaTag = document.createElement('meta');
		metaTag.setAttribute(attribute, value);
		metaTag.setAttribute('content', content);
		document.head.appendChild(metaTag);
	}
};

/**
 * Update or create link tag
 */
const updateLinkTag = (rel: string, href: string) => {
	if (!href) return;

	let linkTag = document.querySelector(
		`link[rel="${rel}"]`
	) as HTMLLinkElement;

	if (linkTag) {
		linkTag.href = href;
	} else {
		linkTag = document.createElement('link');
		linkTag.rel = rel;
		linkTag.href = href;
		document.head.appendChild(linkTag);
	}
};
