'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage customer accounts and information</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View and manage customer accounts, orders, and activity</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Management Coming Soon</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We&apos;re working on a comprehensive customer management system that will allow you to view customer profiles, 
              order history, communication logs, and manage customer accounts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
