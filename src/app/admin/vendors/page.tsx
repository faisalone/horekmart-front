'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Vendor, TableFilter } from '@/types/admin';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Filters from '@/components/admin/Filters';
import { vendorsFilterConfig } from '@/config/adminFilters';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Pause,
  Store,
  Mail,
  Phone,
  Calendar,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorFilters extends TableFilter {
  status?: string;
}

interface VendorRowProps {
  vendor: Vendor;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onSuspend: (id: number) => void;
  isUpdating: boolean;
}

function VendorRow({ vendor, onApprove, onReject, onSuspend, isUpdating }: VendorRowProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: Vendor['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-4 px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{vendor.business_name}</div>
              <div className="text-sm text-gray-500">{vendor.name}</div>
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="text-sm">
            <div className="flex items-center text-gray-900">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              {vendor.email}
            </div>
            <div className="flex items-center text-gray-500 mt-1">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              {vendor.phone}
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <span className={cn('px-2 py-1 text-sm rounded-md capitalize', getStatusColor(vendor.status))}>
            {vendor.status}
          </span>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">{vendor.documents ? '1 doc' : '0 docs'}</span>
            <div className="flex space-x-1">
              {vendor.documents && (
                <div
                  className="w-2 h-2 rounded-full bg-green-500"
                  title="Document available"
                />
              )}
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(vendor.created_at).toLocaleDateString()}
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            {vendor.status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApprove(vendor.id)}
                  disabled={isUpdating}
                  className="text-green-600 hover:bg-green-50"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReject(vendor.id)}
                  disabled={isUpdating}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {vendor.status === 'approved' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSuspend(vendor.id)}
                disabled={isUpdating}
                className="text-orange-600 hover:bg-orange-50"
              >
                <Pause className="w-4 h-4" />
              </Button>
            )}
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
      
      {/* Expanded Details Row */}
      {showDetails && (
        <tr>
          <td colSpan={6} className="bg-gray-50 px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Address:</span> {vendor.address}, {vendor.city}, {vendor.state} {vendor.postal_code}</p>
                  <p><span className="text-gray-500">Registration Date:</span> {new Date(vendor.created_at).toLocaleDateString()}</p>
                  <p><span className="text-gray-500">Last Updated:</span> {new Date(vendor.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                <div className="space-y-2">
                  {vendor.documents ? (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>Document Available</span>
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No documents uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function VendorsPage() {
  const [filters, setFilters] = useState<VendorFilters>({
    search: '',
    status: '',
    page: 1,
    per_page: 15,
  });

  const queryClient = useQueryClient();

  // Fetch vendors from real API
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-vendors', filters],
    queryFn: () => adminApi.getVendors(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const vendors = data?.data || [];
  const pagination = data?.meta;

  const isUpdating = approveMutation.isPending || rejectMutation.isPending || suspendMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading vendors. Please try again.
      </div>
    );
  }

  const stats = {
    total: vendors.length || 0,
    pending: vendors.filter(v => v.status === 'pending').length || 0,
    approved: vendors.filter(v => v.status === 'approved').length || 0,
    rejected: vendors.filter(v => v.status === 'rejected').length || 0,
    suspended: vendors.filter(v => v.status === 'suspended').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600 mt-1">Manage vendor applications and accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Vendors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-500">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.suspended}</div>
            <div className="text-sm text-gray-500">Suspended</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Filters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        config={vendorsFilterConfig}
        isLoading={isLoading}
        resultCount={pagination?.total}
        searchQuery={filters.search}
      />

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors ({pagination?.total || vendors.length})</CardTitle>
          <CardDescription>Manage vendor applications and accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Vendor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Documents</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Registered</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <VendorRow
                    key={vendor.id}
                    vendor={vendor}
                    onApprove={approveMutation.mutate}
                    onReject={rejectMutation.mutate}
                    onSuspend={suspendMutation.mutate}
                    isUpdating={isUpdating}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {vendors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No vendors found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} vendors
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
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
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
