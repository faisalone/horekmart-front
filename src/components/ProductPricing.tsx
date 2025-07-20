import React from 'react';
import { PricingDisplayData } from '@/lib/pricing-engine';
import { formatCurrency } from '@/lib/currency';

interface ProductPricingProps {
	pricingDisplay: PricingDisplayData;
	hasVariations: boolean;
	isVariantSelected: boolean;
}

/**
 * Clean, reusable pricing component that handles all pricing display logic
 */
export const ProductPricing: React.FC<ProductPricingProps> = ({
	pricingDisplay,
	hasVariations,
	isVariantSelected,
}) => {
	const {
		currentPricing,
		pricingAnalysis,
		showPriceRange,
		showSavingsBadge,
		savingsText,
		hasStrikethroughPrice,
	} = pricingDisplay;

	const renderSavingsBadge = () => {
		if (!showSavingsBadge) return null;

		return (
			<div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
				<span className="mr-1">💰</span>
				{savingsText}
			</div>
		);
	};

	const renderSelectedVariantPricing = () => (
		<div className="transition-all duration-500 ease-in-out transform">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-3">
					{/* Current Price - with smooth scale animation and highlight effect */}
					<div className={`text-2xl font-bold text-gray-900 price-transition ${
						isVariantSelected ? 'animate-price-change text-blue-600' : ''
					}`}>
						{formatCurrency(currentPricing.finalPrice)}
					</div>
					{/* Original Price (strikethrough) - with fade animation */}
					{hasStrikethroughPrice && (
						<div className="text-lg text-gray-500 line-through transition-all duration-300 ease-in-out">
							{formatCurrency(currentPricing.regularPrice)}
						</div>
					)}
				</div>
			</div>
			{renderSavingsBadge()}
		</div>
	);

	const renderPriceRange = () => {
		if (!pricingAnalysis) return null;

		const priceText = pricingAnalysis.hasVariedPricing
			? `${formatCurrency(pricingAnalysis.minPrice)} - ${formatCurrency(pricingAnalysis.maxPrice)}`
			: formatCurrency(pricingAnalysis.minPrice);

		return (
			<div className="transition-all duration-500 ease-in-out transform">
				<div className="text-2xl font-bold text-gray-900 mb-2 transition-all duration-300 ease-out transform hover:scale-105">
					{priceText}
				</div>
				{renderSavingsBadge()}
			</div>
		);
	};

	// Create animation key to trigger smooth transitions when switching modes
	const contentKey = showPriceRange ? 'price-range' : `variant-${isVariantSelected ? 'selected' : 'none'}`;

	if (showPriceRange) {
		return (
			<div key={contentKey} className="animate-fade-in-up">
				{renderPriceRange()}
			</div>
		);
	}

	return (
		<div key={contentKey} className="animate-fade-in-up">
			{renderSelectedVariantPricing()}
		</div>
	);
};

export default ProductPricing;
