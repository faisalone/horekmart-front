import { useState, useEffect, useMemo } from 'react';
import { Product, ApiProductVariant } from '@/types';
import {
	PricingEngine,
	createPricingEngine,
	PricingDisplayData,
} from '@/lib/pricing-engine';
import {
	VariantSelectionEngine,
	createVariantSelectionEngine,
	SelectedOptions,
	canAddToCart,
} from '@/lib/variant-selection';

interface UseProductPageReturn {
	// Pricing data
	pricingDisplay: PricingDisplayData;
	pricingEngine: PricingEngine;

	// Variant selection
	variantEngine: VariantSelectionEngine;
	selectedOptions: SelectedOptions;
	selectedVariant: ApiProductVariant | null;

	// Product state
	quantity: number;
	currentStock: number;
	isInStock: boolean;
	canPurchase: boolean;
	hasVariations: boolean;
	allVariationsSelected: boolean;
	staticSoldCount: number;

	// Actions
	handleVariantSelection: (variationName: string, valueId: string) => void;
	handleQuantityChange: (change: number) => void;
	setQuantity: (quantity: number) => void;
	resetSelections: () => void;
}

/**
 * Custom hook for managing product page state and logic
 * Encapsulates all pricing, variant selection, and product state management
 */
export const useProductPage = (
	product: Product | null,
	variants: ApiProductVariant[] = []
): UseProductPageReturn | null => {
	// Core state
	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
	const [selectedVariant, setSelectedVariant] =
		useState<ApiProductVariant | null>(null);
	const [quantity, setQuantity] = useState(1);

	// Static sold count (initialized once to prevent random changes)
	const [staticSoldCount] = useState(
		() => Math.floor(Math.random() * 500) + 100
	);

	// Create engines with current state - always create them but they handle null products
	const pricingEngine = useMemo(() => {
		if (!product) return null;
		return createPricingEngine(product, variants, selectedVariant);
	}, [product, variants, selectedVariant]);

	const variantEngine = useMemo(() => {
		if (!product) return null;
		return createVariantSelectionEngine(variants, selectedOptions);
	}, [product, variants, selectedOptions]);

	// Derived state
	const pricingDisplay = useMemo(() => {
		if (!pricingEngine) return null;
		return pricingEngine.getPricingDisplayData();
	}, [pricingEngine]);

	const currentStock = useMemo(() => {
		if (!pricingEngine) return 0;
		return pricingEngine.getCurrentStock();
	}, [pricingEngine]);

	const hasVariations = useMemo(() => {
		if (!variantEngine) return false;
		return variantEngine.hasVariations();
	}, [variantEngine]);

	const isInStock = useMemo(() => {
		if (!pricingEngine) return false;

		// If product has variations
		if (hasVariations) {
			// If a specific variant is selected, check that variant's stock
			if (selectedVariant) {
				return pricingEngine.isAvailableForPurchase();
			}
			// No specific variant selected, check if ANY variant has stock
			return pricingEngine.hasAnyStock();
		}

		// No variations, check base product stock
		return pricingEngine.isAvailableForPurchase();
	}, [pricingEngine, selectedVariant, hasVariations, product, variants]);

	const canPurchaseCurrentSelection = useMemo(() => {
		if (!pricingEngine) return false;
		return pricingEngine.isAvailableForPurchase();
	}, [pricingEngine]);

	const allVariationsSelected = useMemo(() => {
		if (!variantEngine) return true;
		return variantEngine.areAllVariationsSelected();
	}, [variantEngine]);

	const canPurchase = useMemo(() => {
		return canAddToCart(isInStock, hasVariations, allVariationsSelected);
	}, [isInStock, hasVariations, allVariationsSelected]);

	// Handlers
	const handleVariantSelection = (variationName: string, valueId: string) => {
		if (!variantEngine) return;

		const { newSelectedOptions, selectedVariant: newSelectedVariant } =
			variantEngine.updateSelection(variationName, valueId);

		setSelectedOptions(newSelectedOptions);
		setSelectedVariant(newSelectedVariant);

		// Reset quantity when variant changes
		setQuantity(1);
	};

	const handleQuantityChange = (change: number) => {
		const newQuantity = Math.max(
			1,
			Math.min(currentStock, quantity + change)
		);
		setQuantity(newQuantity);
	};

	const resetSelections = () => {
		setSelectedOptions({});
		setSelectedVariant(null);
		setQuantity(1);
	};

	// Update selected variant when options change
	useEffect(() => {
		if (variantEngine) {
			const newSelectedVariant = variantEngine.getSelectedVariant();
			setSelectedVariant(newSelectedVariant);
		}
	}, [selectedOptions, variantEngine]);

	// Reset quantity if it exceeds current stock
	useEffect(() => {
		if (quantity > currentStock) {
			setQuantity(Math.max(1, currentStock));
		}
	}, [currentStock, quantity]);

	// Return null if no product data
	if (!product || !pricingDisplay || !pricingEngine || !variantEngine) {
		return null;
	}

	return {
		// Pricing data
		pricingDisplay,
		pricingEngine,

		// Variant selection
		variantEngine,
		selectedOptions,
		selectedVariant,

		// Product state
		quantity,
		currentStock,
		isInStock,
		canPurchase,
		hasVariations,
		allVariationsSelected,
		staticSoldCount,

		// Actions
		handleVariantSelection,
		handleQuantityChange,
		setQuantity,
		resetSelections,
	};
};

/**
 * Hook for cart operations
 */
export const useCartOperations = (
	product: Product | null,
	selectedVariant: ApiProductVariant | null,
	selectedOptions: SelectedOptions,
	quantity: number,
	finalPrice: number
) => {
	const handleAddToCart = () => {
		if (!product) return;

		const cartItem = {
			product,
			variant: selectedVariant,
			selectedOptions,
			quantity,
			price: finalPrice,
		};
		// TODO: Implement cart functionality
	};

	const handleAddToWishlist = () => {
		if (!product) return;
		// TODO: Implement wishlist functionality
	};

	const handleBuyNow = () => {
		if (!product) return;
		// Add to cart and redirect to checkout
		handleAddToCart();
		// TODO: Redirect to checkout
	};

	return {
		handleAddToCart,
		handleAddToWishlist,
		handleBuyNow,
	};
};
