'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Product, Category, Vendor, ProductVariant } from '@/types/admin';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/select-custom';
import FormHeader from '@/components/admin/FormHeader';
import { ThumbnailUpload } from '@/components/admin/ThumbnailUpload';
import { ImageUpload, UploadedImage as ImageUploadType } from '@/components/admin/ImageUpload';
import ProductVariantManager from '@/components/admin/ProductVariantManager';
import { useToast } from '@/hooks/useToast';
import {
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
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
  weight_unit?: 'kg' | 'g';
  dimensions?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  focus_keyword?: string;
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
    weight_unit: 'kg',
    dimensions: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    focus_keyword: '',
  });

  const [keywordInput, setKeywordInput] = useState('');
  
  // Comprehensive list of available tags
  const allAvailableTags = [
    'electronics', 'smartphone', 'laptop', 'accessories', 'gaming', 'home', 'fashion', 'books', 'sports', 'beauty', 
    'automotive', 'health', 'technology', 'mobile', 'computer', 'tablet', 'headphones', 'speakers', 'camera', 'tv',
    'kitchen', 'furniture', 'decor', 'garden', 'tools', 'outdoor', 'fitness', 'travel', 'music', 'movies',
    'clothing', 'shoes', 'jewelry', 'watches', 'bags', 'makeup', 'skincare', 'perfume', 'toys', 'kids',
    'office', 'stationery', 'art', 'craft', 'pets', 'food', 'drinks', 'supplements', 'medical', 'baby'
  ];

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [thumbnail, setThumbnail] = useState<File | string | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  
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
        weight_unit: product.weight_unit || 'kg',
        dimensions: product.dimensions || '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        meta_keywords: (product as any).meta_keywords || '',
        canonical_url: (product as any).canonical_url || '',
        og_title: (product as any).og_title || '',
        og_description: (product as any).og_description || '',
        focus_keyword: (product as any).focus_keyword || '',
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

      // Set existing variants
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
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
      await adminApi.deleteProductThumbnail(productId);
      // Clear the local thumbnail state
      setThumbnail(undefined);
    } catch (error) {
      console.error('Error deleting thumbnail:', error);
      throw error;
    }
  };

  // Auto-generate SKU - always exactly 10 digits with product name
  const generateProductSKU = useCallback(() => {
    if (!formData.name.trim()) return '';
    
    // Extract meaningful characters from product name
    // Example: "iPhone 15 Pro" -> "I1P"
    const nameCode = formData.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .replace(/[^A-Z0-9]/g, '') // Only keep letters and numbers
      .substring(0, 4); // Max 4 characters from name for better representation
    
    // If editing existing product, use product ID
    if (product?.id) {
      const productIdStr = product.id.toString();
      const hmPrefix = 'HM';
      
      // Format: HM{nameCode}XXX{productId} - exactly 10 chars
      const usedLength = hmPrefix.length + nameCode.length + productIdStr.length;
      const paddingLength = Math.max(0, 10 - usedLength);
      const padding = 'X'.repeat(paddingLength);
      
      const sku = `${hmPrefix}${nameCode}${padding}${productIdStr}`;
      
      // Ensure exactly 10 characters
      return sku.length > 10 ? sku.substring(0, 10) : sku.padEnd(10, 'X');
    }
    
    // For new products, generate a temporary SKU with timestamp and name
    const timestamp = Date.now().toString().slice(-2); // Last 2 digits
    const hmPrefix = 'HM';
    
    // Format: HM{nameCode}XX{timestamp}
    const usedLength = hmPrefix.length + nameCode.length + timestamp.length;
    const paddingLength = Math.max(0, 10 - usedLength);
    const padding = 'X'.repeat(paddingLength);
    
    const sku = `${hmPrefix}${nameCode}${padding}${timestamp}`;
    
    // Ensure exactly 10 characters
    return sku.length > 10 ? sku.substring(0, 10) : sku.padEnd(10, 'X');
  }, [formData.name, product]);

  // Auto-generate SKU when product name changes (only if SKU is empty or matches previous auto-generated pattern)
  useEffect(() => {
    if (formData.name.trim() && (!formData.sku.trim() || formData.sku.startsWith('HM'))) {
      const generatedSKU = generateProductSKU();
      if (generatedSKU && generatedSKU !== formData.sku) {
        handleInputChange('sku', generatedSKU);
      }
    }
  }, [formData.name, formData.sku, generateProductSKU, handleInputChange]);

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
    <div className="max-w-7xl mx-auto">
      <FormHeader
        title={mode === 'create' ? 'Create New Product' : 'Edit Product'}
        subtitle={mode === 'create' 
          ? 'Add a new product to your inventory' 
          : `Editing: ${formData.name || 'Product'}`
        }
        onCancel={onCancel}
        isLoading={isLoading}
        mode={mode}
        formId="product-form"
        entityName="Product"
      />

      <div className="px-6 pb-6">
        <form id="product-form" onSubmit={handleSubmit} className="xl:grid xl:grid-cols-3 xl:gap-6 space-y-6 xl:space-y-0">
        {/* Left Column - Main Content */}
        <div className="xl:col-span-2 space-y-6">
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
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().substring(0, 10);
                      handleInputChange('sku', value);
                    }}
                    placeholder="Auto-generated or enter manually"
                    required
                    maxLength={10}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 font-mono"
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

          {/* Images and Thumbnail */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Product Images */}
          <Card className="bg-gray-800 border-gray-700">
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

        {/* Product Variants */}
        <ProductVariantManager
          productId={product?.id}
          productName={formData.name}
          variants={variants}
          onVariantsChange={setVariants}
          disabled={isLoading || (mode === 'create' && !product?.id)}
        />

        {/* SEO & Meta Settings */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">SEO & Meta Settings</CardTitle>
                <CardDescription className="text-gray-400">Search engine optimization and meta information</CardDescription>
              </div>
              <div className="text-gray-300">
                {showAdvanced ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </div>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-4">
              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SEO Thumbnail
                </label>
                <div className="text-sm text-gray-400 mb-2">
                  Used for meta tags, social sharing, and search engine previews
                </div>
                <ThumbnailUpload
                  thumbnail={thumbnail || undefined}
                  onThumbnailChange={(newThumbnail) => setThumbnail(newThumbnail || undefined)}
                  onDeleteExistingThumbnail={handleDeleteExistingThumbnail}
                  productId={product?.id}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SEO Title
                </label>
                <Input
                  value={formData.meta_title || ''}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="SEO optimized title (55-60 characters recommended)"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {formData.meta_title?.length || 0}/60 characters
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.meta_description || ''}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="SEO optimized description (150-160 characters recommended)"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {formData.meta_description?.length || 0}/160 characters
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Keywords
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.meta_keywords?.split(',').filter(tag => tag.trim()).map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        {tag.trim()}
                        <button
                          type="button"
                          onClick={() => {
                            const tags = formData.meta_keywords?.split(',').filter(t => t.trim() !== tag.trim()) || [];
                            handleInputChange('meta_keywords', tags.join(', '));
                          }}
                          className="ml-1 text-blue-200 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = keywordInput.trim();
                        if (value) {
                          const currentTags = formData.meta_keywords?.split(',').map(t => t.trim()).filter(t => t) || [];
                          if (!currentTags.includes(value)) {
                            const newTags = [...currentTags, value];
                            handleInputChange('meta_keywords', newTags.join(', '));
                          }
                          setKeywordInput('');
                        }
                      }
                    }}
                    placeholder="Type a keyword and press Enter"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const currentTags = formData.meta_keywords?.split(',').map(t => t.trim()).filter(t => t) || [];
                      const availableTags = allAvailableTags.filter(tag => !currentTags.includes(tag));
                      const tagsToShow = availableTags.slice(0, Math.min(12, availableTags.length));
                      
                      return tagsToShow.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const newTags = [...currentTags, tag];
                            handleInputChange('meta_keywords', newTags.join(', '));
                          }}
                          className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded hover:bg-gray-500 hover:text-white transition-colors"
                        >
                          + {tag}
                        </button>
                      ));
                    })()}
                  </div>
                  {(() => {
                    const currentTags = formData.meta_keywords?.split(',').map(t => t.trim()).filter(t => t) || [];
                    const availableTags = allAvailableTags.filter(tag => !currentTags.includes(tag));
                    const remainingCount = availableTags.length;
                    
                    if (remainingCount > 12) {
                      return (
                        <div className="text-xs text-gray-400">
                          {remainingCount - 12} more tags available...
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Focus Keyword
                  </label>
                  <Input
                    value={formData.focus_keyword || ''}
                    onChange={(e) => handleInputChange('focus_keyword', e.target.value)}
                    placeholder="Primary keyword for this product"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Main keyword you want to rank for in search engines
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Canonical URL
                </label>
                <Input
                  value={formData.canonical_url || ''}
                  onChange={(e) => handleInputChange('canonical_url', e.target.value)}
                  placeholder="https://example.com/products/product-name"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Full URL for canonical link tag
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Open Graph Title
                </label>
                <Input
                  value={formData.og_title || ''}
                  onChange={(e) => handleInputChange('og_title', e.target.value)}
                  placeholder="Title for social media sharing"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Open Graph Description
                </label>
                <textarea
                  value={formData.og_description || ''}
                  onChange={(e) => handleInputChange('og_description', e.target.value)}
                  placeholder="Description for social media sharing"
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </CardContent>
          )}
        </Card>
        </div>

        {/* Right Sidebar - Sticky */}
        <div className="xl:col-span-1 space-y-6">
          <div className="xl:sticky xl:top-[120px] space-y-6 z-10">
            {/* Pricing and Inventory */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Pricing & Inventory</CardTitle>
                <CardDescription className="text-gray-400">
                  Set pricing and stock information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Category and Settings */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Category & Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Organization and classification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      className="rounded bg-gray-700 border-gray-600"
                    />
                    <span>Featured Product</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Shipping Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure product shipping details and weight
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-2">
                    Weight
                  </label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.50"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weight Unit
                  </label>
                  <CustomSelect
                    value={formData.weight_unit || 'kg'}
                    onValueChange={(value) => handleInputChange('weight_unit', value as 'kg' | 'g')}
                    placeholder="Select weight unit"
                    options={[
                      { value: 'kg', label: 'Kilograms (kg)' },
                      { value: 'g', label: 'Grams (g)' }
                    ]}
                  />
                </div>
                <div>
                  <label htmlFor="dimensions" className="block text-sm font-medium text-gray-300 mb-2">
                    Dimensions
                  </label>
                  <Input
                    id="dimensions"
                    type="text"
                    value={formData.dimensions || ''}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder="L x W x H"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}
