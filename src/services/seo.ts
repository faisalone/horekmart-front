import { Product, SEOData, SiteConfig } from '@/types';

// Import site settings service
import { siteSettingsService, SiteSettings } from './siteSettings';

/**
 * Site configuration - From backend API with environment fallbacks
 */
export const getSiteConfig = async (): Promise<SiteConfig> => {
	return await siteSettingsService.getSiteConfig();
};

/**
 * Get product OG image with simplified fallback chain based on actual API data
 */
const getProductOGImage = (product: Product): string | undefined => {
	// Priority 1: Product thumb field (primary product image)
	if (product.thumb) return product.thumb;

	// Priority 2: First image from images array
	if (product.images && product.images.length > 0) {
		const firstImage = product.images[0];
		if (typeof firstImage === 'object' && 'url' in firstImage) {
			return firstImage.url;
		}
	}

	return undefined;
};

/**
 * Generate SEO data for products - From product metadata with site defaults as fallback
 */
export const generateProductSEO = async (
	product: Product
): Promise<SEOData> => {
	const siteConfig = await siteSettingsService.getSiteConfig();
	const productImage = getProductImage(product);

	// Priority: Product metadata > Site defaults
	const title =
		product.meta_title ||
		(siteConfig.name
			? `${product.name} - ${siteConfig.name}`
			: product.name);

	const description =
		product.meta_description ||
		product.short_description ||
		siteConfig.description ||
		'';

	const keywords =
		product.meta_keywords || siteConfig.keywords?.join(', ') || '';

	const canonicalUrl =
		product.canonical_url ||
		(siteConfig.url
			? `${siteConfig.url}/products/${product.category?.slug}/${product.slug}`
			: '');

	const ogTitle = product.og_title || product.meta_title || title;

	const ogDescription =
		product.og_description || product.meta_description || description;

	// OG Image priority: product thumbnail field > other product images > site default og
	const ogImage = getProductOGImage(product) || siteConfig.ogImage || '';

	return {
		title,
		description,
		keywords,
		canonicalUrl,
		ogTitle,
		ogDescription,
		ogImage,
		focusKeyword: product.focus_keyword || product.name.toLowerCase(),
	};
};

/**
 * Generate SEO data for category pages - ONLY from environment/backend
 */
export const generateCategorySEO = async (
	categoryName: string,
	categorySlug: string
): Promise<SEOData> => {
	const siteConfig = await siteSettingsService.getSiteConfig();

	const title = siteConfig.name
		? `${categoryName} - ${siteConfig.name}`
		: categoryName;

	const description = siteConfig.description || '';

	return {
		title,
		description,
		canonicalUrl: siteConfig.url
			? `${siteConfig.url}/products?category=${categorySlug}`
			: '',
		ogTitle: title,
		ogDescription: description,
		ogImage: siteConfig.ogImage || '',
		keywords: siteConfig.keywords?.join(', ') || '',
		focusKeyword: categoryName.toLowerCase(),
	};
};

/**
 * Generate SEO data for category pages using full category object
 */
export const generateCategoryPageSEO = async (
	category: any
): Promise<SEOData> => {
	const siteConfig = await siteSettingsService.getSiteConfig();

	// Build title with category name and site name
	const title = siteConfig.name
		? `${category.name} - ${siteConfig.name}`
		: category.name;

	// Use category description or site default description
	const description = category.description || siteConfig.description || '';

	// Use category image for OG image, fallback to site default
	const ogImage =
		category.image_url || category.image || siteConfig.ogImage || '';

	// Build canonical URL for category page
	const canonicalUrl = siteConfig.url
		? `${siteConfig.url}/${category.slug}`
		: '';

	// Use category metadata or site defaults for keywords
	const keywords =
		category.meta_keywords || siteConfig.keywords?.join(', ') || '';

	return {
		title,
		description,
		keywords,
		canonicalUrl,
		ogTitle: title,
		ogDescription: description,
		ogImage,
		focusKeyword: category.name.toLowerCase(),
	};
};

/**
 * Generate structured data for category pages (JSON-LD)
 */
export const generateCategoryStructuredData = async (
	category: any,
	productCount: number = 0
) => {
	const siteConfig = await siteSettingsService.getSiteConfig();

	const structuredData: any = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: category.name,
		url: siteConfig.url ? `${siteConfig.url}/${category.slug}` : '',
		description: category.description || '',
		mainEntity: {
			'@type': 'ItemList',
			name: `${category.name} Products`,
			numberOfItems: productCount,
		},
	};

	// Add breadcrumb if category has parent
	if (category.parent_id) {
		structuredData.breadcrumb = {
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: siteConfig.name || 'Home',
					item: siteConfig.url || '',
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: category.name,
					item: siteConfig.url
						? `${siteConfig.url}/${category.slug}`
						: '',
				},
			],
		};
	}

	// Add category image
	if (category.image_url || category.image) {
		structuredData.image = category.image_url || category.image;
	}

	return structuredData;
};

/**
 * Generate SEO data for search pages - ONLY from environment/backend
 */
export const generateSearchSEO = async (
	searchQuery: string
): Promise<SEOData> => {
	const siteConfig = await siteSettingsService.getSiteConfig();

	const title = siteConfig.name
		? `Search: ${searchQuery} - ${siteConfig.name}`
		: `Search: ${searchQuery}`;

	const description = `Search results for "${searchQuery}"${
		siteConfig.name ? ` at ${siteConfig.name}` : ''
	}. ${siteConfig.description || ''}`;

	return {
		title,
		description,
		canonicalUrl: siteConfig.url
			? `${siteConfig.url}/search?q=${encodeURIComponent(searchQuery)}`
			: '',
		ogTitle: title,
		ogDescription: description,
		ogImage: siteConfig.ogImage || '',
		keywords: `search, ${searchQuery}, ${
			siteConfig.keywords?.join(', ') || ''
		}`,
		focusKeyword: searchQuery,
	};
};

