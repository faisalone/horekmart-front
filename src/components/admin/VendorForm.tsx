'use client';

import { useState, useEffect } from 'react';
import { Vendor } from '@/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/Switch';
import { CustomSelect } from '@/components/ui/select-custom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormHeader from '@/components/admin/FormHeader';

interface VendorFormProps {
  vendor?: Vendor;
  onSubmit: (vendor: Partial<Vendor>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
  validationErrors?: Record<string, string[]>;
}

interface VendorFormData {
  name: string;
  email: string;
  business_name: string;
  business_registration_number: string;
  description: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  commission_rate: string; // Changed to string to match Vendor type
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_active: boolean;
}

export default function VendorForm({ 
  vendor, 
  onSubmit, 
  onCancel, 
  isLoading, 
  mode, 
  validationErrors 
}: VendorFormProps) {
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    email: '',
    business_name: '',
    business_registration_number: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    commission_rate: '0',
    status: 'pending',
    is_active: true,
  });

  // Helper function to display field errors
  const getFieldError = (fieldName: string) => {
    if (validationErrors && validationErrors[fieldName]) {
      return validationErrors[fieldName][0]; // Show first error
    }
    return null;
  };

  useEffect(() => {
    if (vendor && mode === 'edit') {
      setFormData({
        name: vendor.name || '',
        email: vendor.email || '',
        business_name: vendor.business_name || '',
        business_registration_number: vendor.business_registration_number || '',
        description: vendor.description || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        country: vendor.country || '',
        postal_code: vendor.postal_code || '',
        commission_rate: vendor.commission_rate || '0',
        status: vendor.status || 'pending',
        is_active: vendor.is_active ?? true,
      });
    }
  }, [vendor, mode]);

  const handleInputChange = (field: keyof VendorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'suspended', label: 'Suspended' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <FormHeader
        title={mode === 'create' ? 'Create New Vendor' : 'Edit Vendor'}
        subtitle={mode === 'create' 
          ? 'Add a new vendor to your platform' 
          : `Editing: ${formData.business_name || 'Vendor'}`
        }
        onCancel={onCancel}
        isLoading={isLoading}
        mode={mode}
        formId="vendor-form"
        entityName="Vendor"
      />

      <div className="px-6 pb-6">
        <form id="vendor-form" onSubmit={handleSubmit} className="xl:grid xl:grid-cols-3 xl:gap-6 space-y-6 xl:space-y-0">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-gray-800 border-gray-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter the personal details for the vendor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                    {getFieldError('name') && (
                      <p className="text-red-400 text-sm mt-1">{getFieldError('name')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                    {getFieldError('email') && (
                      <p className="text-red-400 text-sm mt-1">{getFieldError('email')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Business Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure business details and registration information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Name *
                    </label>
                    <Input
                      value={formData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="Enter business name"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                    {getFieldError('business_name') && (
                      <p className="text-red-400 text-sm mt-1">{getFieldError('business_name')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Registration Number
                    </label>
                    <Input
                      value={formData.business_registration_number}
                      onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                      placeholder="Enter registration number"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your business"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Address Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Business location and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address Line 1
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter street address"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City
                    </label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State/Province
                    </label>
                    <Input
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state or province"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Postal Code
                    </label>
                    <Input
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      placeholder="Enter postal code"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country
                    </label>
                    <Input
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Enter country"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="xl:col-span-1 space-y-6">
            <div className="xl:sticky xl:top-[120px] space-y-6 z-10">
              {/* Settings */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure vendor status and commission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {statusOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            className="text-gray-200 focus:bg-gray-700"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Commission Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.commission_rate}
                      onChange={(e) => handleInputChange('commission_rate', e.target.value)}
                      placeholder="Enter commission rate"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">
                        Active Status
                      </label>
                      <p className="text-xs text-gray-400">
                        Enable or disable this vendor account
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
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
