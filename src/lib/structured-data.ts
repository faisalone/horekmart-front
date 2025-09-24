import { publicApi } from '@/lib/public-api';
import { Product, Category } from '@/types';

interface SiteSettings {
	site_name: string;
	site_description: string;
	site_url: string;
	site_logo: string;
	keywords: string;
	og_image: string;
	contact_email?: string;
	contact_phone?: string;
	contact_address?: string;
	social_facebook?: string;
	social_instagram?: string;
	social_twitter?: string;
	author?: string;
}

export interface StructuredDataType {
	'@context': string;
	'@type': string;
	[key: string]: any;
}

class StructuredDataService {
	private siteSettings: SiteSettings | null = null;

	/**
	 * Get cached site settings or fetch them
	 */
	private async getSiteSettings(): Promise<SiteSettings> {
		if (!this.siteSettings) {
			try {
				this.siteSettings = await publicApi.getSiteSettings();
			} catch (error) {
				console.warn(
					'Failed to fetch site settings for structured data, using fallbacks:',
					error
				);
				this.siteSettings = {
					site_name: 'Horekmart',
					site_description:
						'Your trusted eCommerce platform for quality products',
					site_url:
						process.env.NEXT_PUBLIC_APP_URL ||
						'http://localhost:3000',
					site_logo: '/logo-light.svg',
					keywords:
						'ecommerce,online shopping,electronics,fashion,home goods,quality products',
					og_image: '/site-preview.jpg',
					contact_email: 'business@horekmart.com',
					contact_phone: '+880 1763 223035',
					contact_address:
						'Horekmart HQ, Alam Market, Koimari Road, Jaldhaka, Nilphamari',
					social_facebook: 'https://facebook.com/horekmart',
					social_instagram: 'https://instagram.com/horekmartshop',
					social_twitter: 'https://twitter.com/horekmart',
				};
			}
		}
		return this.siteSettings!;
	}

	/**
	 * Generate base website structured data
	 */
	async generateWebsiteStructuredData(): Promise<StructuredDataType> {
		const settings = await this.getSiteSettings();

		const websiteData: StructuredDataType = {
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: settings.site_name,
			alternateName: `${settings.site_name}.com`,
			url: settings.site_url,
			description: settings.site_description,
		};

		// Add search action if it's the home page
		websiteData.potentialAction = {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${settings.site_url}/products?q={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		};

		return websiteData;
	}

	/**
	 * Generate organization structured data
	 */
	async generateOrganizationStructuredData(): Promise<StructuredDataType> {
		const settings = await this.getSiteSettings();

		const organizationData: StructuredDataType = {
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: settings.site_name,
			url: settings.site_url,
			description: settings.site_description,
			logo: {
				'@type': 'ImageObject',
				url: `${settings.site_url}${settings.site_logo}`,
				width: 200,
				height: 60,
			},
		};

		// Add contact information if available
		if (
			settings.contact_email ||
			settings.contact_phone ||
			settings.contact_address
		) {
			organizationData.contactPoint = {
				'@type': 'ContactPoint',
				contactType: 'customer service',
				...(settings.contact_email && {
					email: settings.contact_email,
				}),
				...(settings.contact_phone && {
					telephone: settings.contact_phone,
				}),
			};
		}

		// Add address if available
		if (settings.contact_address) {
			organizationData.address = {
				'@type': 'PostalAddress',
				streetAddress: settings.contact_address,
			};
		}

		// Add social media profiles
		const socialProfiles = [];
		if (settings.social_facebook)
			socialProfiles.push(settings.social_facebook);
		if (settings.social_instagram)
			socialProfiles.push(settings.social_instagram);
		if (settings.social_twitter)
			socialProfiles.push(settings.social_twitter);

		if (socialProfiles.length > 0) {
			organizationData.sameAs = socialProfiles;
		}

		return organizationData;
	}

	/**
	 * Generate product structured data
	 */
	async generateProductStructuredData(
		product: Product
	): Promise<StructuredDataType[]> {
		const settings = await this.getSiteSettings();
		const structuredDataArray: StructuredDataType[] = [];

		// Main Product schema
		const productData: StructuredDataType = {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.name,
			description: product.description || product.short_description,
			sku: product.sku || product.slug,
			brand: {
				'@type': 'Brand',
				name: product.vendor?.business_name || settings.site_name,
			},
			category: product.category?.name,
			url: `${settings.site_url}/products/${product.category?.slug}/${product.slug}`,
		};

		// Add images
		if (
			product.images &&
			Array.isArray(product.images) &&
			product.images.length > 0
		) {
			const imageUrls = product.images
				.map((img: any) => {
					if (typeof img === 'string') return img;
					return img.url || img.file_url;
				})
				.filter(Boolean);

			if (imageUrls.length > 0) {
				productData.image = imageUrls;
			}
		} else if (product.thumb) {
			productData.image = [product.thumb];
		}

		// Add offers (pricing)
		const offers: any = {
			'@type': 'Offer',
			url: `${settings.site_url}/products/${product.category?.slug}/${product.slug}`,
			priceCurrency: 'BDT',
			price: product.sale_price || product.price,
			availability: product.in_stock
				? 'https://schema.org/InStock'
				: 'https://schema.org/OutOfStock',
			seller: {
				'@type': 'Organization',
				name: settings.site_name,
			},
		};

		// Add condition (assume new unless specified)
		offers.itemCondition = 'https://schema.org/NewCondition';

		productData.offers = offers;

		// Add aggregate rating if reviews are available (uncomment when review system is implemented)
		// if (product.reviews_avg_rating && product.reviews_count) {
		// 	productData.aggregateRating = {
		// 		'@type': 'AggregateRating',
		// 		ratingValue: product.reviews_avg_rating,
		// 		reviewCount: product.reviews_count,
		// 		bestRating: 5,
		// 		worstRating: 1
		// 	};
		// }

		structuredDataArray.push(productData);

		// Add breadcrumb list
		const breadcrumbData: StructuredDataType = {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: 'Products',
					item: `${settings.site_url}/products`,
				},
			],
		};

