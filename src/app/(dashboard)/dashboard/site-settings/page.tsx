'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import { SiteSetting, GroupedSiteSettings, SiteSettingBulkUpdateRequest } from '@/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/Switch';
import {
  Save,
  Plus,
  Settings as SettingsIcon,
  Globe,
  Search,
  Mail,
  Share2,
  Briefcase,
  Flag,
  AlertCircle,
  FileImage,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SettingFormData {
  [key: string]: string | boolean;
}

const groupIcons: Record<string, any> = {
  general: Globe,
  seo: Search,
  contact: Mail,
  social: Share2,
  business: Briefcase,
  features: Flag,
  assets: FileImage,
};

// Dynamic function to format group names from API data
const formatGroupLabel = (groupName: string): string => {
  return groupName
    .toLowerCase()
    .split(/[_\-\s]+/) // Split on underscores, hyphens, and spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
    .join(' '); // Join with spaces
};

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<SettingFormData>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<SiteSetting | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch site settings using React Query
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery<GroupedSiteSettings>({
    queryKey: ['siteSettings'],
    queryFn: () => adminApi.getSiteSettings(),
  });

  // Bulk update mutation
  const updateMutation = useMutation({
    mutationFn: (data: SiteSettingBulkUpdateRequest) =>
      adminApi.bulkUpdateSiteSettings(data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      setHasChanges(false);
      toast.success('Settings updated successfully', {
        description: `${variables.settings.length} setting${variables.settings.length > 1 ? 's' : ''} updated`
      });
    },
    onError: (error: any) => {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings', {
        description: error?.response?.data?.message || 'Please try again'
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteSiteSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      setDeleteModalOpen(false);
      setSettingToDelete(null);
      toast.success('Setting deleted successfully', {
        description: 'The setting has been permanently removed'
      });
    },
    onError: (error: any) => {
      console.error('Failed to delete setting:', error);
      toast.error('Failed to delete setting', {
        description: error?.response?.data?.message || 'Please try again'
      });
      setDeleteModalOpen(false);
      setSettingToDelete(null);
    },
  });

  // Initialize form data when settings are loaded
  const initializeFormData = useCallback(() => {
    if (!settings) return;
    
    const newFormData: SettingFormData = {};
    Object.values(settings).flat().forEach((setting: SiteSetting) => {
      switch (setting.type) {
        case 'boolean':
          newFormData[setting.key] = setting.value === 'true';
          break;
        case 'integer':
          newFormData[setting.key] = setting.value || '0';
          break;
        default:
          newFormData[setting.key] = setting.value || '';
      }
    });
    
    setFormData(newFormData);
  }, [settings]);

  // Initialize form data when settings load or change
  useEffect(() => {
    if (settings) {
      // Check if we need to initialize or update form data
      const currentSettingKeys = Object.values(settings).flat().map((s: SiteSetting) => s.key);
      const formDataKeys = Object.keys(formData);
      
      // Re-initialize if:
      // 1. Form data is empty, OR
      // 2. There are new settings that aren't in form data, OR
      // 3. There are form data keys that don't exist in current settings
      const hasNewSettings = currentSettingKeys.some(key => !(key in formData));
      const hasRemovedSettings = formDataKeys.some(key => !currentSettingKeys.includes(key));
      
      if (formDataKeys.length === 0 || hasNewSettings || hasRemovedSettings) {
        initializeFormData();
      }
    }
  }, [settings, formData, initializeFormData]);

  // Automatically switch to the correct tab if current activeTab doesn't exist in availableGroups
  const availableGroups = settings ? Object.keys(settings).filter(group => settings[group].length > 0) : [];
  
  useEffect(() => {
    if (availableGroups.length > 0 && !availableGroups.includes(activeTab)) {
      setActiveTab(availableGroups[0]);
    }
  }, [availableGroups, activeTab]);

  const handleInputChange = (key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!settings) return;

    const changedSettings = Object.entries(formData)
      .filter(([key, value]) => {
        const originalSetting = Object.values(settings)
          .flat()
          .find((s: SiteSetting) => s.key === key);
        
        if (!originalSetting) return false;
        
        const originalValue = originalSetting.type === 'boolean' 
          ? originalSetting.value === 'true'
          : originalSetting.value || '';
        
        return originalValue !== value;
      })
      .map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? String(value) : String(value),
      }));

    if (changedSettings.length === 0) {
      console.log('No settings have been modified.');
      return;
    }

    updateMutation.mutate({ settings: changedSettings });
  };

  const handleDeleteClick = (setting: SiteSetting) => {
    setSettingToDelete(setting);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (settingToDelete) {
      deleteMutation.mutate(settingToDelete.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSettingToDelete(null);
  };

  const isImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
    return imageExtensions.test(url);
  };

  const renderSettingField = (setting: SiteSetting) => {
    const value = formData[setting.key];
    const stringValue = String(value);
    const hasImagePreview = setting.type === 'string' && isImageUrl(stringValue);

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Switch
                checked={Boolean(value)}
                onCheckedChange={(checked: boolean) => handleInputChange(setting.key, checked)}
              />
              <span className="text-sm font-medium text-white">
                {value ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(setting)}
              className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              title="Delete setting"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );

      case 'text':
        return (
          <div className="relative">
            <textarea
              value={String(value)}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(setting.key, e.target.value)}
              placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
              className="w-full px-3 py-2 pr-10 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 min-h-[60px] resize-y transition-colors duration-200"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(setting)}
              className="absolute top-1 right-1 h-7 w-7 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              title="Delete setting"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );

      case 'integer':
        return (
          <div className="relative">
            <input
              type="number"
              value={String(value)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(setting.key, e.target.value)}
              placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
              className="w-full px-3 py-2 pr-10 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 transition-colors duration-200"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(setting)}
              className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              title="Delete setting"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={String(value)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(setting.key, e.target.value)}
                placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
                className="w-full px-3 py-2 pr-10 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 transition-colors duration-200"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(setting)}
                className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                title="Delete setting"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            {hasImagePreview && stringValue && (
              <div className="flex items-center space-x-3 p-2 bg-slate-800/50 rounded-lg border border-slate-600/50">
                <div className="relative w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={stringValue}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.nextElementSibling?.classList.add('opacity-0');
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.classList.add('opacity-0');
                      target.nextElementSibling?.classList.remove('opacity-0');
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-700">
                    <FileImage className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300">Image Preview</p>
                  <p className="text-xs text-slate-500 truncate mt-1">{stringValue}</p>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  const renderSettingsGroup = (groupName: string, groupSettings: SiteSetting[]) => {
    const Icon = groupIcons[groupName] || SettingsIcon;

    return (
      <div className="space-y-8">

        <div className="grid gap-4">
          {groupSettings.map((setting) => (
            <Card key={setting.id} className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:bg-slate-900/90 transition-all duration-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2 mb-2">
                        <label className="text-sm font-semibold text-white">
                          {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        {setting.description && (
                          <span className="text-xs text-slate-400">
                            • {setting.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <span 
                        className={cn(
                          'inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium border',
                          setting.is_public 
                            ? 'bg-green-600/20 text-green-400 border-green-500/30' 
                            : 'bg-slate-600/20 text-slate-300 border-slate-500/30'
                        )}
                      >
                        {setting.is_public ? 'Public' : 'Private'}
                      </span>
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        {setting.type}
                      </span>
                    </div>
                  </div>
                  <div>
                    {renderSettingField(setting)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-white text-2xl">
                <SettingsIcon className="h-8 w-8" />
                <span>Loading Site Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-700/50 rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Site settings error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <Card className="border-red-500/50 bg-red-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-red-400 text-2xl">
                <AlertCircle className="h-8 w-8" />
                <span>Error Loading Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-200 text-lg">
                Failed to load site settings. Please try refreshing the page.
              </p>
              {error instanceof Error && (
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-red-300 font-mono text-sm">
                    Error: {error.message}
                  </p>
                </div>
              )}
              <div className="flex space-x-4">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-600 hover:bg-red-700"
                >
                  Refresh Page
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  const allTabs = [...availableGroups, 'assets']; // Add assets as a separate tab

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-white">Site Settings</h1>
            <p className="text-slate-300 mt-2 text-lg">Manage your website configuration and preferences</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/site-settings/add">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2 border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Add Setting</span>
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2"
            >
              <Save className="h-4 w-4" />
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </div>

        {hasChanges && (
          <Card className="border-yellow-500/50 bg-yellow-900/10 backdrop-blur-sm">
            <CardContent className="py-4 px-6">
              <div className="flex items-center space-x-3 text-yellow-400">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">You have unsaved changes</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Tabs */}
        <div className="space-y-8">
          <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <div 
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              onMouseDown={(e) => {
                const container = e.currentTarget as HTMLDivElement;
                const startX = e.pageX - container.offsetLeft;
                const scrollLeft = container.scrollLeft;
                
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const x = moveEvent.pageX - container.offsetLeft;
                  const walk = (x - startX) * 2;
                  container.scrollLeft = scrollLeft - walk;
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                  container.style.cursor = 'grab';
                };
                
                container.style.cursor = 'grabbing';
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              {allTabs.map((group) => {
                const Icon = groupIcons[group] || SettingsIcon;
                const isAssets = group === 'assets';
                
                if (isAssets) {
                  return (
                    <Link key={group} href="/dashboard/site-settings/assets">
                      <button
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-slate-300 hover:text-white hover:bg-slate-800 flex-shrink-0"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="whitespace-nowrap">
                          {formatGroupLabel(group)}
                        </span>
                      </button>
                    </Link>
                  );
                }
                
                return (
                  <button
                    key={group}
                    onClick={() => setActiveTab(group)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0",
                      activeTab === group
                        ? "bg-blue-600 shadow-lg text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="whitespace-nowrap">
                      {formatGroupLabel(group)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {availableGroups.map((group) => {
              if (activeTab === group) {
                return (
                  <div key={group} className="animate-in fade-in-50 duration-300">
                    {renderSettingsGroup(group, settings[group])}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && settingToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Delete Setting</h3>
                    <p className="text-sm text-slate-400">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-slate-300">
                    Are you sure you want to delete the setting &quot;
                    <span className="font-semibold text-white">
                      {settingToDelete.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    &quot;?
                  </p>
                  <div className="mt-3 p-3 bg-slate-900/50 rounded border border-slate-600">
                    <p className="text-sm text-slate-400">
                      <span className="font-medium">Current value:</span> {settingToDelete.value || '(empty)'}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleDeleteCancel}
                    disabled={deleteMutation.isPending}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    disabled={deleteMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete Setting'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}