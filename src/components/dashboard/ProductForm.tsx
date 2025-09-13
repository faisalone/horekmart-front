'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Product, Category, Vendor, ProductVariant } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/select-custom';
import FormHeader from '@/components/dashboard/FormHeader';
import { ThumbnailUpload } from '@/components/dashboard/ThumbnailUpload';
import { ImageUpload, UploadedImage as ImageUploadType } from '@/components/dashboard/ImageUpload';
import ProductVariantManager from '@/components/dashboard/ProductVariantManager';
import { toast } from 'sonner';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Switch } from '@/components/ui/Switch';
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
  price: number | string;
  sale_price?: number | string;
  stock_quantity: number | string;
  status: 'published' | 'draft' | 'archived';
  is_featured: boolean;
  category_id: number;
  vendor_id: number;
  weight?: number | string;
  weight_unit?: 'kg' | 'g';
  dimensions?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  focus_keyword?: string;
  social_links?: {
    facebook?: string[];
    instagram?: string[];
    youtube?: string[];
  } | null;
}

interface UploadedImage {
  id?: number | string; // Allow both number and string for UUIDs
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
    price: '',
    sale_price: undefined,
    stock_quantity: '',
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
  social_links: { facebook: [], instagram: [], youtube: [] },
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
  const [thumbnail, setThumbnail] = useState<File | string | null | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get the toast notification functionality
  // const { showToast, showError, showSuccess, showWarning } = useToast();

