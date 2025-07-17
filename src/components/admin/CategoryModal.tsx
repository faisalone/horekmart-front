'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Category } from '@/types/admin';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, ImageIcon } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess?: () => void;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  image: string;
  sort_order: number;
  is_active: boolean;
}

export default function CategoryModal({ isOpen, onClose, category, onSuccess }: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryForm>({
    name: '',
    slug: '',
    description: '',
    parent_id: null,
    image: '',
    sort_order: 0,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  // Fetch categories for parent selection
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories-all'],
    queryFn: () => adminApi.getCategories({ per_page: 100 }),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Category>) => adminApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      onSuccess?.();
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      setErrors(error.response?.data?.errors || {});
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; category: Partial<Category> }) =>
      adminApi.updateCategory(data.id, data.category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      onSuccess?.();
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      setErrors(error.response?.data?.errors || {});
    },
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parent_id: category.parent_id ? category.parent_id.toString() : null,
        image: category.image || '',
        sort_order: category.sort_order || 0,
        is_active: category.is_active ?? true,
      });
    } else {
      resetForm();
    }
  }, [category, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parent_id: null,
      image: '',
      sort_order: 0,
      is_active: true,
    });
    setErrors({});
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing dashes
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data = {
      ...formData,
      parent_id: formData.parent_id === '' || formData.parent_id === 'null' ? null : parseInt(formData.parent_id!),
    };

    if (category) {
      updateMutation.mutate({ id: category.id.toString(), category: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const categories = categoriesData?.data || [];
  const availableParents = categories.filter(c => c.id !== category?.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{category ? 'Edit Category' : 'Add New Category'}</CardTitle>
            <CardDescription>
              {category ? 'Update category information' : 'Create a new product category'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug *
                </label>
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="category-slug"
                  className={errors.slug ? 'border-red-500' : ''}
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Parent Category
                </label>
                <select
                  name="parent_id"
                  value={formData.parent_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Root Category</option>
                  {availableParents.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.parent_id && <p className="text-red-500 text-sm mt-1">{errors.parent_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sort Order
                </label>
                <Input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
                {errors.sort_order && <p className="text-red-500 text-sm mt-1">{errors.sort_order}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category Image
              </label>
              <div className="flex items-center space-x-4">
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Category preview"
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium">
                Active (visible to customers)
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
