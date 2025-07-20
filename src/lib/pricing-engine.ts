import { Product, ApiProductVariant } from '@/types';

export interface PricingInfo {
	regularPrice: number;
	offerPrice: number | null;
	finalPrice: number;
	hasDiscount: boolean;
	savingsAmount: number;
}

export interface PricingAnalysis {
	minPrice: number;
	maxPrice: number;
	maxSavings: number;
	hasVariedPricing: boolean;
	hasAnyDiscounts: boolean;
}

export interface PricingDisplayData {
	currentPricing: PricingInfo;
	pricingAnalysis: PricingAnalysis | null;
	showPriceRange: boolean;
	showSavingsBadge: boolean;
	savingsText: string;
	hasStrikethroughPrice: boolean;
}

/**
 * Advanced Pricing Engine for eCommerce Products
 * Handles complex pricing scenarios including variants, discounts, and price ranges
 */
export class PricingEngine {
	private product: Product;
	private variants: ApiProductVariant[];
	private selectedVariant: ApiProductVariant | null;

	constructor(
		product: Product,
		variants: ApiProductVariant[] = [],
		selectedVariant: ApiProductVariant | null = null
	) {
		this.product = product;
		this.variants = variants;
		this.selectedVariant = selectedVariant;
	}

	/**
	 * Get pricing information for the current selection (variant or base product)
	 */
	getCurrentPricing(): PricingInfo {
		if (this.selectedVariant) {
			return this.getVariantPricing(this.selectedVariant);
		}
		return this.getBasePricing();
	}

	/**
	 * Get pricing information for a specific variant
	 */
	private getVariantPricing(variant: ApiProductVariant): PricingInfo {
		const variantPrice = parseFloat(variant.final_price);
		const variantOfferPrice = variant.final_offer_price
			? parseFloat(variant.final_offer_price)
			: null;

		// Handle special cases for variant pricing overrides
		let actualOfferPrice = null;
		let hasDiscount = false;

		if (variant.offer_price_override) {
			// Variant has explicit offer price override
			actualOfferPrice = variantOfferPrice;
			hasDiscount =
				actualOfferPrice !== null && actualOfferPrice < variantPrice;
		} else if (!variant.price_override) {
			// No price override, check if base product has sale price
			const baseSalePrice = this.product.sale_price
				? parseFloat(this.product.sale_price)
				: null;
			if (baseSalePrice && baseSalePrice < variantPrice) {
				actualOfferPrice = baseSalePrice;
				hasDiscount = true;
			}
		}
		// If variant has price_override but no offer_price_override, no discount

		const finalPrice = actualOfferPrice || variantPrice;
		const savingsAmount = hasDiscount ? variantPrice - finalPrice : 0;

		return {
			regularPrice: variantPrice,
			offerPrice: actualOfferPrice,
			finalPrice,
			hasDiscount,
			savingsAmount,
		};
	}

	/**
	 * Get pricing information for the base product
	 */
	private getBasePricing(): PricingInfo {
		const price = parseFloat(this.product.price);
		const salePrice = this.product.sale_price
			? parseFloat(this.product.sale_price)
			: null;
		const hasDiscount = salePrice !== null && salePrice < price;
		const finalPrice = salePrice || price;
		const savingsAmount = hasDiscount ? price - finalPrice : 0;

		return {
			regularPrice: price,
			offerPrice: salePrice,
			finalPrice,
			hasDiscount,
			savingsAmount,
		};
	}

	/**
	 * Analyze pricing across all variants to get min/max and savings info
	 */
	getPricingAnalysis(): PricingAnalysis | null {
		if (this.variants.length === 0) {
			return null;
		}

		const allPrices = this.variants.map((variant) => {
			const pricing = this.getVariantPricing(variant);
			return {
				final: pricing.finalPrice,
				regular: pricing.regularPrice,
				hasDiscount: pricing.hasDiscount,
				savings: pricing.savingsAmount,
			};
		});

		// Include base product pricing for comparison
		const basePricing = this.getBasePricing();
		allPrices.push({
			final: basePricing.finalPrice,
			regular: basePricing.regularPrice,
			hasDiscount: basePricing.hasDiscount,
			savings: basePricing.savingsAmount,
		});

		const finalPrices = allPrices.map((p) => p.final);
		const minPrice = Math.min(...finalPrices);
		const maxPrice = Math.max(...finalPrices);

		// Calculate maximum savings from actual discounts
		const discountedPrices = allPrices.filter((p) => p.hasDiscount);
		const maxSavings =
			discountedPrices.length > 0
				? Math.max(...discountedPrices.map((p) => p.savings))
				: 0;

		return {
			minPrice,
			maxPrice,
			maxSavings,
			hasVariedPricing: minPrice !== maxPrice,
			hasAnyDiscounts: allPrices.some((p) => p.hasDiscount),
		};
	}

