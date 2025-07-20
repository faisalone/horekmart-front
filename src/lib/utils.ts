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
	console.log('getProductImageUrl called with product:', {
		id: product.id,
		name: product.name,
		hasImages: product.images && product.images.length > 0,
		imagesCount: product.images ? product.images.length : 0,
		firstImageUrl:
			product.images && product.images.length > 0
				? product.images[0].file_url
				: null,
		mainImage: product.image,
	});

	// Always prioritize the first image from images collection for display purposes
	if (
		product.images &&
		product.images.length > 0 &&
		product.images[0].file_url &&
		product.images[0].file_url.trim() !== ''
	) {
		console.log('Using first gallery image:', product.images[0].file_url);
		return product.images[0].file_url;
	}

	// Fallback to main image field if no images collection
	if (product.image && product.image.trim() !== '') {
		console.log('Using main image field:', product.image);
		return product.image;
	}

	// Use a better placeholder data URL with a nice gray box
	console.log('Using placeholder image');
	return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2NC4zIDEwMCAxNzYgMTExLjcgMTc2IDEyNkMxNzYgMTQwLjMgMTY0LjMgMTUyITE1MCAxNTJDMTM1LjcgMTUyIDEyNCAxNDAuMyAxMjQgMTI2QzEyNCAxMTEuNyAxMzUuNyAxMDAgMTUwIDEwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEwMCAxODBIMjAwQzIwNS41IDE4MCAyMTAgMTg0LjUgMjEwIDE5MFYyMDBDMjEwIDIwNS41IDIwNS41IDIxMCAyMDAgMjEwSDEwMEM5NC41IDIxMCA5MCAyMDUuNSA5MCAyMDBWMTkwQzkwIDE4NC41IDk0LjUgMTgwIDEwMCAxODBaIiBmaWxsPSIjOUNBNEFGIi8+Cjwvc3ZnPgo=';
}

// Helper function to get meta og image (thumbnail with fallback to first image)
export function getProductMetaImageUrl(product: any): string {
	// For meta tags, prioritize thumbnail first
	if (product.thumbnail && product.thumbnail.trim() !== '') {
		return product.thumbnail;
	}

	// Fallback to first image if thumbnail is missing
	if (
		product.images &&
		product.images.length > 0 &&
		product.images[0].file_url &&
		product.images[0].file_url.trim() !== ''
	) {
		console.log(
			'Using first gallery image for meta:',
			product.images[0].file_url
		);
		return product.images[0].file_url;
	}

	// Fallback to main image field
	if (product.image && product.image.trim() !== '') {
		console.log('Using main image field for meta:', product.image);
		return product.image;
	}

	// Use placeholder as last resort
	console.log('Using placeholder image for meta');
	return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2NC4zIDEwMCAxNzYgMTExLjcgMTc2IDEyNkMxNzYgMTQwLjMgMTY0LjMgMTUyIDE1MCAxNTJDMTM1LjcgMTUyIDEyNCAxNDAuMyAxMjQgMTI2QzEyNCAxMTEuNyAxMzUuNyAxMDAgMTUwIDEwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEwMCAxODBIMjAwQzIwNS41IDE4MCAyMTAgMTg0LjUgMjEwIDE5MFYyMDBDMjEwIDIwNS41IDIwNS41IDIxMCAyMDAgMjEwSDEwMEM5NC41IDIxMCA5MCAyMDUuNSA5MCAyMDBWMTkwQzkwIDE4NC41IDk0LjUgMTgwIDEwMCAxODBaIiBmaWxsPSIjOUNBNEFGIi8+Cjwvc3ZnPgo=';
}

// Helper function to build product URL with category path
export function getProductUrl(product: any): string {
	// If product has category with parent hierarchy, build the full path
	if (product.category) {
		const categoryPath = buildCategoryPath(product.category);
		return `/products/${categoryPath}/${product.slug}`;
	}

	// Always use slug, even without category
	if (product.slug) {
		return `/products/${product.slug}`;
	}

	// Fallback to ID-based URL only if no slug exists
	return `/products/${product.id}`;
}

// Helper function to build category path from category object
function buildCategoryPath(category: any): string {
	const path = [];

	// Build path from parent to child
	if (category.parent?.parent) {
		path.push(category.parent.parent.slug);
	}
	if (category.parent) {
		path.push(category.parent.slug);
	}
	path.push(category.slug);

	return path.join('/');
}