		if (product.category) {
			breadcrumbData.itemListElement.push({
				'@type': 'ListItem',
				position: 2,
				name: product.category.name,
				item: `${settings.site_url}/${product.category.slug}`,
			});

			breadcrumbData.itemListElement.push({
				'@type': 'ListItem',
				position: 3,
				name: product.name,
				item: `${settings.site_url}/products/${product.category.slug}/${product.slug}`,
			});
		}

		structuredDataArray.push(breadcrumbData);

		return structuredDataArray;
	}

	/**
	 * Generate category/collection structured data
	 */
	async generateCategoryStructuredData(
		category: Category,
		products?: Product[]
	): Promise<StructuredDataType[]> {
		const settings = await this.getSiteSettings();
		const structuredDataArray: StructuredDataType[] = [];

		// CollectionPage schema
		const collectionData: StructuredDataType = {
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: `${category.name} | ${settings.site_name}`,
			description:
				category.description ||
				`Shop ${category.name} products at ${settings.site_name}`,
			url: `${settings.site_url}/${category.slug}`,
		};

		// Add main entity (the category itself)
		collectionData.mainEntity = {
			'@type': 'ItemList',
			name: category.name,
			description: category.description,
			numberOfItems: products?.length || 0,
		};

		// Add category image if available
		if (category.image_url) {
			collectionData.image = category.image_url;
		}

		structuredDataArray.push(collectionData);

		// Add breadcrumb
		const breadcrumbData: StructuredDataType = {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: 'Products',
					item: `${settings.site_url}/products`,
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: category.name,
					item: `${settings.site_url}/${category.slug}`,
				},
			],
		};

		structuredDataArray.push(breadcrumbData);

		return structuredDataArray;
	}

	/**
	 * Generate search results page structured data
	 */
	async generateSearchResultsStructuredData(
		searchQuery: string,
		results: Product[]
	): Promise<StructuredDataType> {
		const settings = await this.getSiteSettings();

		return {
			'@context': 'https://schema.org',
			'@type': 'SearchResultsPage',
			name: `Search results for "${searchQuery}" | ${settings.site_name}`,
			url: `${settings.site_url}/products?q=${encodeURIComponent(
				searchQuery
			)}`,
			mainEntity: {
				'@type': 'ItemList',
				numberOfItems: results.length,
				itemListElement: results.slice(0, 10).map((product, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					item: {
						'@type': 'Product',
						name: product.name,
						url: `${settings.site_url}/products/${product.category?.slug}/${product.slug}`,
						image:
							product.thumb ||
							(Array.isArray(product.images) &&
							product.images.length > 0
								? typeof product.images[0] === 'string'
									? product.images[0]
									: product.images[0].url
								: undefined),
					},
				})),
			},
		};
	}
}

export const structuredDataService = new StructuredDataService();
