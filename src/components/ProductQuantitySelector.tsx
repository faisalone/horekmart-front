import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface ProductQuantitySelectorProps {
	quantity: number;
	currentStock: number;
	staticSoldCount: number;
	onQuantityChange: (change: number) => void;
	showSoldRemaining?: boolean;
}

/**
 * Compact quantity selector with integrated label and input field
 */
export const ProductQuantitySelector: React.FC<ProductQuantitySelectorProps> = ({
	quantity,
	currentStock,
	staticSoldCount,
	onQuantityChange,
	showSoldRemaining = false, // Default to false since sold/remaining is now in SKU section
}) => {
	return (
		<div className="space-y-2">
			{/* Compact quantity selector with integrated design */}
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-gray-700">Quantity</span>
				<div className="inline-flex items-center bg-white border border-gray-300 rounded-lg shadow-sm">
					<button
						onClick={() => onQuantityChange(-1)}
						disabled={quantity <= 1}
						className="flex items-center justify-center w-8 h-8 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg border-r border-gray-200"
						aria-label="Decrease quantity"
					>
						<Minus className="w-3.5 h-3.5 text-gray-600" />
					</button>
					<div className="flex items-center justify-center min-w-[50px] h-8 px-3 bg-gray-50 border-r border-gray-200">
						<span className="text-sm font-semibold text-gray-900">{quantity}</span>
					</div>
					<button
						onClick={() => onQuantityChange(1)}
						disabled={quantity >= currentStock}
						className="flex items-center justify-center w-8 h-8 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
						aria-label="Increase quantity"
					>
						<Plus className="w-3.5 h-3.5 text-gray-600" />
					</button>
				</div>
			</div>
			
			{/* Stock info below quantity */}
			<div className="flex items-center justify-end text-xs text-gray-500">
				<span>{currentStock} Left</span>
			</div>
		</div>
	);
};

export default ProductQuantitySelector;
