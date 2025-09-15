'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Vendor } from '@/types/admin';
import VendorForm from '@/components/dashboard/VendorForm';
import { toast } from 'sonner';

export default function EditVendorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const vendorId = params?.id as string;

  const { data: vendor, isLoading: isLoadingVendor, error } = useQuery({
    queryKey: ['admin-vendor', vendorId],
    queryFn: () => adminApi.getVendor(vendorId),
    enabled: !!vendorId,
    retry: 1,
    staleTime: 0,
  });

  const updateVendorMutation = useMutation({
    mutationFn: (vendorData: Partial<Vendor>) => adminApi.updateVendor(vendorId, vendorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin-vendors'],
        type: 'all'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-vendor', vendorId] });
      toast.success('Vendor updated successfully!');
      router.push('/dashboard/vendors');
    },
    onError: (error: any) => {
      console.error('Error updating vendor:', error);
      setIsLoading(false);
      
      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors || {});
        toast.error('Please check the form for validation errors.');
      } else {
        toast.error('Failed to update vendor. Please try again.');
      }
    },
  });

  const handleSubmit = async (vendorData: Partial<Vendor>) => {
    setIsLoading(true);
    setValidationErrors({}); // Clear previous errors
    
    try {
      await updateVendorMutation.mutateAsync(vendorData);
    } catch (error: any) {
      // Error handling is done in the mutation's onError
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/vendors');
  };

  if (isLoadingVendor) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading vendor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Vendor</h1>
          <p className="text-gray-400 mb-4">Failed to load vendor information.</p>
          <button
            onClick={() => router.push('/dashboard/vendors')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-400 mb-4">Vendor Not Found</h1>
          <p className="text-gray-400 mb-4">The requested vendor could not be found.</p>
          <button
            onClick={() => router.push('/dashboard/vendors')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  return (
    <VendorForm
        vendor={vendor}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        mode="edit"
        validationErrors={validationErrors}
      />
  );
}
