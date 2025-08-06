'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface FormHeaderProps {
  title: string;
  subtitle: string;
  onCancel: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
  formId?: string;
  children?: ReactNode;
  entityName?: string; // e.g., "Product", "Vendor", "Category", "Variant"
}

export default function FormHeader({
  title,
  subtitle,
  onCancel,
  onSubmit,
  isLoading = false,
  mode,
  formId,
  children,
  entityName = 'Item'
}: FormHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {title}
          </h1>
          <p className="text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {children}
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            type={formId ? "submit" : "button"}
            onClick={!formId ? onSubmit : undefined}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
            form={formId}
          >
            {isLoading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? `Create ${entityName}` : `Update ${entityName}`}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
