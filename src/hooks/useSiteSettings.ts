import { useState, useEffect } from 'react';
import { siteSettingsService, SiteSettings } from '@/services/siteSettings';

/**
 * Hook to access cached site settings
 * This will return the cached settings immediately if available,
 * or null if not yet loaded
 */
export function useSiteSettings() {
	const [settings, setSettings] = useState<SiteSettings | null>(() => {
		// Initialize with cached settings if available
		return siteSettingsService.getCachedSettings();
	});
	const [isLoading, setIsLoading] = useState(() => {
		// Consider loading if settings are not yet available
		return !siteSettingsService.getCachedSettings();
	});

	useEffect(() => {
		// Subscribe to settings changes
		const unsubscribe = siteSettingsService.subscribe((newSettings) => {
			setSettings(newSettings);
			setIsLoading(!newSettings);
		});

		// Cleanup subscription on unmount
		return unsubscribe;
	}, []);

	return {
		settings,
		isLoading,
		siteLogo: settings?.site_logo,
		siteName: settings?.site_name,
		siteDescription: settings?.site_description,
		siteUrl: settings?.site_url,
		contactEmail: settings?.contact_email,
		contactPhone: settings?.contact_phone,
		socialFacebook: settings?.social_facebook,
		socialTwitter: settings?.social_twitter,
		socialInstagram: settings?.social_instagram,
		currency: settings?.currency || 'BDT',
		maintenanceMode: settings?.maintenance_mode || false,
		registrationEnabled: settings?.registration_enabled !== false, // Default to true
	};
}

/**
 * Hook to get a specific setting value
 */
export function useSiteSetting(key: string) {
	const { settings } = useSiteSettings();
	return settings ? settings[key] : null;
}
