import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuantitySelectorProps {
  value?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

const QuantitySelector = ({
  value = 1,
  min = 1,
  max = 99,
  onChange,
  className,
  disabled = false,
}: QuantitySelectorProps) => {
  const [quantity, setQuantity] = useState(value);

  const handleDecrease = () => {
    if (quantity > min) {
      const newValue = quantity - 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      const newValue = quantity + 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    const clampedValue = Math.max(min, Math.min(max, newValue));
    setQuantity(clampedValue);
    onChange?.(clampedValue);
  };

  return (
    <div className={cn('inline-flex items-center bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden', className)}>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-r border-gray-200"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className="w-12 h-8 text-center text-sm font-semibold bg-gray-50 border-0 focus:outline-none focus:ring-0 focus:bg-white disabled:opacity-50 transition-colors"
      />
      
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-l border-gray-200"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default QuantitySelector;
