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
    <div className="sticky top-0 z-20 bg-gray-900 border-b border-gray-700 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-white sm:text-2xl line-clamp-2">
            {title}
          </h1>
          <p className="mt-1 text-xs text-gray-400 sm:text-sm">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          {children && (
            <div className="flex flex-wrap justify-end gap-2">
              {children}
            </div>
          )}
          <div className="flex flex-col items-stretch gap-2">
            <Button
              type={formId ? "submit" : "button"}
              onClick={!formId ? onSubmit : undefined}
              disabled={isLoading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              form={formId}
            >
              {isLoading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="sm:ml-2">
                    {mode === 'create' ? `Create ${entityName}` : `Update ${entityName}`}
                  </span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
