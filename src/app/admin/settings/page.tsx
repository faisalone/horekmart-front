'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { adminApi } from '@/lib/admin-api';
import { GeneralSettings } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Save,
  Upload,
  Globe,
  Mail,
  Settings as SettingsIcon,
  CreditCard,
  Shield,
  Bell,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demo purposes
const mockSettings: GeneralSettings = {
  site_name: 'Horekmart Marketplace',
  site_description: 'Your trusted multi-vendor eCommerce platform',
  site_logo: '/logo.png',
  site_favicon: '/favicon.ico',
  admin_email: 'admin@horekmart.com',
  default_currency: 'USD',
  default_timezone: 'America/New_York',
  maintenance_mode: false,
};

interface SettingsTabProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function SettingsTabs({ activeTab, onTabChange }: SettingsTabProps) {
  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Database },
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

interface GeneralSettingsProps {
  settings: GeneralSettings;
  onUpdate: (settings: Partial<GeneralSettings>) => void;
  isLoading: boolean;
}

function GeneralSettingsTab({ settings, onUpdate, isLoading }: GeneralSettingsProps) {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
          <CardDescription>Basic information about your marketplace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <Input
                id="site_name"
                name="site_name"
                value={formData.site_name}
                onChange={handleInputChange}
                placeholder="Your marketplace name"
              />
            </div>
            <div>
              <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <Input
                id="admin_email"
                name="admin_email"
                type="email"
                value={formData.admin_email}
                onChange={handleInputChange}
                placeholder="admin@yoursite.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="site_description" className="block text-sm font-medium text-gray-700 mb-1">
              Site Description
            </label>
            <textarea
              id="site_description"
              name="site_description"
              rows={3}
              value={formData.site_description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your marketplace..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="default_currency" className="block text-sm font-medium text-gray-700 mb-1">
                Default Currency
              </label>
              <select
                id="default_currency"
                name="default_currency"
                value={formData.default_currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>
            <div>
              <label htmlFor="default_timezone" className="block text-sm font-medium text-gray-700 mb-1">
                Default Timezone
              </label>
              <select
                id="default_timezone"
                name="default_timezone"
                value={formData.default_timezone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Site Assets</CardTitle>
          <CardDescription>Upload your site logo and favicon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {formData.site_logo ? (
                    <Image 
                      src={formData.site_logo} 
                      alt="Logo" 
                      width={128}
                      height={128}
                      className="w-full h-full object-cover rounded-lg" 
                    />
                  ) : (
                    <Globe className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Favicon
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  {formData.site_favicon ? (
                    <Image 
                      src={formData.site_favicon} 
                      alt="Favicon" 
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded" 
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Favicon
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
          <CardDescription>Put your site in maintenance mode for updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="maintenance_mode"
              name="maintenance_mode"
              checked={formData.maintenance_mode}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="maintenance_mode" className="text-sm font-medium text-gray-900">
                Enable Maintenance Mode
              </label>
              <p className="text-sm text-gray-500">
                When enabled, your site will show a maintenance page to visitors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <Button type="submit" loading={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </form>
  );
}

function EmailSettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>Configure email settings for transactional emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
              <Input placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
              <Input placeholder="587" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <Input placeholder="your-email@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input type="password" placeholder="Your app password" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Encryption</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="none">None</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Email Settings
        </Button>
      </div>
    </div>
  );
}

function PaymentSettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>Configure payment methods for your marketplace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">Stripe</h4>
                <p className="text-sm text-gray-500">Accept credit card payments</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key</label>
                <Input placeholder="pk_test_..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                <Input type="password" placeholder="sk_test_..." />
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">PayPal</h4>
                <p className="text-sm text-gray-500">Accept PayPal payments</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <Input placeholder="PayPal Client ID" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                <Input type="password" placeholder="PayPal Client Secret" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Payment Settings
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const queryClient = useQueryClient();

  // In a real app, this would be an actual API call
  const { data: settings, isLoading } = useQuery({
    queryKey: ['general-settings'],
    queryFn: () => Promise.resolve(mockSettings),
    // queryFn: adminApi.getGeneralSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<GeneralSettings>) => adminApi.updateGeneralSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-settings'] });
    },
  });

  const handleUpdateSettings = (newSettings: Partial<GeneralSettings>) => {
    updateSettingsMutation.mutate(newSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your marketplace configuration</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Settings Content */}
      <div className="mt-6">
        {activeTab === 'general' && settings && (
          <GeneralSettingsTab
            settings={settings}
            onUpdate={handleUpdateSettings}
            isLoading={updateSettingsMutation.isPending}
          />
        )}
        {activeTab === 'email' && <EmailSettingsTab />}
        {activeTab === 'payment' && <PaymentSettingsTab />}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Security settings coming soon...</p>
            </CardContent>
          </Card>
        )}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email and push notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Notification settings coming soon...</p>
            </CardContent>
          </Card>
        )}
        {activeTab === 'system' && (
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>System configuration and maintenance options</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">System settings coming soon...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
