import { useState } from 'react';
import { ProductVariant } from '@/types';
import { cn } from '@/lib/utils';

export interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant?: string;
  onChange?: (variantId: string) => void;
  label?: string;
  className?: string;
}

const VariantSelector = ({
  variants,
  selectedVariant,
  onChange,
  label,
  className,
}: VariantSelectorProps) => {
  const [selected, setSelected] = useState(selectedVariant);

  const handleSelect = (variantId: string) => {
    setSelected(variantId);
    onChange?.(variantId);
  };

  if (!variants || variants.length === 0) {
    return null;
  }

  const variantType = variants[0].type;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            onClick={() => variant.available && handleSelect(variant.id)}
            disabled={!variant.available}
            className={cn(
              'px-3 py-2 text-sm border rounded-md transition-colors',
              'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              selected === variant.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700',
              variantType === 'color' && 'min-w-[80px]'
            )}
          >
            {variantType === 'color' && variant.value && (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: variant.value }}
                />
                <span>{variant.name}</span>
              </div>
            )}
            {variantType !== 'color' && (
              <span>{variant.name}</span>
            )}
            {variant.priceAdjustment && variant.priceAdjustment > 0 && (
              <span className="text-xs text-gray-500 ml-1">
                (+${variant.priceAdjustment})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VariantSelector;
