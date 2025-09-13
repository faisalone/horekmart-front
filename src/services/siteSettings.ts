import { SiteConfig, SEOData } from '@/types';

export interface SiteSettings {
	site_name?: string;
	site_description?: string;
	site_url?: string;
	site_logo?: string;
	site_favicon?: string;
	seo_title?: string;
	seo_description?: string;
	seo_keywords?: string;
	seo_og_image?: string;
	contact_email?: string;
	contact_phone?: string;
	contact_address?: string;
	social_facebook?: string;
	social_twitter?: string;
	social_instagram?: string;
	business_hours?: string;
	currency?: string;
	maintenance_mode?: boolean;
	registration_enabled?: boolean;
	[key: string]: any;
}

class SiteSettingsService {
	private static instance: SiteSettingsService;
	private readonly STORAGE_KEY = 'site_settings';
	private settings: SiteSettings | null = null;
	private loadingPromise: Promise<SiteSettings> | null = null;

	private constructor() {
		// Load settings from sessionStorage on initialization
		this.loadFromSession();
	}

	public static getInstance(): SiteSettingsService {
		if (!SiteSettingsService.instance) {
			SiteSettingsService.instance = new SiteSettingsService();
		}
		return SiteSettingsService.instance;
	}

	/**
	 * Load settings from sessionStorage
	 */
	private loadFromSession(): void {
		// Only try to access sessionStorage in browser environment
		if (
			typeof window === 'undefined' ||
			typeof sessionStorage === 'undefined'
		) {
			return;
		}

		try {
			const stored = sessionStorage.getItem(this.STORAGE_KEY);
			if (stored) {
				this.settings = JSON.parse(stored);
			}
		} catch (error) {
			console.warn('Failed to load site settings from session:', error);
		}
	}

	/**
	 * Save settings to sessionStorage
	 */
	private saveToSession(settings: SiteSettings): void {
		// Only try to access sessionStorage in browser environment
		if (
			typeof window === 'undefined' ||
			typeof sessionStorage === 'undefined'
		) {
			// Just store in memory for server-side rendering
			this.settings = settings;
			return;
		}

		try {
			sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
			this.settings = settings;
		} catch (error) {
			console.warn('Failed to save site settings to session:', error);
		}
	}

	/**
	 * Fetch site settings from API (only called once per session)
	 */
	public async fetchSiteSettings(): Promise<SiteSettings> {
		// Return cached settings if available
		if (this.settings) {
			return this.settings;
		}

		// If already loading, return the existing promise
		if (this.loadingPromise) {
			return this.loadingPromise;
		}

		// Create new loading promise
		this.loadingPromise = this.performFetch();

		try {
			const result = await this.loadingPromise;
			return result;
		} finally {
			// Clear loading promise when done
			this.loadingPromise = null;
		}
	}

	/**
	 * Perform the actual fetch operation
	 */
	private async performFetch(): Promise<SiteSettings> {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/v1/site-settings`
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			if (result.success && result.data) {
				this.saveToSession(result.data);
				return result.data;
			}

			throw new Error('Invalid API response format');
		} catch (error) {
			console.warn('Failed to fetch site settings from backend:', error);
			// Return empty object as fallback
			const fallback = {};
			this.saveToSession(fallback);
			return fallback;
		}
	}

	/**
	 * Get cached settings synchronously (returns null if not loaded)
	 */
	public getCachedSettings(): SiteSettings | null {
		return this.settings;
	}

	/**
	 * Get site configuration with environment fallbacks
	 */
	public async getSiteConfig(): Promise<SiteConfig> {
		const settings = await this.fetchSiteSettings();

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
	}

	/**
	 * Clear cached settings (useful for development or logout)
	 */
	public clearCache(): void {
		this.settings = null;
		this.loadingPromise = null;
		try {
			sessionStorage.removeItem(this.STORAGE_KEY);
		} catch (error) {
			console.warn('Failed to clear site settings cache:', error);
		}
	}

	/**
	 * Initialize settings (call this on app startup)
	 */
	public async initialize(): Promise<void> {
		await this.fetchSiteSettings();
	}

	/**
	 * Get specific setting value
	 */
	public getSetting(key: string): any {
		return this.settings ? this.settings[key] : null;
	}

	/**
	 * Check if settings are loaded
	 */
	public isLoaded(): boolean {
		return this.settings !== null;
	}
}

// Export singleton instance
export const siteSettingsService = SiteSettingsService.getInstance();

// Legacy function for backward compatibility
export const getSiteConfig = async (): Promise<SiteConfig> => {
	return siteSettingsService.getSiteConfig();
};

// Export function to get cached settings synchronously
export const getCachedSiteSettings = (): SiteSettings | null => {
	return siteSettingsService.getCachedSettings();
};
