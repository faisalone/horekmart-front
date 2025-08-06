'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { adminApi } from '@/lib/admin-api';
import { Category } from '@/types/admin';
import CategoryForm from '@/components/dashboard/CategoryForm';

export default function AddCategoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: ({ categoryData, image }: { categoryData: Partial<Category>, image?: File }) => 
      adminApi.createCategory(categoryData, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin-categories'],
        type: 'all'
      });
      router.push('/dashboard/categories');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (categoryData: Partial<Category>, image?: File) => {
    setIsLoading(true);
    setValidationErrors({}); // Clear previous errors
    
    try {
      await createCategoryMutation.mutateAsync({ categoryData, image });
    } catch (error: any) {
      console.error('Error creating category:', error);
      
      // Check if it's a validation error from the backend
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        const errorMessage = error.message || 'Failed to create category. Please try again.';
        alert(errorMessage); // Temporary - replace with toast when available
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/categories');
  };

  return (
    <>
      <Head>
        <title>Add New Category | Admin Dashboard</title>
        <meta name="description" content="Add a new category to organize your products." />
        <meta property="og:title" content="Add New Category | Admin Dashboard" />
        <meta property="og:description" content="Add a new category to organize your products." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Add New Category | Admin Dashboard" />
        <meta name="twitter:description" content="Add a new category to organize your products." />
      </Head>
      <CategoryForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading || createCategoryMutation.isPending}
        validationErrors={validationErrors}
      />
    </>
  );
}
