'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Product } from '@/types/admin';
import ProductForm from '@/components/dashboard/ProductForm';
import { toast } from 'sonner';

interface UploadedImage {
  id?: number | string; // Allow both number and string for UUIDs
  file?: File;
  url?: string; // For existing images from server
  preview: string; // For blob URLs or existing URLs
  alt_text?: string;
  sort_order?: number;
  isExisting?: boolean; // Flag to identify server images vs new uploads
}

export default function AddProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: ({ product, images, thumbnail }: { 
      product: Partial<Product>, 
      images?: File[], 
      thumbnail?: File 
    }) => adminApi.createProduct(product, images, thumbnail),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin-products'],
        type: 'all'
      });
      toast.success('Product created successfully!', {
        description: 'The product has been added to your catalog.'
      });
      router.push('/dashboard/products');
    },
    onError: (error: any) => {
      console.error('Error creating product:', error);
      
      // Handle validation errors from backend (422)
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat() as string[];
        
        // Show a single consolidated error message
        if (errorMessages.length > 1) {
          toast.error('Please fix the following errors:', {
            description: errorMessages.join(' • ')
          });
        } else {
          toast.error(errorMessages[0]);
        }
      } 
      // Handle server errors (500) with specific message
      else if (error.response?.status === 500) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message, {
            description: 'Server error occurred. Please try again.'
          });
        } else {
          toast.error('Server error occurred', {
            description: 'Please check your data and try again.'
          });
        }
      }
      // Handle other backend errors
      else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } 
      // Handle network/unknown errors
      else {
        toast.error('Failed to create product', {
          description: 'Please check your connection and try again.'
        });
      }
      
      setIsLoading(false);
    },
  });

  const handleSubmit = async (
    productData: Partial<Product>, 
    images: UploadedImage[], 
    thumbnail?: File | string
  ) => {
    setIsLoading(true);
    
    try {
      // Extract image files from the images array (only new uploads)
      const imageFiles = images
        .filter(img => !img.isExisting && img.file && img.file instanceof File)
        .map(img => img.file!);
      
      // Use thumbnail only if it's a File
      const thumbnailFile = thumbnail instanceof File ? thumbnail : undefined;
      
      // Create product with images and thumbnail in one API call
      await createProductMutation.mutateAsync({
        product: productData,
        images: imageFiles.length > 0 ? imageFiles : undefined,
        thumbnail: thumbnailFile
      });
      
    } catch (error: any) {
      // Error handling is done in mutation onError, just reset loading state
      console.error('Error creating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/products');
  };

  return (
    <>
      <ProductForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading || createProductMutation.isPending}
      />
    </>
  );
}
