'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDebounce } from 'use-debounce';
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
import { Product, TableFilter } from '@/types/admin';
import { PaginatedResponse } from '@/types/admin';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/select-custom';
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
} from 'lucide-react';
import { cn, getProductImageUrl } from '@/lib/utils';
import { ProductViewModal } from '@/components/admin/ProductViewModal';

const columnHelper = createColumnHelper<Product>();

export default function ProductsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [filters, setFilters] = useState<TableFilter>({
    search: '',
    status: '',
    category_id: '',
    vendor_id: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    per_page: 10,
  });

  // Professional debounce hook from use-debounce package
  const [debouncedSearch] = useDebounce(searchInput, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch categories and vendors for filters
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.getCategories({ per_page: 100 }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: () => adminApi.getVendors({ per_page: 100 }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch products with advanced TanStack Query configuration
  const { data, isLoading, isFetching, error } = useQuery<PaginatedResponse<Product>>({
    queryKey: ['admin-products', filters],
    queryFn: () => adminApi.getProducts(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes - data stays fresh
    gcTime: 1000 * 60 * 10, // 10 minutes - garbage collection time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData, // Keep previous data while loading
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const handleAddProduct = () => {
    router.push('/admin/products/add');
  };

  const handleEditProduct = (productId: number) => {
    router.push(`/admin/products/${productId}/edit`);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const columns = [
    columnHelper.accessor('image', {
      header: 'Image',
      cell: ({ row }) => {
        const product = row.original;
        // Always use first image from images collection for display
        const imageUrl = product.images?.[0]?.file_url || 
                        product.image || 
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2NC4zIDEwMCAxNzYgMTExLjcgMTc2IDEyNkMxNzYgMTQwLjMgMTY0LjMgMTUyIDE1MCAxNTJDMTM1LjcgMTUyIDEyNCAxNDAuMyAxMjQgMTI2QzEyNCAxMTEuNyAxMzUuNyAxMDAgMTUwIDEwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEwMCAxODBIMjAwQzIwNS41IDE4MCAyMTAgMTg0LjUgMjEwIDE5MFYyMDBDMjEwIDIwNS41IDIwNS41IDIxMCAyMDAgMjEwSDEwMEM5NC41IDIxMCA5MCAyMDUuNSA5MCAyMDBWMTkwQzkwIDE4NC41IDk0LjUgMTgwIDEwMCAxODBaIiBmaWxsPSIjOUNBNEFGIi8+Cjwvc3ZnPgo=';
        
        return (
          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name || 'Product'}
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="w-6 h-6 text-gray-400" />
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 80,
    }),
    columnHelper.accessor('name', {
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-200">{row.original.name}</div>
          <div className="text-sm text-gray-400">SKU: {row.original.sku}</div>
          <div className="text-sm text-gray-400">{row.original.vendor?.business_name}</div>
        </div>
      ),
      size: 250,
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: ({ getValue }) => (
        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded-md">
          {getValue()?.name || 'Uncategorized'}
        </span>
      ),
      size: 120,
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-200">
            ${row.original.price}
          </div>
          {row.original.sale_price && (
            <div className="text-sm text-red-400">
              Sale: ${row.original.sale_price}
            </div>
          )}
        </div>
      ),
      size: 100,
    }),
    columnHelper.accessor('stock_quantity', {
      header: 'Stock',
      cell: ({ getValue, row }) => (
        <div className="text-center">
          <div className={cn(
            'font-medium',
            getValue() === 0 ? 'text-red-400' : 
            getValue() < 10 ? 'text-yellow-400' : 'text-green-400'
          )}>
            {getValue()}
          </div>
          <div className={cn(
            'text-xs px-2 py-1 rounded-md',
            row.original.in_stock ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          )}>
            {row.original.in_stock ? 'In Stock' : 'Out of Stock'}
          </div>
        </div>
      ),
      size: 80,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <span className={cn(
            'px-2 py-1 text-sm rounded-md capitalize',
            status === 'published' ? 'bg-green-900/30 text-green-400' :
            status === 'inactive' ? 'bg-red-900/30 text-red-400' :
            'bg-gray-700 text-gray-300'
          )}>
            {status}
          </span>
        );
      },
      size: 100,
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
      size: 100,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleViewProduct(row.original)}
            className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
            title="View Product"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEditProduct(row.original.id)}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
            title="Edit Product"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDeleteProduct(row.original.id)}
            disabled={deleteProductMutation.isPending}
            className="text-red-400 hover:text-red-300 hover:bg-gray-700 disabled:opacity-50"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      size: 120,
    }),
  ];

  const products = data?.data || [];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleCategoryFilter = (category_id: string) => {
    setFilters(prev => ({ ...prev, category_id, page: 1 }));
  };

  const handleVendorFilter = (vendor_id: string) => {
    setFilters(prev => ({ ...prev, vendor_id, page: 1 }));
  };

  const handleSortChange = (sortValue: string) => {
    const [sort_by, sort_order] = sortValue.split('_');
    setFilters(prev => ({ ...prev, sort_by, sort_order: sort_order as 'asc' | 'desc', page: 1 }));
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setFilters({ 
      search: '', 
      status: '', 
      category_id: '', 
      vendor_id: '', 
      sort_by: 'created_at', 
      sort_order: 'desc', 
      page: 1, 
      per_page: 10 
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-400 mb-4">
          <Package className="w-12 h-12 mx-auto mb-2" />
          Error loading products
        </div>
        <p className="text-gray-400 mb-4">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </Button>
      </div>
    );
  }

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
        Error loading products. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            Filters
            {(filters.search || filters.status || filters.category_id || filters.vendor_id) && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                Active
              </span>
            )}
            {isFetching && (
              <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full flex items-center gap-1">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Filter and search products in real-time
            {filters.search && data && (
              <span className="ml-2 text-blue-400">
                • Found {data.meta.total} results for "{filters.search}"
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Row */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => {
                    e.preventDefault();
                    handleSearch(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
                {isFetching && searchInput && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <CustomSelect
                  value={filters.status || ''}
                  onValueChange={(value) => handleStatusFilter(value as string)}
                  placeholder="All Status"
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                    { value: 'inactive', label: 'Inactive' }
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <CustomSelect
                  value={filters.category_id || ''}
                  onValueChange={(value) => handleCategoryFilter(value as string)}
                  placeholder="All Categories"
                  options={[
                    { value: '', label: 'All Categories' },
                    ...(categoriesData?.data ? categoriesData.data.map(category => ({
                      value: category.id.toString(),
                      label: category.name
                    })) : [])
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Vendor</label>
                <CustomSelect
                  value={filters.vendor_id || ''}
                  onValueChange={(value) => handleVendorFilter(value as string)}
                  placeholder="All Vendors"
                  options={[
                    { value: '', label: 'All Vendors' },
                    ...(vendorsData?.data ? vendorsData.data.map(vendor => ({
                      value: vendor.id.toString(),
                      label: vendor.business_name || vendor.name
                    })) : [])
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <CustomSelect
                  value={`${filters.sort_by}_${filters.sort_order}`}
                  onValueChange={(value) => handleSortChange(value as string)}
                  placeholder="Sort by..."
                  options={[
                    { value: 'created_at_desc', label: 'Newest First' },
                    { value: 'created_at_asc', label: 'Oldest First' },
                    { value: 'name_asc', label: 'Name A-Z' },
                    { value: 'name_desc', label: 'Name Z-A' },
                    { value: 'price_desc', label: 'Price High to Low' },
                    { value: 'price_asc', label: 'Price Low to High' },
                    { value: 'stock_quantity_desc', label: 'Stock High to Low' },
                    { value: 'stock_quantity_asc', label: 'Stock Low to High' }
                  ]}
                />
              </div>
              
              <div className="flex items-end">
                {(filters.search || filters.status || filters.category_id || filters.vendor_id) && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Products ({data?.meta?.total || 0})</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your product catalog
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-600">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left py-3 px-4 font-medium text-gray-200"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                              'flex items-center space-x-1'
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-700 hover:bg-gray-800">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4 text-gray-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No products found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-400">
              Showing {data?.meta?.from || 0} to {data?.meta?.to || 0} of {data?.meta?.total || 0} products
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </Button>
              
              <span className="flex items-center px-4 text-gray-300">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product View Modal */}
      <ProductViewModal
        product={selectedProduct}
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
      />
    </div>
  );
}
