'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Category } from '@/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import Badge from '@/components/ui/Badge';
import CategoryModal from '@/components/admin/CategoryModal';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Grid,
  List,
  MoreHorizontal,
  FolderTree,
} from 'lucide-react';

interface CategoryFilters {
  search?: string;
  parent_id?: string | null;
  is_active?: boolean;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export default function CategoriesPage() {
  const [filters, setFilters] = useState<CategoryFilters>({
    page: 1,
    per_page: 15,
    sort_by: 'sort_order',
    sort_order: 'asc',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['admin-categories', filters],
    queryFn: () => adminApi.getCategories(filters),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (key: keyof CategoryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteCategory.mutate(category.id);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const categories = categoriesData?.data || [];
  const pagination = categoriesData?.meta;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-600">Manage product categories and subcategories</p>
        </div>
        <Button className="flex items-center gap-2" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search categories..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={filters.is_active?.toString() || ''}
              onChange={(e) => handleFilterChange('is_active', 
                e.target.value === '' ? undefined : e.target.value === 'true'
              )}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <select
              value={filters.parent_id || ''}
              onChange={(e) => handleFilterChange('parent_id', 
                e.target.value === '' ? null : e.target.value
              )}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Categories</option>
              <option value="null">Root Categories</option>
              {/* Add parent categories here */}
            </select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'list' ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Display */}
      {isLoading ? (
        <div className="text-center py-8">Loading categories...</div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search ? 'No categories match your search criteria.' : 'Get started by creating your first category.'}
            </p>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <CategoriesList 
          categories={categories} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <CategoriesGrid 
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
          >
            Previous
          </Button>
          
          <span className="flex items-center px-4">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
          >
            Next
          </Button>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        category={selectedCategory}
        onSuccess={() => {
          // Modal will handle closing and refresh
        }}
      />
    </div>
  );
}

function CategoriesList({ 
  categories, 
  onEdit, 
  onDelete 
}: { 
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left p-4 font-semibold">Category</th>
              <th className="text-left p-4 font-semibold">Parent</th>
              <th className="text-left p-4 font-semibold">Products</th>
              <th className="text-left p-4 font-semibold">Sort Order</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {category.parent ? (
                    <span className="text-sm text-gray-600">{category.parent.name}</span>
                  ) : (
                    <span className="text-sm text-gray-400">Root Category</span>
                  )}
                </td>
                <td className="p-4">
                  <span className="text-sm">
                    {category.products_count || 0} products
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm">{category.sort_order || 0}</span>
                </td>
                <td className="p-4">
                  <Badge variant={category.is_active ? 'default' : 'secondary'}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(category)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CategoriesGrid({ 
  categories, 
  onEdit, 
  onDelete 
}: { 
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Card key={category.id} className="overflow-hidden">
          {category.image && (
            <div className="aspect-video w-full">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold truncate">{category.name}</h3>
              <Badge variant={category.is_active ? 'default' : 'secondary'}>
                {category.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{category.slug}</p>
            
            {category.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {category.description}
              </p>
            )}
            
            <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
              <span>{category.products_count || 0} products</span>
              <span>Order: {category.sort_order || 0}</span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(category)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(category)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
