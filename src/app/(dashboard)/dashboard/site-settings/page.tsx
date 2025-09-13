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
} from 'lucide-react';
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

const groupLabels: Record<string, string> = {
  general: 'General',
  seo: 'SEO Settings',
  contact: 'Contact Information',
  social: 'Social Media',
  business: 'Business Settings',
  features: 'Feature Flags',
  assets: 'Asset Management',
};

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<SettingFormData>({});
  const [hasChanges, setHasChanges] = useState(false);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      setHasChanges(false);
      console.log('Settings updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update settings:', error);
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

  // Initialize form data when settings load
  useEffect(() => {
    if (settings && Object.keys(formData).length === 0) {
      initializeFormData();
    }
  }, [settings, formData, initializeFormData]);

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

  const renderSettingField = (setting: SiteSetting) => {
    const value = formData[setting.key];

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(checked: boolean) => handleInputChange(setting.key, checked)}
            />
            <span className="text-sm font-medium text-white">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );

      case 'text':
        return (
          <textarea
            value={String(value)}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(setting.key, e.target.value)}
            placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
            className="w-full px-4 py-3 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 min-h-[80px] resize-y transition-colors duration-200"
          />
        );

      case 'integer':
        return (
          <input
            type="number"
            value={String(value)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(setting.key, e.target.value)}
            placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
            className="w-full px-4 py-3 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 transition-colors duration-200"
          />
        );

      default:
        return (
          <input
            type="text"
            value={String(value)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(setting.key, e.target.value)}
            placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
            className="w-full px-4 py-3 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 transition-colors duration-200"
          />
        );
    }
  };

  const renderSettingsGroup = (groupName: string, groupSettings: SiteSetting[]) => {
    const Icon = groupIcons[groupName] || SettingsIcon;

    return (
      <div className="space-y-8">

        <div className="grid gap-6">
          {groupSettings.map((setting) => (
            <Card key={setting.id} className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:bg-slate-900/90 transition-all duration-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <label className="block text-base font-semibold text-white mb-2">
                        {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      {setting.description && (
                        <p className="text-sm text-slate-300 mb-4">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <span 
                        className={cn(
                          'inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border',
                          setting.is_public 
                            ? 'bg-green-600/20 text-green-400 border-green-500/30' 
                            : 'bg-slate-600/20 text-slate-300 border-slate-500/30'
                        )}
                      >
                        {setting.is_public ? 'Public' : 'Private'}
                      </span>
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        {setting.type}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
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

  const availableGroups = Object.keys(settings).filter(group => settings[group].length > 0);
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
            <div className="flex flex-wrap gap-2">
              {allTabs.map((group) => {
                const Icon = groupIcons[group] || SettingsIcon;
                const isAssets = group === 'assets';
                
                if (isAssets) {
                  return (
                    <Link key={group} href="/dashboard/site-settings/assets">
                      <button
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="whitespace-nowrap">
                          {groupLabels[group] || group}
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
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      activeTab === group
                        ? "bg-blue-600 shadow-lg text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="whitespace-nowrap">
                      {groupLabels[group] || group}
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
      </div>
    </div>
  );
}