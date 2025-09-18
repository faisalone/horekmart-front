'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { adminApi } from '@/lib/admin-api';
import { formatCurrency } from '@/lib/currency';
import { Order, TableFilter } from '@/types/admin';
import { PaginatedResponse } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/select-custom';
import Filters from '@/components/dashboard/Filters';
import { ordersFilterConfig, updateFilterConfigOptions } from '@/config/adminFilters';
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  Hash,
  RefreshCw,
  Plus,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const columnHelper = createColumnHelper<Order>();

function getStatusIcon(status: Order['status']) {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'processing':
      return <Package className="w-4 h-4" />;
    case 'shipped':
      return <Truck className="w-4 h-4" />;
    case 'delivered':
      return <CheckCircle className="w-4 h-4" />;
    case 'cancelled':
    case 'refunded':
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getStatusColor(status: Order['status']) {
  switch (status) {
    case 'pending':
      return 'bg-amber-900/20 text-amber-300 border border-amber-600/30';
    case 'processing':
      return 'bg-blue-900/20 text-blue-300 border border-blue-600/30';
    case 'shipped':
      return 'bg-purple-900/20 text-purple-300 border border-purple-600/30';
    case 'delivered':
      return 'bg-emerald-900/20 text-emerald-300 border border-emerald-600/30';
    case 'cancelled':
      return 'bg-red-900/20 text-red-300 border border-red-600/30';
    case 'refunded':
      return 'bg-orange-900/20 text-orange-300 border border-orange-600/30';
    default:
      return 'bg-gray-800/20 text-gray-300 border border-gray-600/30';
  }
}

function getPaymentStatusColor(status: Order['payment_status']) {
  switch (status) {
    case 'paid':
      return 'bg-green-900/20 text-green-300 border border-green-600/30';
    case 'pending':
      return 'bg-yellow-900/20 text-yellow-300 border border-yellow-600/30';
    case 'failed':
      return 'bg-red-900/20 text-red-300 border border-red-600/30';
    case 'refunded':
      return 'bg-orange-900/20 text-orange-300 border border-orange-600/30';
    default:
      return 'bg-gray-800/20 text-gray-300 border border-gray-600/30';
  }
}

export default function OrdersPage() {
  const [filters, setFilters] = useState<TableFilter>({
    search: '',
    status: '',
    page: 1,
    per_page: 10,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch orders
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['dashboard-orders', filters],
    queryFn: () => adminApi.getOrders(filters),
  });

  // Fetch vendors for filter options
  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => adminApi.getVendors({ per_page: 100 }),
  });

  // Update vendor options in filter config
  React.useEffect(() => {
    if (vendorsData?.data) {
      updateFilterConfigOptions(ordersFilterConfig, 'vendor_id',
        vendorsData.data.map((vendor: any) => ({
          value: vendor.id.toString(),
          label: vendor.business_name || vendor.user.name,
        }))
      );
    }
  }, [vendorsData]);

  // Update order status
  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      adminApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-orders'] });
      setSelectedOrder(null);
    },
  });

  const columns = [
    columnHelper.accessor('order_number', {
      header: 'Order Number',
      cell: (info) => (
        <div className="font-medium">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('customer', {
      header: 'Customer',
      cell: (info) => {
        const customer = info.getValue();
        return (
          <div>
            <div className="font-medium">{customer?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{customer?.phone || 'N/A'}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor('created_at', {
      header: 'Date',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        return (
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            getStatusColor(status)
          )}>
            {getStatusIcon(status)}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    }),
    columnHelper.accessor('payment_status', {
      header: 'Payment',
      cell: (info) => {
        const status = info.getValue();
        return (
          <span className={cn(
            'inline-flex px-2 py-1 rounded-full text-xs font-medium',
            getPaymentStatusColor(status)
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    }),
    columnHelper.accessor('total_amount', {
      header: 'Total',
      cell: (info) => formatCurrency(info.getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedOrder(info.row.original)}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: data?.meta.last_page || 0,
  });

  const handleFiltersChange = (newFilters: Partial<TableFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      page: 1,
      per_page: 10,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleUpdateStatus = (status: string | number) => {
    if (selectedOrder && typeof status === 'string') {
      updateOrderMutation.mutate({ orderId: selectedOrder.id.toString(), status: status as Order['status'] });
    }
  };

  // Calculate stats with fallback for empty data
  const stats = React.useMemo(() => {
    const orders = data?.data || [];
    return {
      total: data?.meta?.total || 0,
      pending: orders.filter((o: Order) => o.status === 'pending').length || 0,
      processing: orders.filter((o: Order) => o.status === 'processing').length || 0,
      shipped: orders.filter((o: Order) => o.status === 'shipped').length || 0,
      delivered: orders.filter((o: Order) => o.status === 'delivered').length || 0,
      totalRevenue: orders.reduce((sum: number, order: Order) => sum + order.total_amount, 0) || 0,
    };
  }, [data]);

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <p className="text-red-600">Error loading orders: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-gray-300">Manage and track customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 bg-transparent">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border border-blue-600/30 bg-gray-800/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">Total Orders</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Hash className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-amber-600/30 bg-gray-800/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-300">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-indigo-600/30 bg-gray-800/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-300">Processing</p>
                <p className="text-2xl font-bold text-white">{stats.processing}</p>
              </div>
              <Package className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-purple-600/30 bg-gray-800/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">Shipped</p>
                <p className="text-2xl font-bold text-white">{stats.shipped}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-emerald-600/30 bg-gray-800/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-300">Delivered</p>
                <p className="text-2xl font-bold text-white">{stats.delivered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-green-600/30 bg-gray-800/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Revenue</p>
                <p className="text-lg font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Quick Filters */}
      <Card className="border border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order ID, customer name, or email..."
                  value={filters.search || ''}
                  onChange={(e) => handleFiltersChange({ search: e.target.value })}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <CustomSelect
                value={filters.status || ''}
                onValueChange={(value) => handleFiltersChange({ status: value as string })}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'shipped', label: 'Shipped' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'refunded', label: 'Refunded' },
                ]}
                className="w-48 bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="mt-2 text-gray-300">Loading orders...</p>
              </div>
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
                            className="text-left p-4 font-semibold text-gray-300"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-gray-800/30">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="p-4 text-gray-300">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.meta && data.meta.last_page > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-300">
                    Showing {data.meta.from || 0} to {data.meta.to || 0} of {data.meta.total || 0} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((data.meta.current_page || 1) - 1)}
                      disabled={(data.meta.current_page || 1) <= 1}
                      className="border-gray-600 text-gray-300 bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-300 font-medium">
                      Page {data.meta.current_page || 1} of {data.meta.last_page || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((data.meta.current_page || 1) + 1)}
                      disabled={(data.meta.current_page || 1) >= (data.meta.last_page || 1)}
                      className="border-gray-600 text-gray-300 bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {data?.data.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No orders found</h3>
                  <p className="text-gray-600 mb-4">
                    {filters.search || filters.status 
                      ? 'No orders match your current filters.' 
                      : 'No orders have been placed yet.'
                    }
                  </p>
                  {(filters.search || filters.status) && (
                    <Button 
                      variant="outline" 
                      onClick={handleClearFilters}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700 bg-gray-800/50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{selectedOrder.order_number}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6 bg-gray-800">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                  <h3 className="font-semibold mb-3 text-white">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Order Date:</span>
                      <span className="text-white font-medium">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status:</span>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        getStatusColor(selectedOrder.status)
                      )}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Payment Status:</span>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        getPaymentStatusColor(selectedOrder.payment_status)
                      )}>
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total:</span>
                      <span className="font-semibold text-white">{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                  <h3 className="font-semibold mb-3 text-white">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-300">Name:</span>
                      <div className="text-white font-medium">{selectedOrder.customer?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-300">Customer ID:</span>
                      <div className="text-white font-medium">#{selectedOrder.customer?.id || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-300">Phone:</span>
                      <div className="text-white font-medium">{selectedOrder.customer?.phone || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <h3 className="font-semibold mb-3 text-white">Shipping Details</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  {selectedOrder.shipping ? (
                    <>
                      <div>
                        <span className="text-gray-400">Address:</span>
                        <span className="text-white ml-2">{selectedOrder.shipping.address}</span>
                      </div>
                      {selectedOrder.shipping.city && (
                        <div>
                          <span className="text-gray-400">City:</span>
                          <span className="text-white ml-2">{selectedOrder.shipping.city.name}</span>
                        </div>
                      )}
                      {selectedOrder.shipping.zone && (
                        <div>
                          <span className="text-gray-400">Zone:</span>
                          <span className="text-white ml-2">{selectedOrder.shipping.zone.name}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400">Shipping Amount:</span>
                        <span className="text-white ml-2">{formatCurrency(selectedOrder.shipping.shipping_amount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className="text-white ml-2 capitalize">{selectedOrder.shipping.status}</span>
                      </div>
                      {selectedOrder.shipping.consignment_id && (
                        <div>
                          <span className="text-gray-400">Consignment ID:</span>
                          <span className="text-white ml-2 font-mono">{selectedOrder.shipping.consignment_id}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400">No shipping information available</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <h3 className="font-semibold mb-3 text-white">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-600/50 rounded border border-gray-500">
                      <div>
                        <div className="font-medium text-white">{item.product?.name || item.product_name || `Product ${item.product_id}`}</div>
                        <div className="text-sm text-gray-300">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="font-semibold text-white">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-400">No items found</p>
                  )}
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <h3 className="font-semibold mb-3 text-white">Update Status</h3>
                <div className="flex gap-2">
                  <CustomSelect
                    value={selectedOrder.status}
                    onValueChange={handleUpdateStatus}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'processing', label: 'Processing' },
                      { value: 'shipped', label: 'Shipped' },
                      { value: 'delivered', label: 'Delivered' },
                      { value: 'cancelled', label: 'Cancelled' },
                      { value: 'refunded', label: 'Refunded' },
                    ]}
                    className="w-48 bg-gray-600/50 border-gray-500 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
