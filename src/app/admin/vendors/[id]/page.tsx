'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/Badge';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Check,
  X,
  Pause,
  Building,
  User,
} from 'lucide-react';

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const vendorId = params.id as string;
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'danger' | 'warning' | 'success';
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ['admin-vendor', vendorId],
    queryFn: () => adminApi.getVendor(vendorId),
    enabled: !!vendorId,
  });

  // Mutations for vendor actions
  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendor', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.rejectVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendor', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: number) => adminApi.suspendVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendor', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
  });

  const handleApprove = () => {
    if (!vendor) return;
    setConfirmDialog({
      open: true,
      title: 'Approve Vendor',
      description: `Are you sure you want to approve "${vendor.business_name}"? This will allow them to start selling on the platform.`,
      variant: 'success',
      onConfirm: () => approveMutation.mutate(vendor.id),
    });
  };

  const handleReject = () => {
    if (!vendor) return;
    setConfirmDialog({
      open: true,
      title: 'Reject Vendor',
      description: `Are you sure you want to reject "${vendor.business_name}"? They will not be able to sell on the platform.`,
      variant: 'danger',
      onConfirm: () => rejectMutation.mutate(vendor.id),
    });
  };

  const handleSuspend = () => {
    if (!vendor) return;
    setConfirmDialog({
      open: true,
      title: 'Suspend Vendor',
      description: `Are you sure you want to suspend "${vendor.business_name}"? They will be temporarily blocked from selling.`,
      variant: 'warning',
      onConfirm: () => suspendMutation.mutate(vendor.id),
    });
  };

  const isUpdating = approveMutation.isPending || rejectMutation.isPending || suspendMutation.isPending;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-900/30 text-emerald-300 border border-emerald-600/30';
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-300 border border-yellow-600/30';
      case 'rejected':
        return 'bg-red-900/30 text-red-300 border border-red-600/30';
      case 'suspended':
        return 'bg-gray-600/30 text-gray-300 border border-gray-500/30';
      default:
        return 'bg-gray-600/30 text-gray-300 border border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-400">Loading vendor details...</div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2 text-white">Vendor Not Found</h3>
          <p className="text-gray-400 mb-4">The vendor you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/vendors')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/vendors')}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{vendor.business_name}</h1>
            <p className="text-gray-400 mt-1">Vendor Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(vendor.status)}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              vendor.status === 'approved' ? 'bg-emerald-400' :
              vendor.status === 'pending' ? 'bg-yellow-400' :
              vendor.status === 'rejected' ? 'bg-red-400' : 'bg-gray-400'
            }`} />
            {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
          </div>
          
          {vendor.status === 'pending' && (
            <>
              <Button
                onClick={handleApprove}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isUpdating}
                className="border-red-600 text-red-400 hover:bg-red-600/20"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          
          {vendor.status === 'approved' && (
            <Button
              variant="outline"
              onClick={handleSuspend}
              disabled={isUpdating}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
            >
              <Pause className="w-4 h-4 mr-2" />
              Suspend
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Business Name</label>
                  <p className="text-white">{vendor.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Registration Number</label>
                  <p className="text-white">{vendor.business_registration_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Commission Rate</label>
                  <p className="text-white">{vendor.commission_rate}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <p className="text-white">{vendor.is_active ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
              {vendor.description && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Description</label>
                  <p className="text-white">{vendor.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Contact Person</label>
                  <p className="text-white">{vendor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <p className="text-white">{vendor.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Phone</label>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <p className="text-white">{vendor.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Address</label>
                  <p className="text-white">{vendor.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">City</label>
                  <p className="text-white">{vendor.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">State</label>
                  <p className="text-white">{vendor.state}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Country</label>
                  <p className="text-white">{vendor.country}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Postal Code</label>
                  <p className="text-white">{vendor.postal_code}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendor.status === 'pending' && (
                <>
                  <Button
                    onClick={handleApprove}
                    disabled={isUpdating}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Vendor
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={isUpdating}
                    className="w-full border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Vendor
                  </Button>
                </>
              )}
              
              {vendor.status === 'approved' && (
                <Button
                  variant="outline"
                  onClick={handleSuspend}
                  disabled={isUpdating}
                  className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Suspend Vendor
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-white">Registration</p>
                    <p className="text-xs text-gray-400">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {vendor.approved_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-white">Approved</p>
                      <p className="text-xs text-gray-400">
                        {new Date(vendor.approved_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-white">Last Updated</p>
                    <p className="text-xs text-gray-400">
                      {new Date(vendor.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.documents ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-white">Document Available</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                      View
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No documents uploaded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
        isLoading={isUpdating}
        confirmText={
          confirmDialog.variant === 'success' ? 'Approve' :
          confirmDialog.variant === 'danger' ? 'Reject' :
          confirmDialog.variant === 'warning' ? 'Suspend' : 'Confirm'
        }
      />
    </div>
  );
}
