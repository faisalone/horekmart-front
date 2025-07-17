'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Variation, VariationValue } from '@/types/admin';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Settings,
  Tag,
} from 'lucide-react';

interface VariationManagerProps {
  onClose?: () => void;
}

export default function VariationManager({ onClose }: VariationManagerProps) {
  const [isAddingVariation, setIsAddingVariation] = useState(false);
  const [isAddingValue, setIsAddingValue] = useState<number | null>(null);
  const [editingVariation, setEditingVariation] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<number | null>(null);
  
  const [variationForm, setVariationForm] = useState({ name: '', slug: '' });
  const [valueForm, setValueForm] = useState({ name: '', slug: '', variation_id: 0 });

  const { showToast, showError, showSuccess } = useToast();
  const queryClient = useQueryClient();

  // Fetch variations and their values
  const { data: variations = [], isLoading } = useQuery({
    queryKey: ['variations'],
    queryFn: () => adminApi.getVariations(),
  });

  const { data: allVariationValues = [] } = useQuery({
    queryKey: ['variation-values'],
    queryFn: () => adminApi.getVariationValues(),
  });

  // Variation mutations
  const createVariationMutation = useMutation({
    mutationFn: (data: { name: string; slug?: string }) =>
      adminApi.createVariation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variations'] });
      resetVariationForm();
      showSuccess('Variation created successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to create variation');
    },
  });

  const updateVariationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; slug?: string } }) =>
      adminApi.updateVariation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variations'] });
      resetVariationForm();
      showSuccess('Variation updated successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to update variation');
    },
  });

  const deleteVariationMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteVariation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variations'] });
      queryClient.invalidateQueries({ queryKey: ['variation-values'] });
      showSuccess('Variation deleted successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to delete variation');
    },
  });

  // Variation value mutations
  const createValueMutation = useMutation({
    mutationFn: (data: { variation_id: number; name: string; slug?: string }) =>
      adminApi.createVariationValue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variation-values'] });
      resetValueForm();
      showSuccess('Variation value created successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to create variation value');
    },
  });

  const updateValueMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { variation_id: number; name: string; slug?: string } }) =>
      adminApi.updateVariationValue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variation-values'] });
      resetValueForm();
      showSuccess('Variation value updated successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to update variation value');
    },
  });

  const deleteValueMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteVariationValue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variation-values'] });
      showSuccess('Variation value deleted successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to delete variation value');
    },
  });

  const resetVariationForm = () => {
    setVariationForm({ name: '', slug: '' });
    setIsAddingVariation(false);
    setEditingVariation(null);
  };

  const resetValueForm = () => {
    setValueForm({ name: '', slug: '', variation_id: 0 });
    setIsAddingValue(null);
    setEditingValue(null);
  };

  const handleVariationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVariation) {
      updateVariationMutation.mutate({ 
        id: editingVariation, 
        data: { 
          name: variationForm.name, 
          slug: variationForm.slug || undefined 
        } 
      });
    } else {
      createVariationMutation.mutate({ 
        name: variationForm.name, 
        slug: variationForm.slug || undefined 
      });
    }
  };

  const handleValueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingValue) {
      updateValueMutation.mutate({ 
        id: editingValue, 
        data: { 
          variation_id: valueForm.variation_id,
          name: valueForm.name, 
          slug: valueForm.slug || undefined 
        } 
      });
    } else {
      createValueMutation.mutate({ 
        variation_id: valueForm.variation_id,
        name: valueForm.name, 
        slug: valueForm.slug || undefined 
      });
    }
  };

  const handleEditVariation = (variation: Variation) => {
    setEditingVariation(variation.id);
    setIsAddingVariation(true);
    setVariationForm({ name: variation.name, slug: variation.slug });
  };

  const handleEditValue = (value: VariationValue) => {
    setEditingValue(value.id);
    setIsAddingValue(value.variation_id);
    setValueForm({ 
      name: value.name, 
      slug: value.slug,
      variation_id: value.variation_id 
    });
  };

  const handleDeleteVariation = (id: number) => {
    if (window.confirm('Are you sure you want to delete this variation? This will also delete all its values.')) {
      deleteVariationMutation.mutate(id);
    }
  };

  const handleDeleteValue = (id: number) => {
    if (window.confirm('Are you sure you want to delete this variation value?')) {
      deleteValueMutation.mutate(id);
    }
  };

  const getValuesForVariation = (variationId: number) => {
    return allVariationValues.filter(value => value.variation_id === variationId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Variation Management
          </h1>
          <p className="text-gray-400 mt-2">
            Manage product variations (Size, Color, etc.) and their values
          </p>
        </div>
        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        )}
      </div>

      {/* Add Variation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Variations</CardTitle>
            {!isAddingVariation && (
              <Button
                onClick={() => setIsAddingVariation(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variation
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add/Edit Variation Form */}
          {isAddingVariation && (
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="pt-6">
                <form onSubmit={handleVariationSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Variation Name *
                      </label>
                      <Input
                        value={variationForm.name}
                        onChange={(e) => setVariationForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Size, Color, Material"
                        required
                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Slug (optional)
                      </label>
                      <Input
                        value={variationForm.slug}
                        onChange={(e) => setVariationForm(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="Auto-generated if empty"
                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetVariationForm}
                      className="border-gray-500 text-gray-300 hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createVariationMutation.isPending || updateVariationMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingVariation ? 'Update' : 'Create'} Variation
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Variations List */}
          {variations.length > 0 ? (
            <div className="space-y-4">
              {variations.map((variation) => (
                <Card key={variation.id} className="bg-gray-700 border-gray-600">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-medium text-lg">{variation.name}</h3>
                        <p className="text-gray-400 text-sm">Slug: {variation.slug}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsAddingValue(variation.id);
                            setValueForm(prev => ({ ...prev, variation_id: variation.id }));
                          }}
                          className="border-green-500 text-green-400 hover:bg-green-600 hover:text-white"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Value
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVariation(variation)}
                          className="border-gray-500 text-gray-300 hover:bg-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVariation(variation.id)}
                          disabled={deleteVariationMutation.isPending}
                          className="border-red-500 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Add Value Form */}
                    {isAddingValue === variation.id && (
                      <Card className="bg-gray-600 border-gray-500 mb-4">
                        <CardContent className="pt-4">
                          <form onSubmit={handleValueSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Value Name *
                                </label>
                                <Input
                                  value={valueForm.name}
                                  onChange={(e) => setValueForm(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="e.g., Small, Red, Cotton"
                                  required
                                  className="bg-gray-500 border-gray-400 text-white placeholder-gray-400 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Slug (optional)
                                </label>
                                <Input
                                  value={valueForm.slug}
                                  onChange={(e) => setValueForm(prev => ({ ...prev, slug: e.target.value }))}
                                  placeholder="Auto-generated if empty"
                                  className="bg-gray-500 border-gray-400 text-white placeholder-gray-400 focus:border-blue-500"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={resetValueForm}
                                className="border-gray-400 text-gray-300 hover:bg-gray-500"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={createValueMutation.isPending || updateValueMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                {editingValue ? 'Update' : 'Add'} Value
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Variation Values */}
                    <div className="space-y-2">
                      <h4 className="text-gray-300 font-medium flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Values ({getValuesForVariation(variation.id).length})
                      </h4>
                      {getValuesForVariation(variation.id).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {getValuesForVariation(variation.id).map((value) => (
                            <div
                              key={value.id}
                              className="flex items-center justify-between bg-gray-600 p-2 rounded"
                            >
                              <span className="text-white text-sm">{value.name}</span>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditValue(value)}
                                  className="text-gray-300 hover:text-white h-6 w-6 p-0"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteValue(value.id)}
                                  disabled={deleteValueMutation.isPending}
                                  className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm italic">No values added yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No variations created yet</p>
              <p className="text-sm">Create variations like Size, Color, Material to enable product variants</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
