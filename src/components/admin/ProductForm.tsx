'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Product, Category, Vendor } from '@/types/admin';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/select-custom';
import { ThumbnailUpload } from '@/components/admin/ThumbnailUpload';
import { ImageUpload, UploadedImage as ImageUploadType } from '@/components/admin/ImageUpload';
import { useToast } from '@/hooks/useToast';
import {
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Partial<Product>, images: UploadedImage[], thumbnail?: File | string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

interface ProductFormData {
  name: string;
  description: string;
  short_description: string;
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  status: 'published' | 'draft' | 'inactive';
  is_featured: boolean;
  category_id: number;
  vendor_id: number;
  weight?: number;
  dimensions?: string;
  meta_title?: string;
  meta_description?: string;
}

interface UploadedImage {
  id?: number;
  file?: File;
  url?: string; // For existing images from server
  preview: string; // For blob URLs or existing URLs
  alt_text?: string;
  sort_order?: number;
  isExisting?: boolean; // Flag to identify server images vs new uploads
}

export default function ProductForm({ product, onSubmit, onCancel, isLoading, mode }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    short_description: '',
    sku: '',
    price: 0,
    sale_price: undefined,
    stock_quantity: 0,
    status: 'draft',
    is_featured: false,
    category_id: 0,
    vendor_id: 0,
    weight: undefined,
    dimensions: '',
    meta_title: '',
    meta_description: '',
  });

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [thumbnail, setThumbnail] = useState<File | string | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Get the toast notification functionality
  const { showToast, showError, showSuccess, showWarning } = useToast();

  // Fetch categories and vendors for dropdowns
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.getCategories({}),
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['admin-vendors', { status: 'approved' }],
    queryFn: () => adminApi.getVendors({ status: 'approved' }),
  });

  const categories = categoriesData?.data || [];
  const vendors = vendorsData?.data || [];

  // Initialize form with product data if editing
  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        short_description: product.short_description || '',
        sku: product.sku || '',
        price: product.price ? parseFloat(product.price.toString()) : 0,
        sale_price: product.sale_price ? parseFloat(product.sale_price.toString()) : undefined,
        stock_quantity: product.stock_quantity || 0,
        status: product.status || 'draft',
        is_featured: product.is_featured || false,
        category_id: product.category?.id || 0,
        vendor_id: product.vendor?.id || 0,
        weight: product.weight,
        dimensions: product.dimensions || '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
      });

      // Set existing images
      if (product.images && product.images.length > 0) {
        const existingImages: UploadedImage[] = product.images.map((img, index) => ({
          id: typeof img.id === 'string' ? parseInt(img.id) : img.id,
          url: img.file_url,
          preview: img.file_url, // For existing images, preview is same as URL
          alt_text: img.alt_text || '',
          sort_order: index,
          isExisting: true
        }));
        setImages(existingImages);
      }

      // Set existing thumbnail
      if ((product as any).thumbnail) {
        setThumbnail((product as any).thumbnail);
      }
    }
  }, [product, mode]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteExistingImage = async (imageId: number, productId: string | number) => {
    try {
      await adminApi.deleteProductImage(productId, imageId);
      // Image will be removed from state by the component
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error; // Re-throw so component can handle the error
    }
  };

  const handleDeleteExistingThumbnail = async (productId: string | number) => {
    try {
      // Assuming there's an API endpoint for deleting thumbnails
      // If not, we'll handle it differently
      console.log('Delete thumbnail for product:', productId);
      // For now, just clear it locally - implement API call if available
    } catch (error) {
      console.error('Error deleting thumbnail:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate images
      const requiredImageCount = 1; // At least one image required
      const maxImageCount = 10;     // Maximum 10 images allowed
      
      if (images.length < requiredImageCount) {
        showError('Please upload at least one product image.');
        return;
      }
      
      if (images.length > maxImageCount) {
        showError(`Too many images. Maximum ${maxImageCount} images allowed.`);
        return;
      }
      
      // Submit the basic product data along with images and thumbnail
      const productData: Partial<Product> = {
        ...formData,
        price: formData.price.toString(),
        sale_price: formData.sale_price?.toString() || null,
      };
      
      // Pass the data, images, and thumbnail to the parent component
      onSubmit(productData, images, thumbnail instanceof File ? thumbnail : undefined);
      
    } catch (error) {
      console.error('Error submitting product:', error);
      showError('Failed to submit product. Please check your inputs and try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Basic Information</CardTitle>
            <CardDescription className="text-gray-400">
              Enter the basic details for your product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SKU *
                </label>
                <Input
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Enter SKU"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                required
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Short Description
              </label>
              <textarea
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                placeholder="Enter short description"
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing and Inventory */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Pricing & Inventory</CardTitle>
            <CardDescription className="text-gray-400">
              Set pricing and stock information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Regular Price *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sale Price
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sale_price || ''}
                  onChange={(e) => handleInputChange('sale_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stock Quantity *
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category and Settings */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Category & Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Assign category and configure product settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <CustomSelect
                  value={formData.category_id.toString()}
                  onValueChange={(value) => handleInputChange('category_id', typeof value === 'string' ? parseInt(value) || 0 : value || 0)}
                  placeholder="Select a category"
                  options={[
                    { value: '0', label: 'Select Category' },
                    ...categories.map(category => ({
                      value: category.id.toString(),
                      label: category.name
                    }))
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vendor *
                </label>
                <CustomSelect
                  value={formData.vendor_id.toString()}
                  onValueChange={(value) => handleInputChange('vendor_id', typeof value === 'string' ? parseInt(value) || 0 : value || 0)}
                  placeholder="Select a vendor"
                  options={[
                    { value: '0', label: 'Select Vendor' },
                    ...vendors.map(vendor => ({
                      value: vendor.id.toString(),
                      label: vendor.business_name || vendor.name
                    }))
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status *
                </label>
                <CustomSelect
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  placeholder="Select status"
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                    { value: 'inactive', label: 'Inactive' }
                  ]}
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Featured Product</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images and Thumbnail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thumbnail Upload */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Product Thumbnail</CardTitle>
              <CardDescription className="text-gray-400">
                SEO thumbnail for meta tags and social sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThumbnailUpload
                thumbnail={thumbnail || undefined}
                onThumbnailChange={(newThumbnail) => setThumbnail(newThumbnail || undefined)}
                onDeleteExistingThumbnail={handleDeleteExistingThumbnail}
                productId={product?.id}
                disabled={isLoading}
              />
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Product Gallery</CardTitle>
              <CardDescription className="text-gray-400">
                Upload multiple images for your product gallery. The first image will be the main display image.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                onDeleteExistingImage={handleDeleteExistingImage}
                productId={product?.id}
                maxFiles={10}
                maxSize={5}
                disabled={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Advanced Settings */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Advanced Settings</CardTitle>
                <CardDescription className="text-gray-400">Additional product configuration</CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.00"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dimensions (L x W x H)
                  </label>
                  <Input
                    value={formData.dimensions || ''}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder="e.g., 10 x 5 x 2 cm"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SEO Title
                </label>
                <Input
                  value={formData.meta_title || ''}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="SEO optimized title"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.meta_description || ''}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="SEO optimized description"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Create Product' : 'Update Product'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
