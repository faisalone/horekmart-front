'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { adminApi } from '@/lib/admin-api';
import { Product } from '@/types/admin';
import ProductForm from '@/components/admin/ProductForm';

interface UploadedImage {
  id?: number;
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
    mutationFn: (product: Partial<Product>) => adminApi.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      router.push('/admin/products');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
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
      // First create the product
      const createdProduct = await adminApi.createProduct(productData);
      const productId = createdProduct.id;
      
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
      router.push('/admin/products');
      
    } catch (error: any) {
      console.error('Error creating product:', error);
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to create product. Please try again.';
      // You could add a toast notification here
      alert(errorMessage); // Temporary - replace with toast when available
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  return (
    <>
      {/* Meta tags for admin add product page */}
      <Head>
        <title>Add New Product | Admin Dashboard</title>
        <meta name="description" content="Add a new product to your store through the admin dashboard." />
        <meta property="og:title" content="Add New Product | Admin Dashboard" />
        <meta property="og:description" content="Add a new product to your store through the admin dashboard." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Add New Product | Admin Dashboard" />
        <meta name="twitter:description" content="Add a new product to your store through the admin dashboard." />
      </Head>
      <ProductForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading || createProductMutation.isPending}
      />
    </>
  );
}
