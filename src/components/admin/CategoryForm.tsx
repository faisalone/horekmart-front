'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Category } from '@/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/Switch';
import { CustomSelect } from '@/components/ui/select-custom';
import FormHeader from '@/components/admin/FormHeader';
import { ImageUpload, UploadedImage } from './ImageUpload';
import { Upload, ImageIcon } from 'lucide-react';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: Partial<Category>, image?: File) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
  validationErrors?: Record<string, string[]>;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
}

export default function CategoryForm({ category, onSubmit, onCancel, isLoading, mode, validationErrors }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    parent_id: null,
    sort_order: 0,
    is_active: true,
  });

  const [images, setImages] = useState<UploadedImage[]>([]);

  // Helper function to display field errors
  const getFieldError = (fieldName: string) => {
    if (validationErrors && validationErrors[fieldName]) {
      return validationErrors[fieldName][0]; // Show first error
    }
    return null;
  };

  // Fetch categories for parent selection
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories-all'],
    queryFn: () => adminApi.getCategories({ per_page: 100 }),
  });

  const categories = categoriesData?.data || [];
  
  // Filter out current category and its descendants for parent selection
  const availableParents = categories.filter(cat => {
    if (!category) return true;
    return cat.id !== category.id;
  });

  // Initialize form with category data if editing
  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parent_id: category.parent?.id || null,
        sort_order: category.sort_order || 0,
        is_active: category.is_active !== undefined ? category.is_active : true,
      });

      // Set existing image
      const imageUrl = category.image_url || category.image;
      if (imageUrl) {
        const existingImage: UploadedImage = {
          preview: imageUrl,
          url: imageUrl,
          isExisting: true
        };
        setImages([existingImage]);
      }
    }
  }, [category, mode]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-generate slug from name
    if (field === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields on frontend
    if (!formData.name.trim()) {
      return; // Let the browser validation handle this
    }
    
    if (!formData.slug.trim()) {
      return; // Let the browser validation handle this
    }
    
    const categoryData: Partial<Category> = {
      ...formData,
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description?.trim() || '',
      parent_id: formData.parent_id || null,
      sort_order: formData.sort_order || 0,
      is_active: formData.is_active,
    };
    
    // Get the uploaded image file if any
    const imageFile = images.find(img => !img.isExisting)?.file;
    
    onSubmit(categoryData, imageFile);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <FormHeader
        title={mode === 'create' ? 'Create New Category' : 'Edit Category'}
        subtitle={mode === 'create' 
          ? 'Add a new category to organize your products' 
          : `Editing: ${formData.name || 'Category'}`
        }
        onCancel={onCancel}
        isLoading={isLoading}
        mode={mode}
        formId="category-form"
        entityName="Category"
      />

      <div className="px-6 pb-6">
        <form id="category-form" onSubmit={handleSubmit} className="xl:grid xl:grid-cols-3 xl:gap-6 space-y-6 xl:space-y-0">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Add proper spacing before Basic Information */}
            <div className="pt-6">
              {/* Basic Information */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Basic Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Essential details for your category
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-200">Category Name *</label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter category name"
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                      getFieldError('name') ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    required
                  />
                  {getFieldError('name') && (
                    <p className="text-sm text-red-500">{getFieldError('name')}</p>
                  )}
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-200">URL Slug *</label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="category-slug"
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                      getFieldError('slug') ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    required
                  />
                  {getFieldError('slug') && (
                    <p className="text-sm text-red-500">{getFieldError('slug')}</p>
                  )}
                  {!getFieldError('slug') && (
                    <p className="text-xs text-gray-500">This will be used in the URL</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-200">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter category description"
                    rows={4}
                    className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getFieldError('description') ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {getFieldError('description') && (
                    <p className="text-sm text-red-500">{getFieldError('description')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Category Organization */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Category Organization</CardTitle>
                <CardDescription className="text-gray-400">
                  Set the category structure and display order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Parent Category */}
                <div className="space-y-2">
                  <label htmlFor="parent_id" className="block text-sm font-medium text-gray-200">Parent Category</label>
                  <CustomSelect
                    value={formData.parent_id ? formData.parent_id.toString() : ''}
                    onValueChange={(value: string | number) => {
                      const stringValue = typeof value === 'string' ? value : value.toString();
                      handleInputChange('parent_id', stringValue === '' ? null : parseInt(stringValue));
                    }}
                    placeholder="Select parent category"
                    options={[
                      { value: '', label: 'None (Top Level Category)' },
                      ...availableParents.map((cat) => ({
                        value: cat.id.toString(),
                        label: cat.name
                      }))
                    ]}
                    className={`${
                      getFieldError('parent_id') ? 'border-red-500' : ''
                    }`}
                  />
                  {getFieldError('parent_id') && (
                    <p className="text-sm text-red-500">{getFieldError('parent_id')}</p>
                  )}
                  {!getFieldError('parent_id') && (
                    <p className="text-xs text-gray-500">Choose a parent to create a subcategory, or leave empty for a main category</p>
                  )}
                </div>

                {/* Display Order */}
                <div className="space-y-2">
                  <label htmlFor="sort_order" className="block text-sm font-medium text-gray-200">Display Order</label>
                  <div className="relative">
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      max="9999"
                      step="1"
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-20 ${
                        getFieldError('sort_order') ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                      {(formData.sort_order || 0) <= 10 && (
                        <span className="px-2 py-1 bg-amber-900/50 text-amber-300 text-xs rounded-full font-medium">
                          ⭐
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-mono">
                        #{String(formData.sort_order || 0).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  {getFieldError('sort_order') && (
                    <p className="text-sm text-red-500">{getFieldError('sort_order')}</p>
                  )}
                  {!getFieldError('sort_order') && (
                    <p className="text-xs text-gray-500">
                      Lower numbers appear first • {(formData.sort_order || 0) <= 10 ? 'Featured position' : 'Standard position'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Image */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Category Image</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload an image to represent this category visually
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxFiles={1}
                  maxSize={5}
                  className="min-h-32"
                  disabled={isLoading}
                  allowReorder={false}
                />
                {getFieldError('image') && (
                  <p className="text-sm text-red-500 mt-2">{getFieldError('image')}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Settings */}
          <div className="xl:col-span-1 space-y-6">
            <div className="xl:sticky xl:top-[120px] space-y-6 z-10">
              {/* Status & Visibility */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Status & Visibility</CardTitle>
                  <CardDescription className="text-gray-400">
                    Control category availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                      label="Active Status"
                      description="When enabled, this category will be visible to customers and available for product organization"
                      size="md"
                    />
                    {getFieldError('is_active') && (
                      <p className="text-sm text-red-500">{getFieldError('is_active')}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        formData.is_active 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {formData.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Type:</span>
                      <span className="text-gray-400 text-xs">
                        {formData.parent_id ? 'Subcategory' : 'Main Category'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Display Order:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-xs">
                          {formData.sort_order || 0}
                        </span>
                        {(formData.sort_order || 0) <= 10 && (
                          <span className="px-1.5 py-0.5 bg-green-900/30 text-green-400 text-xs rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
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
