'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const productId = params?.id as string;

  const { data: product, isLoading: isLoadingProduct, error } = useQuery({
    queryKey: ['admin-product', productId],
    queryFn: () => adminApi.getProduct(productId),
    enabled: !!productId,
    retry: 1,
    staleTime: 0,
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ productData, images, thumbnail, orderedImages, removeThumbnail }: { 
      productData: Partial<Product>, 
      images?: File[], 
      thumbnail?: File,
      orderedImages?: Array<string>,
      removeThumbnail?: boolean
    }) => adminApi.updateProduct(productId, productData, images, thumbnail, orderedImages, removeThumbnail),
    onSuccess: () => {
      // Invalidate all admin-products queries (with any filters)
      queryClient.invalidateQueries({ 
        queryKey: ['admin-products'],
        type: 'all'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
      toast.success('Product updated successfully!', {
        description: 'All changes have been saved to your catalog.'
      });
      router.push('/dashboard/products');
    },
    onError: (error: any) => {
      console.error('Error updating product:', error);
      
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
        toast.error('Failed to update product', {
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
      // Prepare ordered images array (UUIDs for existing, empty strings for new)
      const orderedImages: Array<string> = [];
      const newImageFiles: File[] = [];
      
      // Process images in their current order following exact instructions
      images.forEach((image, index) => {
        if (image.isExisting && image.url && image.id && !image.id.toString().startsWith('temp-')) {
          // Existing image - use the actual UUID from the image object (not temporary ID)
          orderedImages.push(image.id.toString());
        } else if (image.file && image.file instanceof File) {
          // New image - use empty string and add file to new files array
          orderedImages.push('');
          newImageFiles.push(image.file);
        } else {
          // Handle edge case where image doesn't fit either category
          console.warn('Image at index', index, 'does not have required properties:', image);
        }
      });
      
      // Prepare thumbnail file - only send if it's a new File upload
      // If thumbnail is still a string (existing), don't send it to preserve existing
      // If thumbnail is null/undefined but product had one, mark for deletion
      const thumbnailFile = thumbnail instanceof File ? thumbnail : undefined;
      const shouldRemoveThumbnail = product?.thumb && !thumbnail;

      // Submit with the new approach following exact instructions
      await updateProductMutation.mutateAsync({
        productData,
        images: newImageFiles.length > 0 ? newImageFiles : undefined,
        thumbnail: thumbnailFile,
        orderedImages: orderedImages.length > 0 ? orderedImages : undefined,
        removeThumbnail: shouldRemoveThumbnail || false
      });
      
    } catch (error: any) {
      // Error handling is done in mutation onError, just reset loading state
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/products');
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading product. Please try again.
      </div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      product={product}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading || updateProductMutation.isPending}
    />
  );
}
