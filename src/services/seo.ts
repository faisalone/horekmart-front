import { Product, SEOData, SiteConfig } from '@/types';

// Site settings from backend API
interface SiteSettings {
	site_name?: string;
	site_description?: string;
	site_url?: string;
	seo_title?: string;
	seo_description?: string;
	seo_keywords?: string;
	seo_og_image?: string;
	[key: string]: any;
}

let cachedSiteSettings: SiteSettings | null = null;

/**
 * Fetch site settings from backend API
 */
const fetchSiteSettings = async (): Promise<SiteSettings> => {
	if (cachedSiteSettings) {
		return cachedSiteSettings;
	}

	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/v1/site-settings`
		);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		if (result.success && result.data) {
			cachedSiteSettings = result.data;
			return result.data;
		}

		throw new Error('Invalid API response format');
	} catch (error) {
		console.warn('Failed to fetch site settings from backend:', error);
		return {};
	}
};

/**
 * Site configuration - From backend API with environment fallbacks
 */
export const getSiteConfig = async (): Promise<SiteConfig> => {
	const settings = await fetchSiteSettings();

	return {
		name: settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || '',
		description:
			settings.site_description || settings.seo_description || '',
		url: settings.site_url || process.env.NEXT_PUBLIC_APP_URL || '',
		ogImage:
			settings.seo_og_image ||
			process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ||
			'',
		keywords: settings.seo_keywords
			? settings.seo_keywords.split(',').map((k) => k.trim())
			: process.env.NEXT_PUBLIC_DEFAULT_KEYWORDS?.split(',') || [],
		locale: process.env.NEXT_PUBLIC_LOCALE || 'en_US',
		type: 'website',
	};
};

/**
 * Generate SEO data for products - ONLY from backend, no frontend fallbacks
 */
export const generateProductSEO = async (
	product: Product
): Promise<SEOData> => {
	const siteConfig = await getSiteConfig();
	const productImage = getProductImage(product);

	return {
		title:
			product.meta_title ||
			(siteConfig.name
				? `${product.name} - ${siteConfig.name}`
				: product.name),
		description:
			product.meta_description || product.short_description || '',
		keywords: product.meta_keywords || '',
		canonicalUrl:
			product.canonical_url ||
			(siteConfig.url
				? `${siteConfig.url}/products/${product.slug}`
				: ''),
		ogTitle: product.og_title || product.meta_title || '',
		ogDescription: product.og_description || product.meta_description || '',
		ogImage: productImage || '',
		focusKeyword: product.focus_keyword || '',
	};
};

/**
 * Generate SEO data for category pages - ONLY from environment/backend
 */
export const generateCategorySEO = async (
	categoryName: string,
	categorySlug: string
): Promise<SEOData> => {
	const siteConfig = await getSiteConfig();

	const title = siteConfig.name
		? `${categoryName} - ${siteConfig.name}`
		: categoryName;

	const description = `Shop ${categoryName.toLowerCase()} products at ${
		siteConfig.name || 'our store'
	}. Browse our collection of quality ${categoryName.toLowerCase()} items.`;

	return {
		title,
		description,
		canonicalUrl: siteConfig.url
			? `${siteConfig.url}/products?category=${categorySlug}`
			: '',
		ogTitle: title,
		ogDescription: description,
		ogImage: siteConfig.ogImage || '',
		keywords: `${categoryName.toLowerCase()}, shop, buy, products`,
		focusKeyword: categoryName.toLowerCase(),
	};
};

/**
 * Generate SEO data for category pages using full category object
 */
export const generateCategoryPageSEO = async (
	category: any
): Promise<SEOData> => {
	const siteConfig = await getSiteConfig();

	// Build title with category name
	const title = siteConfig.name
		? `${category.name} - ${siteConfig.name}`
		: category.name;

	// Build description from category description or generate one
	const description =
		category.description ||
		`Shop ${category.name.toLowerCase()} products at ${
			siteConfig.name || 'our store'
		}. Browse our wide selection of quality ${category.name.toLowerCase()} items with fast delivery and great prices.`;

	// Use category image for OG image, fallback to site default
	const ogImage =
		category.image_url || category.image || siteConfig.ogImage || '';

	// Build canonical URL
	const canonicalUrl = siteConfig.url
		? `${siteConfig.url}/${category.slug}`
		: '';

	// Generate keywords from category name and description
	const keywords = [
		category.name.toLowerCase(),
		...(category.description
			? category.description.toLowerCase().split(/\s+/).slice(0, 5)
			: []),
		'shop',
		'buy',
		'online',
		'store',
	].join(', ');

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
	const siteConfig = await getSiteConfig();

	const structuredData: any = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: category.name,
		url: siteConfig.url ? `${siteConfig.url}/${category.slug}` : '',
		description: category.description || `Shop ${category.name} products`,
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
					name: 'Home',
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
	const siteConfig = await getSiteConfig();

	const title = siteConfig.name
		? `Search: ${searchQuery} - ${siteConfig.name}`
		: `Search: ${searchQuery}`;

	const description = `Search results for "${searchQuery}" at ${
		siteConfig.name || 'our store'
	}. Find the best products matching your search.`;

	return {
		title,
		description,
		canonicalUrl: siteConfig.url
			? `${siteConfig.url}/search?q=${encodeURIComponent(searchQuery)}`
			: '',
		ogTitle: title,
		ogDescription: description,
		ogImage: siteConfig.ogImage || '',
		keywords: `search, ${searchQuery}, products, shop, buy`,
		focusKeyword: searchQuery,
	};
};

/**
 * Generate default site SEO - ONLY from environment/backend
 */
export const generateDefaultSEO = async (): Promise<SEOData> => {
	const siteConfig = await getSiteConfig();

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
 * Generate SEO data for products page
 */
export const generateProductsPageSEO = async (): Promise<SEOData> => {
	const siteConfig = await getSiteConfig();

	const title = siteConfig.name
		? `Products - ${siteConfig.name}`
		: 'Products';

	const description =
		siteConfig.description ||
		'Browse our wide selection of quality products with great prices and fast delivery.';

	return {
		title,
		description,
		keywords:
			siteConfig.keywords?.join(', ') ||
			'products, shop, buy, online, store',
		canonicalUrl: siteConfig.url ? `${siteConfig.url}/products` : '',
		ogTitle: title,
		ogDescription: description,
		ogImage: siteConfig.ogImage || '',
	};
};

/**
 * Extract product image for OG tags
 */
const getProductImage = (product: Product): string | undefined => {
	// Try different image sources
	if (product.thumb) return product.thumb;
	if (product.image) return product.image;
	if (product.thumbnail) return product.thumbnail;
	if (product.images && product.images.length > 0) {
		const firstImage = product.images[0];
		if (typeof firstImage === 'string') return firstImage;
		if (typeof firstImage === 'object' && 'url' in firstImage)
			return firstImage.url;
		if (typeof firstImage === 'object' && 'file_url' in firstImage)
			return (firstImage as any).file_url;
	}
	return undefined;
};

/**
 * Generate structured data for products (JSON-LD) - ONLY from backend data
 */
export const generateProductStructuredData = async (product: Product) => {
	const siteConfig = await getSiteConfig();
	const productImage = getProductImage(product);

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
