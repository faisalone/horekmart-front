'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { SiteSettingCreateRequest, GroupedSiteSettings } from '@/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/Switch';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

const settingTypes = [
  { value: 'string', label: 'String' },
  { value: 'text', label: 'Text (Multi-line)' },
  { value: 'boolean', label: 'Boolean (True/False)' },
  { value: 'integer', label: 'Integer (Number)' },
  { value: 'json', label: 'JSON' },
];

// Dynamic function to format group names consistently
const formatGroupLabel = (groupName: string): string => {
  return groupName
    .toLowerCase()
    .split(/[_\-\s]+/) // Split on underscores, hyphens, and spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
    .join(' '); // Join with spaces
};

const defaultSettingGroups = [
  { value: 'general', label: formatGroupLabel('general') },
  { value: 'seo', label: formatGroupLabel('seo') },
  { value: 'contact', label: formatGroupLabel('contact') },
  { value: 'social', label: formatGroupLabel('social') },
  { value: 'business', label: formatGroupLabel('business') },
  { value: 'features', label: formatGroupLabel('features') },
];

export default function AddSiteSettingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch existing site settings to get dynamic groups
  const { data: settings } = useQuery<GroupedSiteSettings>({
    queryKey: ['siteSettings'],
    queryFn: () => adminApi.getSiteSettings(),
  });

  const [formData, setFormData] = useState<SiteSettingCreateRequest>({
    key: '',
    value: '',
    type: 'string',
    group: 'general',
    description: '',
    is_public: false,
  });

  // Track newly created groups locally
  const [newGroups, setNewGroups] = useState<Array<{value: string, label: string}>>([]);

  // Combine default groups with existing groups from settings and newly created ones
  const settingGroups = React.useMemo(() => {
    const existingGroups = settings ? Object.keys(settings).map(group => ({
      value: group,
      label: formatGroupLabel(group)
    })) : [];
    
    // Merge default groups with existing groups and newly created groups, removing duplicates
    const allGroups = [...defaultSettingGroups, ...existingGroups, ...newGroups];
    const uniqueGroups = allGroups.filter((group, index, self) => 
      index === self.findIndex(g => g.value === group.value)
    );
    
    return uniqueGroups;
  }, [settings, newGroups]);

  const createMutation = useMutation({
    mutationFn: (data: SiteSettingCreateRequest) =>
      adminApi.createSiteSetting(data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      const settingData = response.data || response;
      toast.success('Setting created successfully', {
        description: `${settingData.key} has been added to ${formatGroupLabel(settingData.group)} group`
      });
      router.push('/dashboard/site-settings');
    },
    onError: (error: any) => {
      console.error('Failed to create setting:', error);
      toast.error('Failed to create setting', {
        description: error?.response?.data?.message || 'Please try again'
      });
    },
  });

  const handleInputChange = (field: keyof SiteSettingCreateRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.key.trim() || !formData.group) {
      console.error('Key and group are required');
      return;
    }

    createMutation.mutate(formData);
  };

  const renderValueInput = () => {
    switch (formData.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.value === 'true'}
              onCheckedChange={(checked: boolean) => handleInputChange('value', String(checked))}
            />
            <span className="text-sm cursor-pointer">
              {formData.value === 'true' ? 'True' : 'False'}
            </span>
          </div>
        );

      case 'text':
      case 'json':
        return (
          <textarea
            value={formData.value || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('value', e.target.value)}
            placeholder={`Enter ${formData.type} value`}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 min-h-32"
          />
        );

      case 'integer':
        return (
          <Input
            type="number"
            value={formData.value || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('value', e.target.value)}
            placeholder="Enter number value"
            className="bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={formData.value || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('value', e.target.value)}
            placeholder="Enter setting value"
            className="bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
          />
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Add New Setting</h1>
            <p className="text-gray-400">
              Create a new site setting
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Plus className="h-5 w-5" />
              <span>Setting Details</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure the new setting properties and value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Key */}
              {/* Key */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Setting Key *</label>
                <Input
                  value={formData.key}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('key', e.target.value)}
                  placeholder="e.g., site_name, contact_email"
                  required
                  className="bg-gray-700/50 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
                />
                <p className="text-xs text-gray-400">
                  Unique identifier for this setting (use lowercase with underscores)
                </p>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Setting Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {settingTypes.map((type) => (
                    <option key={type.value} value={type.value} className="bg-gray-700 text-gray-200">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Setting Group</label>
                <SearchableSelect
                  value={formData.group}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, group: String(value) }))}
                  options={settingGroups}
                  placeholder="Select a group or add new"
                  allowNewOptions={true}
                  onAddNewOption={(newGroup) => {
                    // Add to local new groups list
                    const newGroupValue = newGroup.toLowerCase().replace(/\s+/g, '_');
                    const newGroupOption = {
                      value: newGroupValue,
                      label: formatGroupLabel(newGroupValue)
                    };
                    setNewGroups(prev => [...prev, newGroupOption]);
                    // Set as selected group
                    setFormData(prev => ({ ...prev, group: newGroupOption.value }));
                  }}
                />
                <p className="text-xs text-gray-400">
                  Choose from existing groups or create a new one
                </p>
              </div>

              {/* Value */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Setting Value</label>
                {renderValueInput()}
                <p className="text-xs text-gray-400">
                  The value for this setting (can be changed later)
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this setting does"
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 min-h-20"
                />
              </div>

              {/* Is Public */}
              <div className="flex items-center space-x-3">
                <Switch
                  checked={formData.is_public}
                  onCheckedChange={(checked: boolean) => handleInputChange('is_public', checked)}
                />
                <div>
                  <span className="text-sm font-medium cursor-pointer text-gray-200">Public Setting</span>
                  <p className="text-xs text-gray-400">
                    Whether this setting should be exposed to the frontend
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {createMutation.isPending ? 'Creating...' : 'Create Setting'}
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}