/**
 * Generate default site SEO - ONLY from environment/backend
 */
export const generateDefaultSEO = async (): Promise<SEOData> => {
	const siteConfig = await siteSettingsService.getSiteConfig();

	return {
		title: siteConfig.name || '',
		description: siteConfig.description || '',
		keywords: siteConfig.keywords?.join(', ') || '',
		canonicalUrl: siteConfig.url || '',
		ogTitle: siteConfig.name || '',
		ogDescription: siteConfig.description || '',
		ogImage: siteConfig.ogImage || '',
	};
};

/**
 * Generate SEO data for products page with enhanced context handling
 */
export const generateProductsPageSEO = async (context?: {
	searchQuery?: string;
	categoryQuery?: string;
	type?: string;
}): Promise<SEOData> => {
	const siteConfig = await siteSettingsService.getSiteConfig();

	let title: string;
	let description: string;
	let keywords: string;
	let canonicalUrl: string;

	// Handle search results page
	if (context?.searchQuery) {
		title = siteConfig.name
			? `Search: "${context.searchQuery}" - ${siteConfig.name}`
			: `Search: "${context.searchQuery}"`;
		description = `Search results for "${context.searchQuery}". ${
			siteConfig.description || ''
		}`;
		keywords = `${context.searchQuery}, search, ${
			siteConfig.keywords?.join(', ') || ''
		}`;
		canonicalUrl = siteConfig.url
			? `${siteConfig.url}/products?q=${encodeURIComponent(
					context.searchQuery
			  )}`
			: '';
	}
	// Handle category filtered products page
	else if (context?.categoryQuery) {
		const categoryName =
			context.categoryQuery.charAt(0).toUpperCase() +
			context.categoryQuery.slice(1).replace(/-/g, ' ');
		title = siteConfig.name
			? `${categoryName} Products - ${siteConfig.name}`
			: `${categoryName} Products`;
		description = `Browse ${categoryName.toLowerCase()} products. ${
			siteConfig.description || ''
		}`;
		keywords = `${categoryName.toLowerCase()}, products, ${
			siteConfig.keywords?.join(', ') || ''
		}`;
		canonicalUrl = siteConfig.url
			? `${siteConfig.url}/products?category=${context.categoryQuery}`
			: '';
	}
	// Handle special types (trending, deals, etc.)
	else if (context?.type) {
		const typeLabels: Record<string, string> = {
			trending: 'Trending Products',
			deals: 'Best Deals',
			'most-viewed': 'Most Viewed Products',
			'best-sellers': 'Best Sellers',
		};
		const typeLabel = typeLabels[context.type] || 'Products';
		title = siteConfig.name
			? `${typeLabel} - ${siteConfig.name}`
			: typeLabel;
		description = `Discover ${typeLabel.toLowerCase()}. ${
			siteConfig.description || ''
		}`;
		keywords = `${context.type}, ${typeLabel.toLowerCase()}, ${
			siteConfig.keywords?.join(', ') || ''
		}`;
		canonicalUrl = siteConfig.url
			? `${siteConfig.url}/products?type=${context.type}`
			: '';
	}
	// Default products page
	else {
		title = siteConfig.name ? `Products - ${siteConfig.name}` : 'Products';
		description = siteConfig.description || '';
		keywords = siteConfig.keywords?.join(', ') || '';
		canonicalUrl = siteConfig.url ? `${siteConfig.url}/products` : '';
	}

	return {
		title,
		description,
		keywords,
		canonicalUrl,
		ogTitle: title,
		ogDescription: description,
		ogImage: siteConfig.ogImage || '',
	};
};

/**
 * Extract product image - simplified based on actual API data
 */
const getProductImage = (product: Product): string | undefined => {
	// Priority 1: Product thumb field
	if (product.thumb) return product.thumb;

	// Priority 2: First image from images array
	if (product.images && product.images.length > 0) {
		const firstImage = product.images[0];
		if (typeof firstImage === 'object' && 'url' in firstImage) {
			return firstImage.url;
		}
	}

	return undefined;
};

/**
 * Generate structured data for products (JSON-LD) - ONLY from backend data
 */
export const generateProductStructuredData = async (product: Product) => {
	const siteConfig = await siteSettingsService.getSiteConfig();
	const productImage = getProductOGImage(product);

	const structuredData: any = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.name,
		sku: product.sku,
	};

	// Only add fields if they exist
	if (product.short_description || product.description) {
		structuredData.description =
			product.short_description || product.description;
	}

	if (productImage) {
		structuredData.image = [productImage];
	}

	if (product.price) {
		structuredData.offers = {
			'@type': 'Offer',
			price: product.sale_price || product.price,
			priceCurrency: 'BDT',
			availability: product.in_stock
				? 'https://schema.org/InStock'
				: 'https://schema.org/OutOfStock',
		};

		if (siteConfig.url) {
			structuredData.offers.url = `${siteConfig.url}/products/${product.slug}`;
		}
	}

	if (product.vendor?.name) {
		structuredData.brand = {
			'@type': 'Brand',
			name: product.vendor.name,
		};
	}

	if (product.category?.name) {
		structuredData.category = product.category.name;
	}

	return structuredData;
};
