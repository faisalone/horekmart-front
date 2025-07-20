import React from 'react';
import { VariantSelectionEngine, SelectedOptions } from '@/lib/variant-selection';

interface ProductVariantSelectorProps {
	variantEngine: VariantSelectionEngine;
	selectedOptions: SelectedOptions;
	onVariantSelection: (variationName: string, valueId: string) => void;
}

/**
 * Clean variant selector component with separated logic
 */
export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
	variantEngine,
	selectedOptions,
	onVariantSelection,
}) => {
	if (!variantEngine.hasVariations()) {
		return null;
	}

	const availableVariations = Object.keys(variantEngine['availableVariations']);

	return (
		<div className="space-y-4">
			{availableVariations.map((variationName) => {
				const options = variantEngine.getAvailableOptionsForVariation(variationName);
				const selectedDisplay = variantEngine.getSelectedOptionDisplay(variationName);

				return (
					<div key={variationName}>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{variationName}
							{selectedDisplay && (
								<span className="ml-2 text-blue-600 font-semibold">
									{selectedDisplay}
								</span>
							)}
						</label>
						<div className="flex flex-wrap gap-2">
							{options.map((option) => {
								const isSelected = selectedOptions[variationName] === option.id.toString();
								const isAvailable = variantEngine.isOptionAvailable(
									variationName,
									option.id.toString()
								);

								return (
									<button
										key={option.id}
										onClick={() =>
											onVariantSelection(variationName, option.id.toString())
										}
										disabled={!isAvailable}
										className={`relative px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all cursor-pointer min-w-[60px] text-center ${
											isSelected
												? 'border-blue-500 bg-blue-500 text-white'
												: isAvailable
												? 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
												: 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
										}`}
									>
										{option.name}
									</button>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default ProductVariantSelector;
