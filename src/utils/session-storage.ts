/**
 * Safe session storage utilities that handle SSR gracefully
 */

/**
 * Safely get item from sessionStorage
 * @param key The key to get from sessionStorage
 * @returns The value or null if not available/SSR
 */
export function getSessionItem(key: string): string | null {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		return sessionStorage.getItem(key);
	} catch (error) {
		console.warn('Failed to access sessionStorage:', error);
		return null;
	}
}

/**
 * Safely set item in sessionStorage
 * @param key The key to set in sessionStorage
 * @param value The value to set
 * @returns true if successful, false otherwise
 */
export function setSessionItem(key: string, value: string): boolean {
	if (typeof window === 'undefined') {
		return false;
	}

	try {
		sessionStorage.setItem(key, value);
		return true;
	} catch (error) {
		console.warn('Failed to set sessionStorage item:', error);
		return false;
	}
}

/**
 * Safely remove item from sessionStorage
 * @param key The key to remove from sessionStorage
 * @returns true if successful, false otherwise
 */
export function removeSessionItem(key: string): boolean {
	if (typeof window === 'undefined') {
		return false;
	}

	try {
		sessionStorage.removeItem(key);
		return true;
	} catch (error) {
		console.warn('Failed to remove sessionStorage item:', error);
		return false;
	}
}

/**
 * Safely clear all sessionStorage
 * @returns true if successful, false otherwise
 */
export function clearSessionStorage(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}

	try {
		sessionStorage.clear();
		return true;
	} catch (error) {
		console.warn('Failed to clear sessionStorage:', error);
		return false;
	}
}

/**
 * Check if sessionStorage is available
 * @returns true if sessionStorage is available
 */
export function isSessionStorageAvailable(): boolean {
	return typeof window !== 'undefined' && 'sessionStorage' in window;
}

// Auth-specific helpers
export const AUTH_SESSION_KEYS = {
	OTP_EXPIRES_AT: 'otp_expires_at',
	AUTH_METHODS: 'auth_methods',
	INITIAL_AUTH_METHOD: 'initial_auth_method',
} as const;

/**
 * Get auth methods from session storage
 * @returns Array of auth methods or empty array
 */
export function getAuthMethods(): string[] {
	const stored = getSessionItem(AUTH_SESSION_KEYS.AUTH_METHODS);
	if (!stored) return [];

	try {
		return JSON.parse(stored);
	} catch (error) {
		console.warn(
			'Failed to parse auth methods from sessionStorage:',
			error
		);
		return [];
	}
}

/**
 * Set auth methods in session storage
 * @param methods Array of auth methods
 * @returns true if successful
 */
export function setAuthMethods(methods: string[]): boolean {
	try {
		return setSessionItem(
			AUTH_SESSION_KEYS.AUTH_METHODS,
			JSON.stringify(methods)
		);
	} catch (error) {
		console.warn(
			'Failed to stringify auth methods for sessionStorage:',
			error
		);
		return false;
	}
}

/**
 * Clear all auth-related session data
 */
export function clearAuthSession(): void {
	removeSessionItem(AUTH_SESSION_KEYS.OTP_EXPIRES_AT);
	removeSessionItem(AUTH_SESSION_KEYS.AUTH_METHODS);
	removeSessionItem(AUTH_SESSION_KEYS.INITIAL_AUTH_METHOD);
}
