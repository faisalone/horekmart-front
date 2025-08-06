import { FilterField, FilterConfig } from '@/components/dashboard/Filters';

export interface FilterState {
	search?: string;
	status?: string;
	category_id?: string;
	vendor_id?: string;
	sort_by?: string;
	sort_order?: 'asc' | 'desc';
	page?: number;
	per_page?: number;
	[key: string]: any;
}

export class FilterManager {
	/**
	 * Check if any filters are active (excluding pagination)
	 */
	static hasActiveFilters(filters: FilterState): boolean {
		return Object.entries(filters).some(([key, value]) => {
			if (['page', 'per_page'].includes(key)) return false;
			return value !== '' && value !== null && value !== undefined;
		});
	}

	/**
	 * Count the number of active filters
	 */
	static getActiveFilterCount(filters: FilterState): number {
		return Object.keys(filters).filter((key) => {
			const value = filters[key];
			return (
				!['page', 'per_page'].includes(key) &&
				value !== '' &&
				value !== null &&
				value !== undefined
			);
		}).length;
	}

	/**
	 * Clear all filters except pagination
	 */
	static clearAllFilters<T extends FilterState>(
		currentFilters: T
	): Partial<T> {
		return {
			search: '',
			status: '',
			category_id: '',
			vendor_id: '',
			sort_by: undefined,
			sort_order: undefined,
			page: 1,
			per_page: currentFilters.per_page || 10,
		} as Partial<T>;
	}

	/**
	 * Update a single filter field
	 */
	static updateFilter<T extends FilterState>(
		currentFilters: T,
		key: string,
		value: any
	): Partial<T> {
		return {
			...currentFilters,
			[key]: value,
			page: 1, // Reset to first page when filtering
		} as Partial<T>;
	}

	/**
	 * Update sort filters
	 */
	static updateSort<T extends FilterState>(
		currentFilters: T,
		sortBy: string,
		sortOrder: 'asc' | 'desc'
	): Partial<T> {
		return {
			...currentFilters,
			sort_by: sortBy,
			sort_order: sortOrder,
			page: 1,
		} as Partial<T>;
	}

	/**
	 * Clear sort filters
	 */
	static clearSort<T extends FilterState>(currentFilters: T): Partial<T> {
		return {
			...currentFilters,
			sort_by: undefined,
			sort_order: undefined,
			page: 1,
		} as Partial<T>;
	}

	/**
	 * Get the combined sort value for display
	 */
	static getSortValue(filters: FilterState): string {
		if (!filters.sort_by || !filters.sort_order) return '';
		return `${filters.sort_by}_${filters.sort_order}`;
	}

	/**
	 * Get active filter entries for display
	 */
	static getActiveFilterEntries(filters: FilterState): Array<[string, any]> {
		return Object.entries(filters).filter(([key, value]) => {
			if (['page', 'per_page'].includes(key)) return false;
			return value !== '' && value !== null && value !== undefined;
		});
	}

	/**
	 * Get display label for a filter key
	 */
	static getFilterDisplayLabel(key: string): string {
		const labels: Record<string, string> = {
			search: 'Search',
			status: 'Status',
			category_id: 'Category',
			vendor_id: 'Vendor',
			sort_by: 'Sort By',
			sort_order: 'Sort Order',
		};

		return (
			labels[key] ||
			key.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
		);
	}

	/**
	 * Get sort option label from config
	 */
	static getSortOptionLabel(
		config: FilterConfig,
		sortBy: string,
		sortOrder: string
	): string {
		const sortField = config.fields.find((f) => f.type === 'sort');
		const sortOption = sortField?.options?.find(
			(opt) => opt.value === `${sortBy}_${sortOrder}`
		);
		return sortOption?.label || `${sortBy} ${sortOrder}`;
	}

	/**
	 * Format filter value for display (truncate if too long)
	 */
	static formatFilterValue(
		value: any,
		maxLength: number = 15,
		valueMap?: Record<string, string>
	): string {
		// Use mapped value if available
		const displayValue = valueMap?.[String(value)] || String(value);
		return displayValue.length > maxLength
			? displayValue.slice(0, maxLength) + '...'
			: displayValue;
	}

	/**
	 * Get display value for a filter field using options from config
	 */
	static getFilterValueDisplay(
		fieldKey: string,
		value: any,
		config: FilterConfig,
		maxLength: number = 15
	): string {
		// Find the field in config
		const field = config.fields.find((f) => f.key === fieldKey);

		if (field?.options && field.options.length > 0) {
			// Find the option that matches the value
			const option = field.options.find(
				(opt) => opt.value === String(value)
			);
			if (option) {
				return option.label.length > maxLength
					? option.label.slice(0, maxLength) + '...'
					: option.label;
			}
		}

		// Fallback to original formatting
		return this.formatFilterValue(value, maxLength);
	}
	/**
	 * Validate filter configuration
	 */
	static validateConfig(config: FilterConfig): boolean {
		if (!config.fields || !Array.isArray(config.fields)) {
			console.error('Filter config must have fields array');
			return false;
		}

		for (const field of config.fields) {
			if (!field.key || !field.type) {
				console.error('Each filter field must have key and type');
				return false;
			}
		}

		return true;
	}

	/**
	 * Get placeholder text based on field type
	 */
	static getFieldPlaceholder(field: FilterField): string {
		const defaultPlaceholders: Record<string, string> = {
			search: 'Search...',
			select: 'Select option...',
			sort: 'Sort by...',
		};

		return (
			field.placeholder ||
			defaultPlaceholders[field.type] ||
			'Enter value...'
		);
	}
}

export default FilterManager;