	/**
	 * Get complete display data for the pricing section
	 */
	getPricingDisplayData(): PricingDisplayData {
		const currentPricing = this.getCurrentPricing();
		const pricingAnalysis = this.getPricingAnalysis();
		const hasVariations = this.variants.length > 0;
		const isVariantSelected = this.selectedVariant !== null;

		// Determine if we should show price range or specific price
		const showPriceRange = hasVariations && !isVariantSelected;

		// Determine savings text based on context
		let savingsText = '';
		let showSavingsBadge = false;

		if (isVariantSelected || !hasVariations) {
			// Specific selection (variant selected or no variations)
			if (currentPricing.hasDiscount) {
				savingsText = `You save BDT ${currentPricing.savingsAmount.toFixed(
					2
				)}`;
				showSavingsBadge = true;
			}
		} else if (hasVariations && pricingAnalysis?.hasAnyDiscounts) {
			// Price range with potential savings
			savingsText = `Save up to ${pricingAnalysis.maxSavings.toFixed(2)} BDT`;
			showSavingsBadge = true;
		}

		return {
			currentPricing,
			pricingAnalysis,
			showPriceRange,
			showSavingsBadge,
			savingsText,
			hasStrikethroughPrice:
				currentPricing.hasDiscount && !showPriceRange,
		};
	}

	/**
	 * Get formatted price display string
	 */
	getFormattedPriceDisplay(): string {
		const displayData = this.getPricingDisplayData();

		if (displayData.showPriceRange && displayData.pricingAnalysis) {
			const { minPrice, maxPrice, hasVariedPricing } =
				displayData.pricingAnalysis;

			if (hasVariedPricing) {
				return `BDT ${minPrice.toFixed(2)} - BDT ${maxPrice.toFixed(
					2
				)}`;
			} else {
				return `BDT ${minPrice.toFixed(2)}`;
			}
		}

		return `BDT ${displayData.currentPricing.finalPrice.toFixed(2)}`;
	}

	/**
	 * Check if the product/variant is available for purchase
	 */
	isAvailableForPurchase(): boolean {
		const stock = this.selectedVariant
			? this.selectedVariant.quantity
			: this.product.stock_quantity;

		return this.product.in_stock && stock > 0;
	}

	/**
	 * Check if the product has any available stock
	 * For products with variations: returns true if ANY variant has stock
	 * For products without variations: returns base product stock status
	 */
	hasAnyStock(): boolean {
		if (!this.product.in_stock) {
			return false;
		}

		// If there are variants, check if any variant has stock
		if (this.variants.length > 0) {
			return this.variants.some((variant) => variant.quantity > 0);
		}

		// No variants, check base product stock
		return this.product.stock_quantity > 0;
	}

	/**
	 * Get current stock quantity
	 */
	getCurrentStock(): number {
		return this.selectedVariant
			? this.selectedVariant.quantity
			: this.product.stock_quantity;
	}
}

/**
 * Factory function to create pricing engine instance
 */
export const createPricingEngine = (
	product: Product,
	variants: ApiProductVariant[] = [],
	selectedVariant: ApiProductVariant | null = null
): PricingEngine => {
	return new PricingEngine(product, variants, selectedVariant);
};

/**
 * Utility function for quick pricing calculation without instantiation
 */
export const calculateQuickPricing = (
	product: Product,
	selectedVariant?: ApiProductVariant | null
): PricingInfo => {
	const engine = new PricingEngine(product, [], selectedVariant || null);
	return engine.getCurrentPricing();
};
