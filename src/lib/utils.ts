import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrencyLegacy(
	amount: number,
	currency: string = 'USD'
): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(amount);
}

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(date);
}

export function calculateDiscountPercentage(
	originalPrice: number,
	salePrice: number
): number {
	return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

export function debounce<T extends (...args: any[]) => void>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
}

export function getProductImageUrl(product: any): string {
	// Always prioritize the first image from images collection for display purposes
	if (product.images && product.images.length > 0) {
		// Try both 'url' and 'file_url' fields to handle different API responses
		const imageUrl = product.images[0].url || product.images[0].file_url;
		if (imageUrl && imageUrl.trim() !== '') {
			return imageUrl;
		}
	}

	// Fallback to main image field if no images collection
	if (product.image && product.image.trim() !== '') {
		return product.image;
	}

	// Use a better placeholder data URL with a nice gray box
	return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2NC4zIDEwMCAxNzYgMTExLjcgMTc2IDEyNkMxNzYgMTQwLjMgMTY0LjMgMTUyITE1MCAxNTJDMTM1LjcgMTUyIDEyNCAxNFAuMyAxMjQgMTI2QzEyNCAxMTEuNyAxMzUuNyAxMDAgMTUwIDEwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEwMCAxODBIMjAwQzIwNS41IDE4MCAyMTAgMTg0LjUgMjEwIDE5MFYyMDBDMjEwIDIwNS41IDIwNS41IDIxMCAyMDAgMjEwSDEwMEM5NC41IDIxMCA5MCAyMDUuNSA5MCAyMDBWMTkwQzkwIDE4NC41IDk0LjUgMTgwIDEwMCAxODBaIiBmaWxsPSIjOUNBNEFGIi8+Cjwvc3ZnPgo=';
}

// Helper function to build product URL with category path
export function getProductUrl(product: any): string {
	// Frontend route should be /products/{category}/{slug} but API endpoint is /products/{slug}
	if (product.category && product.slug) {
		return `/products/${product.category.slug}/${product.slug}`;
	}

	// If no category, just use /products/{slug}
	if (product.slug) {
		return `/products/${product.slug}`;
	}

	// Fallback to ID-based URL only if no slug exists
	return `/products/${product.id}`;
}
