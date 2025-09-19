import { Metadata } from 'next';
import { publicApi } from './public-api';
import { Product, Category } from '@/types';

interface SiteSettings {
	site_name: string;
	site_description: string;
	site_url: string;
	site_logo: string;
	keywords: string;
	og_image: string;
	author?: string;
	theme_color?: string;
}

class SEOService {
	private siteSettings: SiteSettings | null = null;

	/**
	 * Get cached site settings or fetch them
	 * Handles build-time gracefully when backend isn't available
	 */
	private async getSiteSettings(): Promise<SiteSettings> {
		if (!this.siteSettings) {
			try {
				this.siteSettings = await publicApi.getSiteSettings();
			} catch (error) {
				// During build time or when backend is unavailable, use fallback settings
				console.warn(
					'Failed to fetch site settings for SEO, using fallbacks:',
					error
				);
				this.siteSettings = {
					site_name: 'Horekmart',
					site_description:
						'Your trusted eCommerce platform for quality products',
					site_url:
						process.env.NEXT_PUBLIC_SITE_URL ||
						'http://localhost:3000',
					site_logo: '/logo-light.svg',
					keywords:
						'ecommerce,online shopping,electronics,fashion,home goods,quality products',
					og_image:
						process.env.NEXT_PUBLIC_SITE_URL +
							'/site-preview.jpg' ||
						'http://localhost:3000/site-preview.jpg',
				};
			}
		}
		return this.siteSettings!;
	}

	/**
	 * Generate canonical URL based on current path
	 */
	private generateCanonicalUrl(path: string, siteUrl?: string): string {
		const baseUrl =
			siteUrl ||
			process.env.NEXT_PUBLIC_SITE_URL ||
			'https://localhost:3000';
		return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
	}

	/**
	 * Generate default site metadata
	 */
	async generateDefaultMetadata(path: string = '/'): Promise<Metadata> {
		const settings = await this.getSiteSettings();

		return {
			title: settings.site_name,
			description: settings.site_description,
			keywords: settings.keywords,
			authors: [
				{
					name: settings.author || settings.site_name,
				},
			],
			metadataBase: new URL(
				settings.site_url ||
					process.env.NEXT_PUBLIC_SITE_URL ||
					'https://localhost:3000'
			),
			alternates: {
				canonical: this.generateCanonicalUrl(path, settings.site_url),
			},
			openGraph: {
				title: settings.site_name,
				description: settings.site_description,
				url: this.generateCanonicalUrl(path, settings.site_url),
				siteName: settings.site_name,
				images: [
					{
						url: settings.og_image || settings.site_logo || '',
						width: 1200,
						height: 630,
						alt: settings.site_name,
					},
				],
				locale: 'en_US',
				type: 'website',
			},
			twitter: {
				card: 'summary_large_image',
				title: settings.site_name,
				description: settings.site_description,
				images: [settings.og_image || settings.site_logo || ''],
			},
			other: {
				'theme-color': settings.theme_color || '#1e40af',
			},
		};
	}

	/**
	 * Generate product-specific metadata
	 */
	async generateProductMetadata(
		product: Product,
		categorySlug?: string
	): Promise<Metadata> {
		const settings = await this.getSiteSettings();

		// Generate product URL path
		const productPath = categorySlug
			? `/products/${categorySlug}/${product.slug}`
			: `/products/${product.slug}`;

		// Use product SEO fields or fallback to product data
		const title =
			product.meta_title || `${product.name} | ${settings.site_name}`;
		const description =
			product.meta_description ||
			product.short_description ||
			product.description?.replace(/<[^>]*>/g, '').substring(0, 160);
		const keywords =
			product.meta_keywords ||
			`${product.name}, ${product.category?.name}`;

		// Use first product image or thumbnail for og:image - backend already provides full URLs
		const productImage =
			product.thumb ||
			(product.images && product.images.length > 0
				? product.images[0].url
				: null) ||
			settings.og_image ||
			'';

		const ogTitle = product.og_title || title;
		const ogDescription = product.og_description || description;

		return {
			title,
			description,
			keywords,
			authors: [
				{
					name: settings.author || settings.site_name,
				},
			],
			alternates: {
				canonical: this.generateCanonicalUrl(
					productPath,
					settings.site_url
				),
			},
			openGraph: {
				title: ogTitle,
				description: ogDescription,
				url: this.generateCanonicalUrl(productPath, settings.site_url),
				siteName: settings.site_name,
				images: [
					{
						url: productImage,
						width: 1200,
						height: 630,
						alt: product.name,
					},
				],
				locale: 'en_US',
				type: 'website', // Use 'website' type as 'product' is not supported in Next.js
			},
			twitter: {
				card: 'summary_large_image',
				title: ogTitle,
				description: ogDescription,
				images: [productImage],
			},
			other: {
				'theme-color': settings.theme_color || '#1e40af',
			},
		};
	}

	/**
	 * Generate category-specific metadata
	 */
	async generateCategoryMetadata(category: Category): Promise<Metadata> {
		const settings = await this.getSiteSettings();

		const categoryPath = `/products/${category.slug}`;
		const title = `${category.name} | ${settings.site_name}`;
		const description =
			category.description ||
			`Shop ${category.name} products at ${settings.site_name}. ${settings.site_description}`;
		const keywords = `${category.name}, ${category.slug}`;

		// Use category image or fallback to site image - backend already provides full URLs
		const categoryImage = category.image_url || settings.og_image || '';

		return {
			title,
			description,
			keywords,
			authors: [
				{
					name: settings.author || settings.site_name,
				},
			],
			alternates: {
				canonical: this.generateCanonicalUrl(
					categoryPath,
					settings.site_url
				),
			},
			openGraph: {
				title,
				description,
				url: this.generateCanonicalUrl(categoryPath, settings.site_url),
				siteName: settings.site_name,
				images: [
					{
						url: categoryImage,
						width: 1200,
						height: 630,
						alt: `${category.name} - ${settings.site_name}`,
					},
				],
				locale: 'en_US',
				type: 'website',
			},
			twitter: {
				card: 'summary_large_image',
				title,
				description,
				images: [categoryImage],
			},
			other: {
				'theme-color': settings.theme_color || '#1e40af',
			},
		};
	}
}

export const seoService = new SEOService();
