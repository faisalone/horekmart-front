'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Vendor } from '@/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Badge from '@/components/ui/Badge';
import Filters from '@/components/dashboard/Filters';
import { vendorsFilterConfig } from '@/config/adminFilters';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Grid,
  List,
  MoreHorizontal,
  Download,
  Eye,
  Check,
  X,
  Pause,
  Store,
  Mail,
  Phone,
  Calendar,
  FileText,
  Building,
  Users,
  UserCheck,
  UserX,
  UserMinus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorFilters {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

function VendorsList({ 
  vendors, 
  onApprove, 
  onReject, 
  onSuspend, 
  onView, 
  isUpdating 
}: { 
  vendors: Vendor[];
  onApprove: (vendor: Vendor) => void;
  onReject: (vendor: Vendor) => void;
  onSuspend: (vendor: Vendor) => void;
  onView: (vendor: Vendor) => void;
  isUpdating: boolean;
}) {
  const router = useRouter();

  const getStatusColor = (status: Vendor['status']) => {
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

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700/50 border-b border-gray-600">
              <th className="text-left py-4 px-6 font-medium text-gray-200">Vendor</th>
              <th className="text-left py-4 px-6 font-medium text-gray-200">Contact</th>
              <th className="text-left py-4 px-6 font-medium text-gray-200">Status</th>
              <th className="text-left py-4 px-6 font-medium text-gray-200">Registered</th>
              <th className="text-left py-4 px-6 font-medium text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="group hover:bg-gray-700/20 transition-all duration-200 border-b border-gray-700/50">
                {/* Vendor Info */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                      <Store className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{vendor.business_name}</div>
                      <div className="text-sm text-gray-400">{vendor.name}</div>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="py-4 px-6">
                  <div className="text-sm space-y-1">
                    <div className="flex items-center text-gray-300">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {vendor.email}
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      {vendor.phone || 'N/A'}
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-6">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(vendor.status)}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      vendor.status === 'approved' ? 'bg-emerald-400' :
                      vendor.status === 'pending' ? 'bg-yellow-400' :
                      vendor.status === 'rejected' ? 'bg-red-400' : 'bg-gray-400'
                    }`} />
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </div>
                </td>

                {/* Registered */}
                <td className="py-4 px-6">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(vendor.created_at).toLocaleDateString()}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-600"
                          disabled={isUpdating}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                        <DropdownMenuItem 
                          onClick={() => onView(vendor)}
                          className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => router.push(`/dashboard/vendors/${vendor.id}/edit`)}
                          className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Vendor
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-600" />
                        
                        {vendor.status === 'pending' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => onApprove(vendor)}
                              className="text-green-400 hover:bg-green-600/20 focus:bg-green-600/20"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Approve Vendor
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onReject(vendor)}
                              className="text-red-400 hover:bg-red-600/20 focus:bg-red-600/20"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Reject Vendor
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {vendor.status === 'approved' && (
                          <DropdownMenuItem 
                            onClick={() => onSuspend(vendor)}
                            className="text-yellow-400 hover:bg-yellow-600/20 focus:bg-yellow-600/20"
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Suspend Vendor
                          </DropdownMenuItem>
                        )}
                        
                        {vendor.status === 'suspended' && (
                          <DropdownMenuItem 
                            onClick={() => onApprove(vendor)}
                            className="text-green-400 hover:bg-green-600/20 focus:bg-green-600/20"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Reactivate Vendor
                          </DropdownMenuItem>
                        )}
                        
                        {vendor.status === 'rejected' && (
                          <DropdownMenuItem 
                            onClick={() => onApprove(vendor)}
                            className="text-green-400 hover:bg-green-600/20 focus:bg-green-600/20"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Approve Vendor
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VendorsGrid({ 
  vendors, 
  onApprove, 
  onReject, 
  onSuspend, 
  onView, 
  isUpdating 
}: { 
  vendors: Vendor[];
  onApprove: (vendor: Vendor) => void;
  onReject: (vendor: Vendor) => void;
  onSuspend: (vendor: Vendor) => void;
  onView: (vendor: Vendor) => void;
  isUpdating: boolean;
}) {
  const router = useRouter();

  const getStatusColor = (status: Vendor['status']) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vendors.map((vendor) => (
        <Card key={vendor.id} className="overflow-hidden bg-gray-800 border-gray-600 hover:border-gray-500 transition-colors">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <Store className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{vendor.business_name}</h3>
                  <p className="text-xs text-gray-400">{vendor.name}</p>
                </div>
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(vendor.status)}`}>
                {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-300">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="truncate">{vendor.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                <span>{vendor.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Building className="w-4 h-4 mr-2 text-gray-500" />
                <span className="truncate">{vendor.city}, {vendor.state}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>{new Date(vendor.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(vendor)}
                className="text-gray-400 hover:text-white hover:bg-gray-600 flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-600 ml-2"
                    disabled={isUpdating}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem 
                    onClick={() => onView(vendor)}
                    className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push(`/dashboard/vendors/${vendor.id}/edit`)}
                    className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Vendor
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-600" />
                  
                  {vendor.status === 'pending' && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => onApprove(vendor)}
                        className="text-green-400 hover:bg-green-600/20 focus:bg-green-600/20"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Approve Vendor
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onReject(vendor)}
                        className="text-red-400 hover:bg-red-600/20 focus:bg-red-600/20"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Reject Vendor
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {vendor.status === 'approved' && (
                    <DropdownMenuItem 
                      onClick={() => onSuspend(vendor)}
                      className="text-yellow-400 hover:bg-yellow-600/20 focus:bg-yellow-600/20"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Suspend Vendor
                    </DropdownMenuItem>
                  )}
                  
                  {vendor.status === 'suspended' && (
                    <DropdownMenuItem 
                      onClick={() => onApprove(vendor)}
                      className="text-green-400 hover:bg-green-600/20 focus:bg-green-600/20"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Reactivate Vendor
                    </DropdownMenuItem>
                  )}
                  
                  {vendor.status === 'rejected' && (
                    <DropdownMenuItem 
                      onClick={() => onApprove(vendor)}
                      className="text-green-400 hover:bg-green-600/20 focus:bg-green-600/20"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Approve Vendor
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function VendorsPage() {
  const [filters, setFilters] = useState<VendorFilters>({
    page: 1,
    per_page: 15,
    sort_by: undefined,
    sort_order: undefined,
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
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

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ['admin-vendors', filters],
    queryFn: () => adminApi.getVendors(filters),
  });

  // Mutations for vendor actions
  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.rejectVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: number) => adminApi.suspendVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
  });

  // Filter handlers
  const handleFiltersChange = (newFilters: Partial<VendorFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      page: 1,
      per_page: 15,
      sort_by: undefined,
      sort_order: undefined,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleApprove = (vendor: Vendor) => {
    setConfirmDialog({
      open: true,
      title: 'Approve Vendor',
      description: `Are you sure you want to approve "${vendor.business_name}"? This will allow them to start selling on the platform.`,
      variant: 'success',
      onConfirm: () => approveMutation.mutate(vendor.id),
    });
  };

  const handleReject = (vendor: Vendor) => {
    setConfirmDialog({
      open: true,
      title: 'Reject Vendor',
      description: `Are you sure you want to reject "${vendor.business_name}"? They will not be able to sell on the platform.`,
      variant: 'danger',
      onConfirm: () => rejectMutation.mutate(vendor.id),
    });
  };

  const handleSuspend = (vendor: Vendor) => {
    setConfirmDialog({
      open: true,
      title: 'Suspend Vendor',
      description: `Are you sure you want to suspend "${vendor.business_name}"? They will be temporarily blocked from selling.`,
      variant: 'warning',
      onConfirm: () => suspendMutation.mutate(vendor.id),
    });
  };

  const handleView = (vendor: Vendor) => {
    router.push(`/dashboard/vendors/${vendor.id}`);
  };

  const handleEdit = (vendor: Vendor) => {
    router.push(`/dashboard/vendors/${vendor.id}/edit`);
  };

  const vendors = vendorsData?.data || [];
  const pagination = vendorsData?.meta;

  const isUpdating = approveMutation.isPending || rejectMutation.isPending || suspendMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Vendors</h1>
          <p className="text-gray-400 mt-1">Manage vendor applications and accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-600 rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-r-none border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            title="Export Vendors"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Filters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        config={vendorsFilterConfig}
        isLoading={isLoading}
        resultCount={vendorsData?.meta?.total}
        searchQuery={filters.search}
      />

      {/* Vendors Display */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Vendors ({vendorsData?.meta?.total || 0})</CardTitle>
              <CardDescription className="text-gray-400">
                Manage vendor applications and accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="p-8 text-center">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No Vendors Found</h3>
              <p className="text-gray-400 mb-4">
                {filters.search ? 'No vendors match your search criteria.' : 'No vendor applications yet.'}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <VendorsList 
              vendors={vendors} 
              onApprove={handleApprove}
              onReject={handleReject}
              onSuspend={handleSuspend}
              onView={handleView}
              isUpdating={isUpdating}
            />
          ) : (
            <VendorsGrid 
              vendors={vendors}
              onApprove={handleApprove}
              onReject={handleReject}
              onSuspend={handleSuspend}
              onView={handleView}
              isUpdating={isUpdating}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
          >
            Previous
          </Button>
          
          <span className="flex items-center px-4">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
          >
            Next
          </Button>
        </div>
      )}

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
