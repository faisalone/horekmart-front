import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface VariationValue {
  id: number;
  name: string;
  slug: string;
  variation_id: number;
}

interface Variant {
  id: number;
  sku: string;
  final_price: string;
  final_offer_price?: string;
  quantity: number;
  combinations: Record<string, VariationValue[]>;
}

interface CartVariantSelectorProps {
  productId: string;
  currentVariantId?: string;
  currentVariantOptions?: Record<string, string>;
  onVariantChange: (variantId: string, variantOptions: Record<string, string>, price: number, originalPrice: number | undefined, sku: string, maxQuantity: number) => void;
}

export const CartVariantSelector: React.FC<CartVariantSelectorProps> = ({
  productId,
  currentVariantId,
  currentVariantOptions,
  onVariantChange,
}) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(currentVariantOptions || {});
  const [availableVariations, setAvailableVariations] = useState<Record<string, VariationValue[]>>({});

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  useEffect(() => {
    if (currentVariantOptions) {
      setSelectedOptions(currentVariantOptions);
    }
  }, [currentVariantOptions]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/v1/products/${productId}/variants`);
      const data = await response.json();
      
      if (data.success && data.data.variants) {
        setVariants(data.data.variants);
        extractAvailableVariations(data.data.variants);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractAvailableVariations = (variants: Variant[]) => {
    const variations: Record<string, VariationValue[]> = {};
    
    variants.forEach(variant => {
      Object.entries(variant.combinations).forEach(([variationName, values]) => {
        if (!variations[variationName]) {
          variations[variationName] = [];
        }
        
        values.forEach(value => {
          const existing = variations[variationName].find(v => v.id === value.id);
          if (!existing) {
            variations[variationName].push(value);
          }
        });
      });
    });
    
    setAvailableVariations(variations);
  };

  const findMatchingVariant = (options: Record<string, string>): Variant | null => {
    return variants.find(variant => {
      return Object.entries(options).every(([variationName, selectedValue]) => {
        const variantValues = variant.combinations[variationName];
        return variantValues?.some(value => value.name === selectedValue);
      });
    }) || null;
  };

  const handleVariationChange = (variationName: string, selectedValue: string) => {
    const newOptions = { ...selectedOptions, [variationName]: selectedValue };
    setSelectedOptions(newOptions);
    
    // Check if all variations are selected
    const allVariationsSelected = Object.keys(availableVariations).every(
      variation => newOptions[variation]
    );
    
    if (allVariationsSelected) {
      const matchingVariant = findMatchingVariant(newOptions);
      if (matchingVariant) {
        // Use offer price if available, otherwise use regular price
        const finalPrice = matchingVariant.final_offer_price 
          ? parseFloat(matchingVariant.final_offer_price)
          : parseFloat(matchingVariant.final_price);
        
        const regularPrice = parseFloat(matchingVariant.final_price);
        const originalPrice = matchingVariant.final_offer_price && regularPrice > finalPrice ? regularPrice : undefined;
          
        onVariantChange(
          matchingVariant.id.toString(),
          newOptions,
          finalPrice,
          originalPrice,
          matchingVariant.sku,
          matchingVariant.quantity
        );
      }
    }
  };

  const getAvailableValuesForVariation = (variationName: string): VariationValue[] => {
    // Filter available values based on other selected options
    const otherSelections = Object.entries(selectedOptions).filter(([key]) => key !== variationName);
    
    if (otherSelections.length === 0) {
      return availableVariations[variationName] || [];
    }
    
    // Find variants that match other selections and get available values for this variation
    const compatibleVariants = variants.filter(variant => {
      return otherSelections.every(([otherVariation, otherValue]) => {
        const variantValues = variant.combinations[otherVariation];
        return variantValues?.some(value => value.name === otherValue);
      });
    });
    
    const availableValues: VariationValue[] = [];
    compatibleVariants.forEach(variant => {
      const values = variant.combinations[variationName];
      if (values) {
        values.forEach(value => {
          if (!availableValues.find(v => v.id === value.id)) {
            availableValues.push(value);
          }
        });
      }
    });
    
    return availableValues;
  };

  const getCurrentVariant = () => {
    if (currentVariantId) {
      return variants.find(v => v.id.toString() === currentVariantId);
    }
    return findMatchingVariant(selectedOptions);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading variants...</div>;
  }

  if (Object.keys(availableVariations).length === 0) {
    return null;
  }

  const currentVariant = getCurrentVariant();

  return (
    <div className="space-y-3">
      {/* Variant selectors with labels */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(availableVariations).map(([variationName, allValues]) => {
          const availableValues = getAvailableValuesForVariation(variationName);
          const selectedValue = selectedOptions[variationName];
          
          return (
            <div key={variationName} className="flex-1 min-w-32">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {variationName}:
              </label>
              <select
                value={selectedValue || ''}
                onChange={(e) => handleVariationChange(variationName, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select {variationName}</option>
                {availableValues.map(value => (
                  <option key={value.id} value={value.name}>
                    {value.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};
