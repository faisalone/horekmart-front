import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import { Product } from '@/types/admin';
import Badge from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProductImageUrl } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import RichTextDisplay from '@/components/ui/RichTextDisplay';
import { 
  Package, 
  DollarSign, 
  Calendar, 
  Building, 
  Tag,
  Star,
  Check,
  X,
  XIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductViewModal({ product, open, onOpenChange }: ProductViewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get all available images - separate thumbnail from gallery images
  const getAllImages = (): Array<{url: string, alt: string, type: string, id: string | number}> => {
    if (!product) return [];
    
    const images: Array<{url: string, alt: string, type: string, id: string | number}> = [];
    
    // Add only product images from gallery (exclude thumbnail)
    if (product.images && product.images.length > 0) {
      product.images.forEach((img: any, index) => {
        const imageUrl = typeof img === 'object' && img.url ? img.url : 
                        (typeof img === 'object' && img.file_url ? img.file_url : 
                        (typeof img === 'string' ? img : ''));
        const imageId = typeof img === 'object' && img.id ? img.id : index;
        
        if (imageUrl) {
          images.push({
            url: imageUrl,
            alt: (typeof img === 'object' && img.alt_text) ? img.alt_text : `${product.name} - Image ${index + 1}`,
            type: 'gallery',
            id: imageId
          });
        }
      });
    }
    
    // Fallback to main image if no gallery images
    if (images.length === 0 && product.image) {
      images.push({
        url: product.image,
        alt: product.name,
        type: 'main',
        id: 'main'
      });
    }
    
    return images;
  };

  // Get thumbnail separately
  const getThumbnail = (): {url: string, alt: string, type: string, id: string | number} | null => {
    if (!product) return null;
    
    if (product.thumb && product.thumb.trim() !== '') {
      return {
        url: product.thumb,
        alt: `${product.name} - Thumbnail (Meta Image)`,
        type: 'thumbnail',
        id: 'thumbnail'
      };
    }
    
    return null;
  };

  const allImages = getAllImages();
  const thumbnail = getThumbnail();
  const hasMultipleImages = allImages.length > 1;

  // Reset selected image when product changes
  React.useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, onOpenChange]);

  if (!product || !open) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      {/* Meta tags for admin product view */}

      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-400" />
              {product.name}
            </h2>
            <p className="text-gray-400 mt-1">Product Details and Information</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white hover:bg-gray-700 transition-colors rounded-lg p-2"
            title="Close Modal"
          >
            <XIcon className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Images Gallery */}
            <div className="lg:col-span-1 space-y-6">
              {/* Gallery Images */}
              <Card className="bg-gray-750 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Gallery Images</CardTitle>
                  <p className="text-gray-400 text-sm">
                    {allImages.length > 0 ? `${allImages.length} images available` : 'No gallery images'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Main Image Display */}
                  <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {allImages.length > 0 ? (
                      <Image
                        src={allImages[selectedImageIndex]?.url || getProductImageUrl(product)}
                        alt={allImages[selectedImageIndex]?.alt || product?.name || 'Product'}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Package className="w-20 h-20 mx-auto mb-2" />
                        <p className="text-sm">No gallery images</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Navigation */}
                  {hasMultipleImages && (
                    <div className="grid grid-cols-3 gap-2">
                      {allImages.map((img, index) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden bg-gray-600 border-2 transition-all ${
                            selectedImageIndex === index 
                              ? 'border-blue-400 ring-2 ring-blue-200' 
                              : 'border-gray-500 hover:border-gray-400'
                          }`}
                        >
                          <Image
                            src={img.url}
                            alt={img.alt}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Image Info */}
                  {allImages.length > 0 && (
                    <div className="text-xs text-gray-400">
                      <p>Image {selectedImageIndex + 1} of {allImages.length}</p>
                      <p className="truncate">{allImages[selectedImageIndex]?.type}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Thumbnail (Meta Image) - Separate Section */}
              <Card className="bg-gray-750 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Thumbnail (Meta Image)</CardTitle>
                  <p className="text-gray-400 text-sm">
                    {thumbnail ? 'Used for meta tags and previews' : 'No thumbnail set'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {thumbnail ? (
                      <Image
                        src={thumbnail.url}
                        alt={thumbnail.alt}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-xs">No thumbnail</p>
                        <p className="text-xs text-gray-600 mt-1">Will use first gallery image for meta tags</p>
                      </div>
                    )}
                  </div>
                  {thumbnail && (
                    <div className="text-xs text-gray-400 mt-2">
                      <p className="truncate">Meta/OG Image</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Product Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="bg-gray-750 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Product Name</label>
                      <p className="text-white font-medium">{product.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">SKU</label>
                      <p className="text-white font-mono">{product.sku}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Status</label>
                      <div className="mt-1">
                        <span className={cn(
                          'px-2 py-1 text-sm rounded-md capitalize',
                          product.status === 'published' ? 'bg-green-900/30 text-green-400' :
                          product.status === 'draft' ? 'bg-yellow-900/30 text-yellow-400' :
                          product.status === 'archived' ? 'bg-red-900/30 text-red-400' :
                          'bg-gray-700 text-gray-300'
                        )}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Featured</label>
                      <div className="flex items-center gap-2 mt-1">
                        {product.is_featured ? (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span>Featured</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not Featured</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Stock */}
              <Card className="bg-gray-750 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Pricing & Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Regular Price</label>
                      <p className="text-xl font-bold text-green-400">{formatCurrency(Number(product.price))}</p>
                    </div>
                    {product.sale_price && (
                      <div>
                        <label className="text-sm font-medium text-gray-300">Sale Price</label>
                        <p className="text-xl font-bold text-red-400">{formatCurrency(Number(product.sale_price))}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-300">Stock Quantity</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'text-xl font-bold',
                          product.stock_quantity === 0 ? 'text-red-400' : 
                          product.stock_quantity < 10 ? 'text-yellow-400' : 'text-green-400'
                        )}>
                          {product.stock_quantity}
                        </span>
                        {product.in_stock ? (
                          <div className="flex items-center gap-1 text-green-400">
                            <Check className="w-4 h-4" />
                            <span className="text-sm">In Stock</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-400">
                            <X className="w-4 h-4" />
                            <span className="text-sm">Out of Stock</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping */}
              <Card className="bg-gray-750 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-400" />
                    Shipping
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Weight</label>
                      <div className="mt-1">
                        {product.weight ? (
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">
                              {product.weight}
                            </span>
                            <span className="px-2 py-1 bg-orange-900/30 text-orange-400 text-xs rounded-md">
                              {product.weight_unit || 'kg'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Dimensions</label>
                      <p className="text-gray-400 mt-1">Not specified</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category & Vendor */}
              <Card className="bg-gray-750 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-400" />
                    Category & Vendor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Category</label>
                      <div className="mt-1">
                        <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-sm rounded-md flex items-center gap-1 w-fit">
                          <Tag className="w-3 h-3" />
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Vendor</label>
                      <p className="text-white font-medium">
                        {product.vendor?.business_name || product.vendor?.name || 'No Vendor'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {product.description && (
                <Card className="bg-gray-750 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RichTextDisplay content={product.description} textColor="white" />
                  </CardContent>
                </Card>
              )}

              {/* Timestamps */}
              <Card className="bg-gray-750 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    Timestamps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Created At</label>
                      <p className="text-white">
                        {new Date(product.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Updated At</label>
                      <p className="text-white">
                        {new Date(product.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
