/**
 * Calculate remaining seconds from ISO date string to current time
 * @param expiresAt ISO date string (e.g., "2025-08-06T04:10:12.000000Z")
 * @returns remaining seconds (0 if expired)
 */
export function calculateRemainingSeconds(expiresAt: string): number {
	try {
		const expiryTime = new Date(expiresAt).getTime();
		const currentTime = Date.now();
		const remainingMs = expiryTime - currentTime;
		return Math.max(0, Math.floor(remainingMs / 1000));
	} catch (error) {
		console.error('Error calculating remaining seconds:', error);
		return 0;
	}
}

/**
 * Check if the given expiry time has passed
 * @param expiresAt ISO date string
 * @returns true if expired
 */
export function isExpiredTime(expiresAt: string): boolean {
	return calculateRemainingSeconds(expiresAt) === 0;
}

/**
 * Format remaining seconds for display
 * @param seconds remaining seconds
 * @returns formatted string or empty if expired
 */
export function formatRemainingTime(seconds: number): string {
	if (seconds <= 0) return '';

	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;

	if (mins > 0) {
		if (secs === 0) {
			return `Code expires in ${mins} minute${mins !== 1 ? 's' : ''}`;
		}
		return `Code expires in ${mins}:${secs.toString().padStart(2, '0')}`;
	} else {
		return `Code expires in ${secs} second${secs !== 1 ? 's' : ''}`;
	}
}
