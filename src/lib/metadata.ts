import { SiteSettings } from '@/services/siteSettings';

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchSiteSettingsForMetadata(): Promise<SiteSettings | null> {
	try {
		const response = await fetch(`${API_BASE_URL}/v1/site-settings`, {
			next: { revalidate: 300 }, // Cache for 5 minutes
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			console.error(
				'Failed to fetch site settings:',
				response.statusText
			);
			return null;
		}

		const data = await response.json();
		return data.data || null;
	} catch (error) {
		console.error('Error fetching site settings:', error);
		return null;
	}
}

export async function generateMetadataFromSiteSettings() {
	const settings = await fetchSiteSettingsForMetadata();

	if (!settings) {
		// Fallback to environment variables
		return {
			title: {
				default: process.env.NEXT_PUBLIC_APP_NAME || 'Horekmart',
				template: process.env.NEXT_PUBLIC_APP_NAME
					? `%s - ${process.env.NEXT_PUBLIC_APP_NAME}`
					: '%s - Horekmart',
			},
			description:
				process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
				'Your trusted eCommerce platform',
			keywords:
				process.env.NEXT_PUBLIC_DEFAULT_KEYWORDS?.split(',').filter(
					Boolean
				) || [],
		};
	}

	const siteName = settings.site_name || 'Horekmart';
	const siteDescription =
		settings.site_description || 'Your trusted eCommerce platform';
	const keywords = settings.keywords
		? settings.keywords
				.split(',')
				.map((k: string) => k.trim())
				.filter(Boolean)
		: [];
	const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_APP_URL;
	const ogImage =
		settings.og_image || process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE;
	const favicon = settings.site_favicon || '/favicon.ico';
	const author = settings.author;
	const themeColor = settings.theme_color;

	return {
		title: {
			default: siteName,
			template: `%s - ${siteName}`,
		},
		description: siteDescription,
		keywords,
		authors: author ? [{ name: author }] : undefined,
		creator: author,
		metadataBase: siteUrl ? new URL(siteUrl) : undefined,
		icons: {
			icon: favicon,
			shortcut: favicon,
			apple: favicon,
		},
		openGraph: {
			type: 'website' as const,
			locale: process.env.NEXT_PUBLIC_LOCALE || 'en_US',
			title: siteName,
			description: siteDescription,
			siteName,
			url: siteUrl,
			images: ogImage
				? [
						{
							url: ogImage,
							width: 1200,
							height: 630,
							alt: siteName,
						},
				  ]
				: [],
		},
		twitter: {
			card: 'summary_large_image' as const,
			title: siteName,
			description: siteDescription,
			images: ogImage ? [ogImage] : [],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large' as const,
				'max-snippet': -1,
			},
		},
	};
}

export async function generateViewportFromSiteSettings() {
	const settings = await fetchSiteSettingsForMetadata();

	const themeColor = settings?.theme_color || '#000000';

	return {
		themeColor: themeColor,
		width: 'device-width',
		initialScale: 1,
		maximumScale: 1,
	};
}
