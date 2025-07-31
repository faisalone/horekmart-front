import { ApiProductVariant } from '@/types';

export interface VariationOption {
	id: number;
	name: string;
	slug: string;
	variation_id: number;
	created_at?: string;
	updated_at?: string;
	variation: {
		id: number;
		name: string;
		slug: string;
		created_at?: string;
		updated_at?: string;
	};
}

export interface AvailableVariations {
	[variationName: string]: VariationOption[];
}

export interface SelectedOptions {
	[variationName: string]: string;
}

/**
 * Advanced Variant Selection Engine
 * Handles complex variant logic, availability checking, and option combinations
 */
export class VariantSelectionEngine {
	private variants: ApiProductVariant[];
	private availableVariations: AvailableVariations;
	private selectedOptions: SelectedOptions;

	constructor(
		variants: ApiProductVariant[],
		availableVariations: AvailableVariations,
		selectedOptions: SelectedOptions = {}
	) {
		this.variants = variants;
		this.availableVariations = availableVariations;
		this.selectedOptions = selectedOptions;
	}

	/**
	 * Update selected options and return new selection state
	 */
	updateSelection(
		variationName: string,
		valueId: string
	): {
		newSelectedOptions: SelectedOptions;
		selectedVariant: ApiProductVariant | null;
	} {
		const newSelectedOptions = { ...this.selectedOptions };

		// Toggle selection - if already selected, unselect it
		if (newSelectedOptions[variationName] === valueId) {
			delete newSelectedOptions[variationName];
		} else {
			newSelectedOptions[variationName] = valueId;
		}

		// Find matching variant only if ALL variation types have selected values
		const selectedVariant = this.findMatchingVariant(newSelectedOptions);

		return {
			newSelectedOptions,
			selectedVariant,
		};
	}

	/**
	 * Find a variant that matches the given selection options
	 */
	private findMatchingVariant(
		options: SelectedOptions
	): ApiProductVariant | null {
		const selectedKeys = Object.keys(options);
		const availableKeys = Object.keys(this.availableVariations);

		// Only find variant if all variation types are selected
		if (selectedKeys.length !== availableKeys.length) {
			return null;
		}

		return (
			this.variants.find((variant) => {
				return selectedKeys.every((variationKey) => {
					const selectedValueId = options[variationKey];

					// Check if this variant has the selected value for this variation
					return variant.variation_values?.some(
						(value) =>
							value.variation.name === variationKey &&
							value.id.toString() === selectedValueId
					);
				});
			}) || null
		);
	}

	/**
	 * Check if a specific variant option is available given current selections
	 */
	isOptionAvailable(variationName: string, valueId: string): boolean {
		// If no options are selected, all are available
		if (Object.keys(this.selectedOptions).length === 0) {
			return true;
		}

		// Test the option by temporarily adding it to current selections
		const testOptions = {
			...this.selectedOptions,
			[variationName]: valueId,
		};

		// Check if any variant matches this combination
		return this.variants.some((variant) => {
			return Object.entries(testOptions).every(
				([variation, selectedValueId]) => {
					// Check if this variant has the selected value for this variation
					return variant.variation_values?.some(
						(value) =>
							value.variation.name === variation &&
							value.id.toString() === selectedValueId
					);
				}
			);
		});
	}

	/**
	 * Get all available options for a specific variation type
	 */
	getAvailableOptionsForVariation(variationName: string): VariationOption[] {
		return this.availableVariations[variationName] || [];
	}

	/**
	 * Check if all required variations are selected
	 */
	areAllVariationsSelected(): boolean {
		const availableKeys = Object.keys(this.availableVariations);
		const selectedKeys = Object.keys(this.selectedOptions);

		return (
			availableKeys.length > 0 &&
			availableKeys.every((key) => selectedKeys.includes(key))
		);
	}

	/**
	 * Get the currently selected variant (if all variations are selected)
	 */
	getSelectedVariant(): ApiProductVariant | null {
		if (!this.areAllVariationsSelected()) {
			return null;
		}
		return this.findMatchingVariant(this.selectedOptions);
	}

	/**
	 * Get display text for selected option in a variation
	 */
	getSelectedOptionDisplay(variationName: string): string | null {
		const selectedValueId = this.selectedOptions[variationName];
		if (!selectedValueId) return null;

		const options = this.getAvailableOptionsForVariation(variationName);
		const selectedOption = options.find(
			(option) => option.id.toString() === selectedValueId
		);

		return selectedOption?.name || null;
	}

	/**
	 * Reset all selections
	 */
	clearSelections(): SelectedOptions {
		return {};
	}

	/**
	 * Check if the product has any variations
	 */
	hasVariations(): boolean {
		return Object.keys(this.availableVariations).length > 0;
	}

	/**
	 * Get variation statistics
	 */
	getVariationStats() {
		const totalVariations = Object.keys(this.availableVariations).length;
		const selectedVariations = Object.keys(this.selectedOptions).length;
		const totalOptions = Object.values(this.availableVariations).reduce(
			(sum, options) => sum + options.length,
			0
		);

		return {
			totalVariations,
			selectedVariations,
			totalOptions,
			selectionProgress:
				totalVariations > 0 ? selectedVariations / totalVariations : 0,
		};
	}
}

/**
 * Extract available variations from variants data
 */
export const extractAvailableVariations = (
	variants: ApiProductVariant[]
): AvailableVariations => {
	const variations: AvailableVariations = {};

	variants.forEach((variant) => {
		// Use variation_values array to build available variations
		if (
			variant.variation_values &&
			Array.isArray(variant.variation_values)
		) {
			variant.variation_values.forEach((value) => {
				if (!value.variation) return; // Skip if variation is not loaded

				const variationName = value.variation.name;

				if (!variations[variationName]) {
					variations[variationName] = [];
				}

				// Check if this value is already in the list
				const existingValue = variations[variationName].find(
					(v) => v.id === value.id
				);

				if (!existingValue) {
					variations[variationName].push({
						id: value.id,
						variation_id: value.variation_id,
						name: value.name,
						slug: value.slug,
						created_at: value.created_at,
						updated_at: value.updated_at,
						variation: value.variation,
					});
				}
			});
		}
	});

	return variations;
};

/**
 * Factory function to create variant selection engine
 */
export const createVariantSelectionEngine = (
	variants: ApiProductVariant[],
	selectedOptions: SelectedOptions = {}
): VariantSelectionEngine => {
	const availableVariations = extractAvailableVariations(variants);
	return new VariantSelectionEngine(
		variants,
		availableVariations,
		selectedOptions
	);
};

/**
 * Utility function to check if a product can be added to cart
 */
export const canAddToCart = (
	isInStock: boolean,
	hasVariations: boolean,
	allVariationsSelected: boolean
): boolean => {
	if (!isInStock) return false;
	if (!hasVariations) return true;
	return allVariationsSelected;
};
