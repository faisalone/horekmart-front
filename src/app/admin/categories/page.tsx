'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Category } from '@/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import Badge from '@/components/ui/Badge';
import Filters from '@/components/admin/Filters';
import { categoriesFilterConfig } from '@/config/adminFilters';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Grid,
  List,
  MoreHorizontal,
  FolderTree,
  ChevronDown,
  ChevronRight,
  Package,
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

  const router = useRouter();
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

  // Filter handlers
  const handleFiltersChange = (newFilters: Partial<CategoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      per_page: 15,
      sort_by: 'sort_order',
      sort_order: 'asc',
    });
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
    router.push(`/admin/categories/${category.id}/edit`);
  };

  const handleAdd = () => {
    router.push('/admin/categories/add');
  };

  const handleModalClose = () => {
    // No longer needed
  };

  const categories = categoriesData?.data || [];
  const pagination = categoriesData?.meta;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 mt-1">Manage product categories and subcategories</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-600 rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-r-none border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleAdd}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            title="Add Category"
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
        config={categoriesFilterConfig}
        isLoading={isLoading}
        resultCount={categoriesData?.meta?.total}
        searchQuery={filters.search}
      />

      {/* Categories Display */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Categories ({categoriesData?.meta?.total || 0})</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your product categories
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center">
              <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No Categories Found</h3>
              <p className="text-gray-400 mb-4">
                {filters.search ? 'No categories match your search criteria.' : 'Get started by creating your first category.'}
              </p>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
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
        </CardContent>
      </Card>

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
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Build hierarchical tree structure
  const buildCategoryTree = (categories: Category[]): CategoryTreeNode[] => {
    const categoryMap = new Map<number, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // First pass: create all nodes
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: []
      });
    });

    // Second pass: build the tree
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      if (category.parent) {
        const parent = categoryMap.get(category.parent.id);
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent not in current list, treat as root
          rootCategories.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    // Sort each level by sort_order
    const sortChildren = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      nodes.forEach(node => sortChildren(node.children));
    };
    
    sortChildren(rootCategories);
    return rootCategories;
  };

  interface CategoryTreeNode extends Category {
    children: CategoryTreeNode[];
  }

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategoryRow = (category: CategoryTreeNode, level: number = 0): React.ReactNode[] => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children.length > 0;
    
    const rows: React.ReactNode[] = [
      <tr key={category.id} className="group hover:bg-gray-700/20 transition-all duration-200">
        <td className="py-4 px-6">
          <div className="flex items-center space-x-3" style={{ paddingLeft: `${level * 24}px` }}>
            {/* Expand/Collapse Button */}
            {hasChildren ? (
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-700 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6"></div>
            )}

            {/* Category Image */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
              {(() => {
                const imageUrl = category.image_url || category.image;
                return imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FolderTree className="w-6 h-6 text-gray-400" />
                );
              })()}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <h3 className={`font-semibold text-white truncate ${
                    level === 0 ? 'text-base' : level === 1 ? 'text-sm' : 'text-sm'
                  }`}>
                    {category.name}
                  </h3>
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-200 bg-blue-900/50 border border-blue-600/30 rounded-full shrink-0">
                    {category.sort_order || 0}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 truncate mt-1">{category.slug}</p>
              {category.description && (
                <p className="text-xs text-gray-500 truncate mt-1">{category.description}</p>
              )}
            </div>
          </div>
        </td>

        {/* Products Count */}
        <td className="py-4 px-6">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">
              {category.products_count || 0}
            </span>
          </div>
        </td>

        {/* Status */}
        <td className="py-4 px-6">
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
            category.is_active 
              ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-600/30' 
              : 'bg-red-900/30 text-red-300 border border-red-600/30'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              category.is_active ? 'bg-emerald-400' : 'bg-red-400'
            }`}></div>
            {category.is_active ? 'Active' : 'Inactive'}
          </div>
        </td>

        {/* Actions */}
        <td className="py-4 px-6">
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
              className="h-8 w-8 p-0 hover:bg-gray-700 text-gray-400 hover:text-white"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category)}
              className="h-8 w-8 p-0 hover:bg-red-600/20 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
    ];

    // Add children rows if expanded
    if (hasChildren && isExpanded) {
      category.children.forEach((child) => {
        rows.push(...renderCategoryRow(child, level + 1));
      });
    }

    return rows;
  };

  const categoryTree = buildCategoryTree(categories);

  // Start with all categories collapsed
  React.useEffect(() => {
    setExpandedCategories(new Set());
  }, [categories]);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-750">
            <tr className="border-b border-gray-600">
              <th className="text-left py-4 px-6 font-semibold text-gray-200 text-sm uppercase tracking-wider">
                Category Structure
              </th>
              <th className="text-left py-4 px-6 font-semibold text-gray-200 text-sm uppercase tracking-wider">
                Products
              </th>
              <th className="text-left py-4 px-6 font-semibold text-gray-200 text-sm uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-4 px-6 font-semibold text-gray-200 text-sm uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {categoryTree.map((category) => 
              renderCategoryRow(category, 0)
            )}
          </tbody>
        </table>
      </div>
    </div>
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
        <Card key={category.id} className="overflow-hidden bg-gray-800 border-gray-600 hover:border-gray-500 transition-colors">
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
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <h3 className="font-semibold truncate text-white">{category.name}</h3>
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-200 bg-blue-900/50 border border-blue-600/30 rounded-full shrink-0">
                  {category.sort_order || 0}
                </span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                category.is_active 
                  ? 'bg-green-900/40 text-green-300 border border-green-600/30' 
                  : 'bg-gray-700 text-gray-300 border border-gray-600'
              }`}>
                {category.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-2">{category.slug}</p>
            
            {category.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {category.description}
              </p>
            )}
            
            <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
              <span>{category.products_count || 0} products</span>
            </div>
            
            {category.parent && (
              <p className="text-xs text-gray-500 mb-3">
                Parent: {category.parent.name}
              </p>
            )}
            
            <div className="flex space-x-2 pt-2 border-t border-gray-600">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(category)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(category)}
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
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