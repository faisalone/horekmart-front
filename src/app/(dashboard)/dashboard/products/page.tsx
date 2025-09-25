'use client';

 import React, { useMemo } from 'react';
import Image from 'next/image';
import { 
  useReactTable,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Filters from '@/components/dashboard/Filters';
import { 
  Plus, 
  Download, 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  Share
} from 'lucide-react';
import { cn, getProductUrl } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { Product } from '@/types/admin';
import { ProductViewModal } from '@/components/dashboard/ProductViewModal';
import { SocialMediaPostModal } from '@/components/dashboard/SocialMediaPostModal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useProductsPage } from '@/hooks/useProductsPage';

const columnHelper = createColumnHelper<Product>();

export default function ProductsPage() {
  const {
    selectedProduct,
    setSelectedProduct,
    isViewModalOpen,
    setIsViewModalOpen,
    isSocialMediaModalOpen,
    setIsSocialMediaModalOpen,
    socialMediaProduct,
    setSocialMediaProduct,
    data,
    isLoading,
    isFetching,
    error,
    products,
    createTableConfig,
    filterConfig,
    filters,
    handleAddProduct,
    handleEditProduct,
    handleViewProduct,
    handleSocialMediaPost,
    handleDeleteProduct,
    handleFiltersChange,
    handleClearFilters,
    deleteProductMutation,
  } = useProductsPage();

  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<number | null>(null);

  // Handle delete confirmation
  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      handleDeleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };





  // Create table columns
  const columns = useMemo(() => [
    columnHelper.accessor('image', {
      header: 'Image',
      cell: ({ row }) => {
        const product = row.original;
        let imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2NC4zIDEwMCAxNzYgMTExLjcgMTc2IDEyNkMxNzYgMTQwLjMgMTY0LjMgMTUyIDE1MCAxNTJDMTM1LjcgMTUyIDEyNCAxNDAuMyAxMjQgMTI2QzEyNCAxMTEuNyAxMzUuNyAxMDAgMTUwIDEwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEwMCAxODBIMjAwQzIwNS41IDE4MCAyMTAgMTg0LjUgMjEwIDE5MFYyMDBDMjEwIDIwNS41IDIwNS41IDIxMCAyMDAgMjEwSDEwMEM5NC41IDIxMCA5MCAyMDUuNSA5MCAyMDBWMTkwQzkwIDE4NC41IDk0LjUgMTgwIDEwMCAxODBaIiBmaWxsPSIjOUNBNEFGIi8+Cjwvc3ZnPgo=';
        
        if (product.images && product.images.length > 0) {
          const firstImage = product.images[0] as any;
          if (typeof firstImage === 'object' && firstImage.url) {
            imageUrl = firstImage.url;
          } else if (typeof firstImage === 'object' && firstImage.file_url) {
            imageUrl = firstImage.file_url;
          } else if (typeof firstImage === 'string') {
            imageUrl = firstImage;
          }
        } else if (product.image) {
          imageUrl = product.image;
        }
        
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
      cell: ({ row }) => {
        const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${getProductUrl(row.original)}`;
        return (
          <div>
            <a 
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
              title="View product on frontend"
            >
              {row.original.name}
            </a>
            <div className="text-sm text-gray-400">SKU: {row.original.sku}</div>
            <div className="text-sm text-gray-400">{row.original.vendor?.business_name}</div>
          </div>
        );
      },
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
            {formatCurrency(Number(row.original.price))}
          </div>
          {row.original.sale_price && (
            <div className="text-sm text-red-400">
              Sale: {formatCurrency(Number(row.original.sale_price))}
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
          <span className={cn(
            'px-3 py-1 text-sm rounded-md font-medium',
            row.original.in_stock ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          )}>
            {row.original.in_stock ? `Stock (${getValue()})` : 'Out of Stock'}
          </span>
        </div>
      ),
      size: 120,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <span className={cn(
            'px-2 py-1 text-sm rounded-md capitalize',
            status === 'published' ? 'bg-green-900/30 text-green-400' :
            status === 'archived' ? 'bg-red-900/30 text-red-400' :
            'bg-gray-700 text-gray-300'
          )}>
            {status}
          </span>
        );
      },
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
            onClick={() => handleSocialMediaPost(row.original)}
            className="text-green-400 hover:text-green-300 hover:bg-gray-700"
            title="Share on Social Media"
          >
            <Share className="w-4 h-4" />
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
            onClick={() => handleDeleteClick(row.original.id)}
            disabled={deleteProductMutation.isPending}
            className="text-red-400 hover:text-red-300 hover:bg-gray-700 disabled:opacity-50"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      size: 180,
    }),
  ], [deleteProductMutation.isPending, handleViewProduct, handleSocialMediaPost, handleEditProduct, handleDeleteProduct]);

  // Create table instance
  const table = useReactTable(createTableConfig(columns));

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
    <div className="p-6 space-y-6">
      {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Products</h1>
            <p className="text-gray-400 mt-1">Manage your product catalog</p>
          </div>
          <div className="flex items-center space-x-3">            
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              title="Export Products"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleAddProduct} 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              title="Add Product"
            >
              <Plus className="w-4 h-4" />
            </Button>
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

      {/* Products List */}
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
          {/* Desktop Table View */}
          <div className="hidden lg:block">
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
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                
                {/* Top Row: Badges left, Actions right */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Status Badge */}
                    <span className={cn(
                      'px-2 py-1 text-xs rounded-md capitalize',
                      product.status === 'published' ? 'bg-green-900/30 text-green-400' :
                      product.status === 'archived' ? 'bg-red-900/30 text-red-400' :
                      'bg-gray-600 text-gray-300'
                    )}>
                      {product.status}
                    </span>
                    
                    {/* Stock Badge */}
                    <span className={cn(
                      'px-2 py-1 text-xs rounded-md',
                      product.in_stock ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    )}>
                      {product.in_stock ? 'In Stock' : 'Out'}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewProduct(product)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-gray-600 p-2"
                      title="View Product"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSocialMediaPost(product)}
                      className="text-green-400 hover:text-green-300 hover:bg-gray-600 p-2"
                      title="Share on Social Media"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditProduct(product.id)}
                      className="text-gray-300 hover:text-white hover:bg-gray-600 p-2"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteClick(product.id)}
                      disabled={deleteProductMutation.isPending}
                      className="text-red-400 hover:text-red-300 hover:bg-gray-600 disabled:opacity-50 p-2"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Second Row: Image left, Title & SKU right */}
                <div className="flex items-center space-x-3">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {(() => {
                      let imgSrc = '';
                      if (product.images && product.images.length > 0) {
                        const firstImage = product.images[0] as any;
                        if (typeof firstImage === 'object' && firstImage.url) {
                          imgSrc = firstImage.url;
                        } else if (typeof firstImage === 'object' && firstImage.file_url) {
                          imgSrc = firstImage.file_url;
                        } else if (typeof firstImage === 'string') {
                          imgSrc = firstImage;
                        }
                      } else if (product.image) {
                        imgSrc = product.image;
                      }
                      
                      return imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={product.name || 'Product'}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      );
                    })()}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{product.name}</h3>
                    <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                    <p className="text-sm text-gray-400">{product.vendor?.business_name}</p>
                    <div className="mt-1">
                      <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-md">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Third Row: Price left, Quantity right (only if > 0) */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 text-sm">Price:</span>
                    <div className="mt-1">
                      <div className="font-medium text-white">{formatCurrency(Number(product.price))}</div>
                      {product.sale_price && (
                        <div className="text-xs text-red-400">Sale: {formatCurrency(Number(product.sale_price))}</div>
                      )}
                    </div>
                  </div>
                  
                  {product.stock_quantity > 0 && (
                    <div className="text-right">
                      <span className="text-gray-400 text-sm">Quantity:</span>
                      <div className="mt-1">
                        <div className={cn(
                          'font-medium',
                          product.stock_quantity < 10 ? 'text-yellow-400' : 'text-green-400'
                        )}>
                          {product.stock_quantity}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No products found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
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
                Page {data?.meta?.current_page || 1} of {data?.meta?.last_page || 1}
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

      {/* Social Media Post Modal */}
      <SocialMediaPostModal
        product={socialMediaProduct}
        open={isSocialMediaModalOpen}
        onOpenChange={setIsSocialMediaModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        isLoading={deleteProductMutation.isPending}
      />
    </div>
  );
}
