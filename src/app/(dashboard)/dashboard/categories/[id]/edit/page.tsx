'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import { adminApi } from '@/lib/admin-api';
import { Category } from '@/types/admin';
import CategoryForm from '@/components/dashboard/CategoryForm';

export default function EditCategoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const categoryId = params?.id as string;

  const { data: category, isLoading: isLoadingCategory, error } = useQuery({
    queryKey: ['admin-category', categoryId],
    queryFn: () => adminApi.getCategory(categoryId),
    enabled: !!categoryId,
    retry: 1,
    staleTime: 0,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryData, image }: { categoryData: Partial<Category>, image?: File }) => 
      adminApi.updateCategory(categoryId, categoryData, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin-categories'],
        type: 'all'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-category', categoryId] });
      router.push('/dashboard/categories');
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (categoryData: Partial<Category>, image?: File) => {
    setIsLoading(true);
    setValidationErrors({}); // Clear previous errors
    
    try {
      await updateCategoryMutation.mutateAsync({ categoryData, image });
    } catch (error: any) {
      console.error('Error updating category:', error);
      
      // Check if it's a validation error from the backend
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        const errorMessage = error.message || 'Failed to update category. Please try again.';
        alert(errorMessage); // Temporary - replace with toast when available
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/categories');
  };

  if (isLoadingCategory) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading category. Please try again.
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit {category.name} | Admin Dashboard</title>
        <meta name="description" content={`Edit category details for ${category.name} in the admin dashboard.`} />
        <meta property="og:title" content={`Edit ${category.name} | Admin Dashboard`} />
        <meta property="og:description" content={`Edit category details for ${category.name} in the admin dashboard.`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`Edit ${category.name} | Admin Dashboard`} />
        <meta name="twitter:description" content={`Edit category details for ${category.name} in the admin dashboard.`} />
      </Head>
      <CategoryForm
        mode="edit"
        category={category}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading || updateCategoryMutation.isPending}
        validationErrors={validationErrors}
      />
    </>
  );
}
