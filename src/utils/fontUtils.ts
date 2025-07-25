/**
 * Utility functions for font management and text detection
 */

/**
 * Checks if a text contains Bengali characters
 * @param text - The text to check
 * @returns boolean - true if the text contains Bengali characters
 */
export function containsBengali(text: string): boolean {
	if (!text) return false;

	// Bengali Unicode range: \u0980-\u09FF
	const bengaliRegex = /[\u0980-\u09FF]/;
	return bengaliRegex.test(text);
}

/**
 * Returns the appropriate font class based on text content
 * @param text - The text to analyze
 * @returns string - CSS class name for the appropriate font
 */
export function getTextFontClass(text: string): string {
	if (containsBengali(text)) {
		return 'font-bengali';
	}
	return 'font-quicksand'; // Default English font
}

/**
 * Returns the appropriate font class for mixed content (both English and Bengali)
 * @param text - The text to analyze
 * @returns string - CSS class name for mixed font support
 */
export function getMixedFontClass(text: string): string {
	if (containsBengali(text)) {
		return 'font-mixed'; // Supports both Bengali and English
	}
	return 'font-quicksand'; // Default English font
}

/**
 * Higher-order component utility to automatically apply font based on text content
 * @param text - The text content
 * @param additionalClasses - Additional CSS classes to apply
 * @returns string - Complete CSS class string
 */
export function getAutoFontClasses(
	text: string,
	additionalClasses: string = ''
): string {
	const fontClass = getMixedFontClass(text);
	return `${fontClass} ${additionalClasses}`.trim();
}

/**
 * Specific Bengali text styling classes
 */
export const bengaliTextClasses = {
	normal: 'font-bengali text-base leading-relaxed',
	bold: 'font-bengali font-semibold text-base leading-relaxed',
	heading: 'font-bengali font-bold text-lg leading-tight',
	large: 'font-bengali font-medium text-xl leading-tight',
	small: 'font-bengali text-sm leading-normal',
};

/**
 * Auto-font text styling classes for mixed content
 */
export const autoFontClasses = {
	normal: 'font-mixed text-base leading-relaxed',
	bold: 'font-mixed font-semibold text-base leading-relaxed',
	heading: 'font-mixed font-bold text-lg leading-tight',
	large: 'font-mixed font-medium text-xl leading-tight',
	small: 'font-mixed text-sm leading-normal',
};