  // Error display component
  const ErrorMessage = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <div className="text-red-400 text-sm mt-1 flex items-center">
        <span className="text-red-400 mr-1">⚠</span>
        {errors[field]}
      </div>
    );
  };

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

  // Helpers for social entries
  type SocialPlatform = 'facebook' | 'instagram' | 'youtube';
  type SocialEntry = { id: string; platform: SocialPlatform; url: string };
  const [socialEntries, setSocialEntries] = useState<SocialEntry[]>([]);
  const createEmptyEntry = useCallback((platform: SocialPlatform = 'facebook'): SocialEntry => ({ id: crypto.randomUUID(), platform, url: '' }), []);
  const ensureSingleEmptyRow = useCallback((entries: SocialEntry[]): SocialEntry[] => {
    if (!entries || entries.length === 0) return [createEmptyEntry('facebook')];
    const nonEmpty = entries.filter(e => e.url.trim() !== '');
    const lastPlatform = (entries[entries.length - 1]?.platform) || 'facebook';
    // Always ensure exactly one empty row at the end
    return [...nonEmpty, createEmptyEntry(lastPlatform as SocialPlatform)];
  }, [createEmptyEntry]);

  // Initialize form with product data if editing
  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        short_description: product.short_description || '',
        sku: product.sku || '',
        price: product.price ? parseFloat(product.price.toString()) : '',
        sale_price: product.sale_price ? parseFloat(product.sale_price.toString()) : undefined,
        stock_quantity: product.stock_quantity || '',
        status: product.status || 'draft',
        is_featured: product.is_featured || false,
        category_id: product.category?.id || 0,
        vendor_id: product.vendor?.id || 0,
        weight: product.weight || undefined,
        weight_unit: product.weight_unit || 'kg',
        dimensions: product.dimensions || '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        meta_keywords: (product as any).meta_keywords || '',
        canonical_url: (product as any).canonical_url || '',
        og_title: (product as any).og_title || '',
        og_description: (product as any).og_description || '',
        focus_keyword: (product as any).focus_keyword || '',
  social_links: product.social_links || { facebook: [], instagram: [], youtube: [] },
      });

      // Set existing images using new images format with UUID and URL
      if (product.images && product.images.length > 0) {
        const existingImages: UploadedImage[] = product.images.map((img: any, index) => ({
          id: img.id, // Use actual UUID as id
          url: img.url,
          preview: img.url,
          alt_text: '',
          sort_order: index,
          isExisting: true
        }));
        setImages(existingImages);
      }

      // Set existing thumbnail
      if (product.thumb) {
        setThumbnail(product.thumb);
      }

      // Set existing variants
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
      }

      // Initialize dynamic social entries from product.social_links
      const entries: SocialEntry[] = [];
      const sl = product.social_links || {} as NonNullable<ProductFormData['social_links']>;
      (sl.facebook || []).forEach((url) => entries.push({ id: crypto.randomUUID(), platform: 'facebook', url }));
      (sl.instagram || []).forEach((url) => entries.push({ id: crypto.randomUUID(), platform: 'instagram', url }));
      (sl.youtube || []).forEach((url) => entries.push({ id: crypto.randomUUID(), platform: 'youtube', url }));
      setSocialEntries((prev) => ensureSingleEmptyRow(entries));
    }
  }, [product, mode, ensureSingleEmptyRow]);

  // For create mode, ensure entries reflect default social_links
  useEffect(() => {
    if (!product && mode === 'create') {
      setSocialEntries([createEmptyEntry('facebook')]);
    }
  }, [product, mode, createEmptyEntry]);

  // Keep formData.social_links in sync with dynamic entries
  const syncEntriesToForm = useCallback((entries: SocialEntry[]) => {
    const grouped: NonNullable<ProductFormData['social_links']> = {
      facebook: [],
      instagram: [],
      youtube: [],
    };
    entries.forEach((e) => {
      if (!e.url.trim()) return;
      grouped[e.platform] = [...(grouped[e.platform] || []), e.url.trim()];
    });
    setFormData((prev) => ({
      ...prev,
      social_links: {
        facebook: grouped.facebook?.length ? grouped.facebook : [],
        instagram: grouped.instagram?.length ? grouped.instagram : [],
        youtube: grouped.youtube?.length ? grouped.youtube : [],
      }
    }));
  }, []);

  const updateSocialEntry = (id: string, patch: Partial<SocialEntry>) => {
    // Update
    let next = socialEntries.map((e) => (e.id === id ? { ...e, ...patch } as SocialEntry : e));
    // Ensure only one empty row at the end and auto-append when last gets filled
    const idx = next.findIndex(e => e.id === id);
    const isLast = idx === next.length - 1;
    const becameNonEmpty = (patch.url !== undefined) ? patch.url.trim() !== '' : next[idx].url.trim() !== '';
    if (isLast && becameNonEmpty) {
      const lastPlatform = next[idx].platform;
      next = [...next, createEmptyEntry(lastPlatform)];
    }
    // Collapse to one empty row at the end
    next = ensureSingleEmptyRow(next);
    setSocialEntries(next);
    syncEntriesToForm(next);
  };

  const removeSocialEntry = (id: string) => {
    const idx = socialEntries.findIndex(e => e.id === id);
    // Do not remove the last row; also protect against removing when only a single row exists
    if (idx === socialEntries.length - 1 || socialEntries.length === 1) {
      return;
    }
    let next = socialEntries.filter((e) => e.id !== id);
    if (next.length === 0) next = [createEmptyEntry('facebook')];
    next = ensureSingleEmptyRow(next);
    setSocialEntries(next);
    syncEntriesToForm(next);
  };

  const handleInputChange = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Clear errors when user starts typing
  const clearError = useCallback((field: keyof ProductFormData) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation - required, max 255 chars
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Product name must not exceed 255 characters';
    }

    // Description validation - required
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    // SKU validation - required for edit, optional for create
    if (mode === 'edit' && !formData.sku.trim()) {
      newErrors.sku = 'SKU is required when editing products';
    }

    // Price validation - required, numeric, min 0
    if (!formData.price || formData.price === '' || Number(formData.price) <= 0) {
      newErrors.price = 'Regular price is required and must be greater than 0';
    }

    // Sale price validation - if provided, must be numeric and less than regular price
    if (formData.sale_price && formData.sale_price !== '') {
      const salePrice = Number(formData.sale_price);
      const regularPrice = Number(formData.price);
      if (salePrice < 0) {
        newErrors.sale_price = 'Sale price must be 0 or greater';
      } else if (salePrice >= regularPrice) {
        newErrors.sale_price = 'Sale price must be less than regular price';
      }
    }

    // Stock quantity validation - nullable but if provided must be integer >= 0
    if (formData.stock_quantity !== '' && formData.stock_quantity !== undefined) {
      const stockQty = Number(formData.stock_quantity);
      if (!Number.isInteger(stockQty) || stockQty < 0) {
        newErrors.stock_quantity = 'Stock quantity must be a whole number 0 or greater';
      }
    }

    // Weight validation - if provided must be numeric >= 0
    if (formData.weight && formData.weight !== '') {
      const weight = Number(formData.weight);
      if (weight < 0) {
        newErrors.weight = 'Weight must be 0 or greater';
      }
    }

    // Category validation - required, must exist
    if (!formData.category_id || formData.category_id === 0) {
      newErrors.category_id = 'Category is required';
    }

    // Vendor validation - required, must exist  
    if (!formData.vendor_id || formData.vendor_id === 0) {
      newErrors.vendor_id = 'Vendor is required';
    }

    // Image validation - require at least one image for new products
    if (mode === 'create' && images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    // Check for invalid image files (size/type validation)
    const invalidImages = images.filter(img => {
      if (!img.file) return false; // Skip existing images
      
      // Check file size (5MB = 5120KB)
      if (img.file.size > 5 * 1024 * 1024) {
        return true;
      }
      
      // Check file type (only jpeg, png, webp allowed)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(img.file.type)) {
        return true;
      }
      
      return false;
    });

    if (invalidImages.length > 0) {
      newErrors.images = 'Some images are invalid. Only JPEG, PNG, WebP files under 5MB are allowed';
    }

    // Thumbnail validation - if provided, check size and type
    if (thumbnail instanceof File) {
      // Check file size (2MB = 2048KB)
      if (thumbnail.size > 2 * 1024 * 1024) {
        newErrors.thumbnail = 'Thumbnail must be under 2MB';
      }
      
      // Check file type (only jpeg, png, webp allowed)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(thumbnail.type)) {
        newErrors.thumbnail = 'Thumbnail must be JPEG, PNG, or WebP format';
      }
    }

    // URL validation for canonical_url
    if (formData.canonical_url && formData.canonical_url.trim()) {
      try {
        new URL(formData.canonical_url);
      } catch {
        newErrors.canonical_url = 'Canonical URL must be a valid URL';
      }
    }

    // Validate social link URLs if present
    const urlRegex = /^(https?:\/\/)[^\s]+$/i;
    // Validate each dynamic entry
    socialEntries.forEach((entry, idx) => {
      if (entry.url && !urlRegex.test(entry.url)) {
        newErrors[`social_links.entry.${idx}`] = `${entry.platform} link must be a valid URL`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      const errorCount = Object.keys(errors).length;
      const errorFields = Object.keys(errors).join(', ');
      
      if (errorCount === 1) {
        toast.error('Please fix the validation error before submitting', {
          description: `Issue with: ${errorFields}`
        });
      } else {
        toast.error(`Please fix ${errorCount} validation errors before submitting`, {
          description: `Issues with: ${errorFields}`
        });
      }
      return;
    }
    
    try {
      // Submit the basic product data along with images and thumbnail
      const productData: Partial<Product> = {
        ...formData,
        price: Number(formData.price).toString(),
        sale_price: formData.sale_price ? Number(formData.sale_price).toString() : null,
        stock_quantity: Number(formData.stock_quantity),
        weight: formData.weight ? Number(formData.weight) : undefined,
      };
      
      // For new products, don't send empty SKU - let backend generate it
      if (mode === 'create' && !formData.sku.trim()) {
        delete productData.sku;
      }
      
      // Pass the data, images, and thumbnail to the parent component
      onSubmit(productData, images, thumbnail instanceof File ? thumbnail : undefined);
      
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('Failed to submit product. Please check your inputs and try again.');
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
          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
              <CardDescription className="text-gray-400">
                Enter the basic details for your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 ${
                    errors.name ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                <ErrorMessage field="name" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <RichTextEditor
                  content={formData.description}
                  onChange={(content) => handleInputChange('description', content)}
                  placeholder="Enter detailed product description with formatting..."
                  disabled={isLoading}
                />
                <ErrorMessage field="description" />
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
                productId={product?.id}
                maxFiles={10}
                maxSize={5}
                disabled={isLoading}
              />
              <ErrorMessage field="images" />
            </CardContent>
          </Card>
        </div>

        {/* Social Media Links - Dedicated Section */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Social Media Links</CardTitle>
            <CardDescription className="text-gray-400">
              Add links to Facebook posts/reels, Instagram reels/carousels, and YouTube videos/shorts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {socialEntries.map((entry, index) => (
              <div key={entry.id} className="flex flex-col sm:flex-row gap-2 items-stretch">
                <select
                  value={entry.platform}
                  onChange={(e) => updateSocialEntry(entry.id, { platform: e.target.value as SocialPlatform })}
                  className="h-10 sm:w-40 text-white focus:outline-none"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                </select>
                <Input
                  value={entry.url}
                  onChange={(e) => updateSocialEntry(entry.id, { url: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const v = entry.url.trim();
                      if (v) {
                        updateSocialEntry(entry.id, { url: v });
                      }
                    }
                  }}
                  placeholder={`Paste ${entry.platform} link and press Enter`}
                  className="h-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeSocialEntry(entry.id)}
                  disabled={index === socialEntries.length - 1 || socialEntries.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

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
                  onThumbnailChange={(newThumbnail) => setThumbnail(newThumbnail)}
                  productId={product?.id}
                  disabled={isLoading}
                />
                <ErrorMessage field="thumbnail" />
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
                    SKU {mode === 'edit' ? '*' : '(Optional - Auto-generated if empty)'}
                  </label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().substring(0, 12);
                      handleInputChange('sku', value);
                    }}
                    placeholder={mode === 'create' ? "Leave empty for auto-generation" : "Enter SKU manually"}
                    maxLength={12}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Regular Price *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 ${
                      errors.price ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  <ErrorMessage field="price" />
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
                    onChange={(e) => handleInputChange('sale_price', e.target.value || undefined)}
                    placeholder="0.00"
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 ${
                      errors.sale_price ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  <ErrorMessage field="sale_price" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock Quantity
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    placeholder="0"
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 ${
                      errors.stock_quantity ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  <ErrorMessage field="stock_quantity" />
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
                    value={formData.category_id > 0 ? formData.category_id.toString() : ''}
                    onValueChange={(value) => handleInputChange('category_id', typeof value === 'string' ? parseInt(value) || 0 : value || 0)}
                    placeholder="Select a category"
                    className={errors.category_id ? 'border-red-500' : ''}
                    options={categories.map(category => ({
                      value: category.id.toString(),
                      label: category.name
                    }))}
                  />
                  <ErrorMessage field="category_id" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vendor *
                  </label>
                  <CustomSelect
                    value={formData.vendor_id > 0 ? formData.vendor_id.toString() : ''}
                    onValueChange={(value) => handleInputChange('vendor_id', typeof value === 'string' ? parseInt(value) || 0 : value || 0)}
                    placeholder="Select a vendor"
                    className={errors.vendor_id ? 'border-red-500' : ''}
                    options={vendors.map(vendor => ({
                      value: vendor.id.toString(),
                      label: vendor.business_name || vendor.name
                    }))}
                  />
                  <ErrorMessage field="vendor_id" />
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
                      { value: 'archived', label: 'Archived' }
                    ]}
                  />
                </div>
                <div className="flex items-center">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                    label="Featured Product"
                    description="Mark this product as featured to highlight it on your store"
                    size="md"
                  />
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
                    onChange={(e) => handleInputChange('weight', e.target.value || undefined)}
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
