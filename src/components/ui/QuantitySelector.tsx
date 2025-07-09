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
    <div className={cn('flex items-center border border-gray-300 rounded-md', className)}>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Minus className="h-4 w-4" />
      </button>
      
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className="w-16 text-center border-0 bg-transparent focus:outline-none focus:ring-0 disabled:opacity-50"
      />
      
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};

export default QuantitySelector;
