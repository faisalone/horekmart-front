export interface SiteSettings {
	site_name?: string;
	site_description?: string;
	site_url?: string;
	site_logo?: string;
	site_favicon?: string;
	contact_email?: string;
	contact_phone?: string;
	contact_address?: string;
	address?: string;
	address_map_url?: string;
	company_info?: string;
	social_facebook?: string;
	social_twitter?: string;
	social_instagram?: string;
	social_youtube?: string;
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
	private subscribers: ((settings: SiteSettings | null) => void)[] = [];
	private initialized = false;

	private constructor() {
		// Load settings from sessionStorage on initialization
		this.loadFromSession();
		// Auto-initialize if not in SSR
		if (typeof window !== 'undefined') {
			this.autoInitialize();
		}
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
			this.notifySubscribers();
			return;
		}

		try {
			sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
			this.settings = settings;
			this.notifySubscribers();
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
				`${process.env.NEXT_PUBLIC_API_URL}/v1/site-settings`,
				{
					method: 'GET',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					// Add cache headers to improve response time
					cache: 'default',
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			if (result.success && result.data) {
				// Ensure we have a valid object
				const settingsData =
					typeof result.data === 'object' && result.data !== null
						? result.data
						: {};
				this.saveToSession(settingsData);
				return settingsData;
			}

			throw new Error('Invalid API response format');
		} catch (error) {
			console.warn('Failed to fetch site settings from backend:', error);
			// Don't save empty fallback to session storage on API error
			// This allows retry on next page load
			const fallback = {};
			// Only store in memory, not session storage
			this.settings = fallback;
			this.notifySubscribers();
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
	 * Auto-initialize in browser environment (non-blocking)
	 */
	private autoInitialize(): void {
		if (!this.initialized && !this.settings) {
			this.initialized = true;
			console.log('🚀 Site settings service: Auto-initializing...');
			// Start fetching in background without waiting
			this.fetchSiteSettings()
				.then((settings) => {
					console.log(
						'✅ Site settings loaded successfully:',
						Object.keys(settings).length,
						'settings'
					);
				})
				.catch((error) => {
					console.warn('❌ Auto-initialization failed:', error);
					this.initialized = false; // Allow retry
				});
		}
	}

	/**
	 * Subscribe to settings changes
	 */
	public subscribe(
		callback: (settings: SiteSettings | null) => void
	): () => void {
		this.subscribers.push(callback);
		// Immediately call with current settings
		callback(this.settings);

		return () => {
			this.subscribers = this.subscribers.filter(
				(sub) => sub !== callback
			);
		};
	}

	/**
	 * Notify subscribers of settings changes
	 */
	private notifySubscribers(): void {
		this.subscribers.forEach((callback) => callback(this.settings));
	}

	/**
	 * Clear cached settings (useful for development or logout)
	 */
	public clearCache(): void {
		this.settings = null;
		this.loadingPromise = null;
		this.initialized = false;
		try {
			sessionStorage.removeItem(this.STORAGE_KEY);
		} catch (error) {
			console.warn('Failed to clear site settings cache:', error);
		}
		this.notifySubscribers();
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

	/**
	 * Force refresh settings from API (ignores cache)
	 */
	public async refresh(): Promise<SiteSettings> {
		this.settings = null;
		this.loadingPromise = null;
		this.initialized = false;
		try {
			sessionStorage.removeItem(this.STORAGE_KEY);
		} catch (error) {
			console.warn('Failed to clear session storage:', error);
		}
		return this.fetchSiteSettings();
	}

	/**
	 * Preload settings if not already loaded (non-blocking)
	 */
	public preload(): void {
		if (!this.settings && !this.loadingPromise) {
			this.fetchSiteSettings().catch((error) => {
				console.warn('Preload failed:', error);
			});
		}
	}
}

// Export singleton instance
export const siteSettingsService = SiteSettingsService.getInstance();

// Export function to get cached settings synchronously
export const getCachedSiteSettings = (): SiteSettings | null => {
	return siteSettingsService.getCachedSettings();
};
