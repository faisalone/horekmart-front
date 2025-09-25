'use client';

import React from 'react';
import { 
  useReactTable,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Badge from '@/components/ui/Badge';
import Filters from '@/components/dashboard/Filters';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { 
  Trash2, 
  Phone, 
  Calendar,
  Package,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Customer } from '@/types/admin';
import { useCustomersPage } from '@/hooks/useCustomersPage';
import { format } from 'date-fns';

const columnHelper = createColumnHelper<Customer>();

export default function CustomersPage() {
  const {
    // Data
    data,
    customers,
    isLoading,
    isFetching,
    error,
    
    // Dialogs
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    customerToDelete,
    
    // Mutations
    deleteCustomerMutation,
    
    // Filter and pagination
    filters,
    filterConfig,
    handleFiltersChange,
    handleClearFilters,
    handlePageChange,
    
    // Actions
    handleDeleteCustomer,
    confirmDeleteCustomer,
  } = useCustomersPage();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Customer',
      cell: (info) => (
        <div>
          <div className="font-medium text-white">{info.getValue()}</div>
          <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
            <Phone className="w-3 h-3" />
            {info.row.original.phone}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('orders_count', {
      header: 'Orders',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <Badge variant="secondary">
            {info.getValue() || 0}
          </Badge>
        </div>
      ),
    }),
    columnHelper.accessor('created_at', {
      header: 'Joined',
      cell: (info) => (
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Calendar className="w-4 h-4 text-gray-400" />
          {format(new Date(info.getValue()), 'MMM dd, yyyy')}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteCustomer(info.row.original)}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            disabled={(info.row.original.orders_count || 0) > 0}
            title={(info.row.original.orders_count || 0) > 0 ? 'Cannot delete customer with orders' : 'Delete customer'}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: data?.meta.last_page || 0,
  });

  // Calculate stats
  const stats = React.useMemo(() => {
    return {
      total: data?.meta?.total || 0,
      withOrders: customers.filter(c => (c.orders_count || 0) > 0).length || 0,
      withoutOrders: customers.filter(c => !c.orders_count || c.orders_count === 0).length || 0,
    };
  }, [data, customers]);

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <p className="text-red-600">Error loading customers: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="text-gray-400 mt-1">Manage customer accounts and information</p>
        </div>
      </div>

      {/* Filters */}
      <Filters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        config={filterConfig}
        isLoading={isFetching}
        resultCount={data?.meta?.total}
        searchQuery={filters.search}
      />

      {/* Customers Table */}
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white">Customer List</CardTitle>
          <CardDescription className="text-gray-400">
            {data?.meta?.total || 0} customers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No customers found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b border-gray-700">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-700/30">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-4 whitespace-nowrap text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data?.meta && data.meta.last_page > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700 mt-4">
                  <div className="text-sm text-gray-400">
                    Showing {((data.meta.current_page - 1) * data.meta.per_page) + 1} to{' '}
                    {Math.min(data.meta.current_page * data.meta.per_page, data.meta.total)} of{' '}
                    {data.meta.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.meta.current_page - 1)}
                      disabled={data.meta.current_page <= 1}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-400">
                      Page {data.meta.current_page} of {data.meta.last_page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.meta.current_page + 1)}
                      disabled={data.meta.current_page >= data.meta.last_page}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteCustomer}
        title="Delete Customer"
        description={
          customerToDelete 
            ? `Are you sure you want to delete ${customerToDelete.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this customer?'
        }
        confirmText="Delete Customer"
        variant="danger"
        isLoading={deleteCustomerMutation.isPending}
      />
    </div>
  );
}
