'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import { adminApi } from '@/lib/admin-api';
import { Product } from '@/types/admin';
import ProductForm from '@/components/admin/ProductForm';
import { getProductMetaImageUrl } from '@/lib/utils';

interface UploadedImage {
  id?: number;
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
    mutationFn: (productData: Partial<Product>) => adminApi.updateProduct(productId, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
      router.push('/admin/products');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
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
      // First update the product
      await adminApi.updateProduct(productId, productData);
      
      // Then upload thumbnail if provided and it's a File
      if (thumbnail && thumbnail instanceof File) {
        try {
          await adminApi.uploadProductThumbnail(productId, thumbnail);
        } catch (error: any) {
          console.error('Error uploading thumbnail:', error);
          // Show user-friendly error message but don't stop the process
          // You could add a toast notification here if needed
        }
      }
      
      // Then upload images if provided
      const newImageFiles = images.filter(img => !img.isExisting && img.file && img.file instanceof File);
      if (newImageFiles.length > 0) {
        try {
          // Extract the files and their sort orders
          const imageFiles = newImageFiles.map(img => img.file!);
          const sortOrders = newImageFiles.map(img => img.sort_order || 0);
          
          console.log('Uploading images with sort orders:', sortOrders);
          
          // Pass both files and sort orders to the API
          await adminApi.uploadProductImages(productId, imageFiles, sortOrders);
        } catch (error: any) {
          console.error('Error uploading images:', error);
          // Show user-friendly error message but don't stop the process
          // You could add a toast notification here if needed
        }
      }
      
      // Invalidate queries and redirect
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
      router.push('/admin/products');
      
    } catch (error: any) {
      console.error('Error updating product:', error);
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to update product. Please try again.';
      // You could add a toast notification here
      alert(errorMessage); // Temporary - replace with toast when available
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
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
    <>
      {/* Meta tags for admin product edit page */}
      <Head>
        <title>Edit {product.name} | Admin Dashboard</title>
        <meta name="description" content={`Edit product details for ${product.name} in the admin dashboard.`} />
        <meta property="og:title" content={`Edit ${product.name} | Admin Dashboard`} />
        <meta property="og:description" content={`Edit product details for ${product.name} in the admin dashboard.`} />
        <meta property="og:image" content={getProductMetaImageUrl(product)} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Edit ${product.name} | Admin Dashboard`} />
        <meta name="twitter:description" content={`Edit product details for ${product.name} in the admin dashboard.`} />
        <meta name="twitter:image" content={getProductMetaImageUrl(product)} />
      </Head>
      <ProductForm
        mode="edit"
        product={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading || updateProductMutation.isPending}
      />
    </>
  );
}
