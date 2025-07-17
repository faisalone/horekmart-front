'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  TrendingUp,
  TrendingDown,
  Package,
  Bell,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for demo purposes - replace with real API calls
const mockStats = {
  total_revenue: 125430.50,
  revenue_change: 12.5,
  total_orders: 1248,
  orders_change: 8.2,
  total_customers: 3580,
  customers_change: 15.3,
  total_vendors: 47,
  vendors_change: 5.1,
  pending_vendor_approvals: 5,
};

const mockSalesData = [
  { date: '2025-01-07', revenue: 4200, orders: 28 },
  { date: '2025-01-08', revenue: 3800, orders: 24 },
  { date: '2025-01-09', revenue: 5100, orders: 32 },
  { date: '2025-01-10', revenue: 4600, orders: 29 },
  { date: '2025-01-11', revenue: 5500, orders: 35 },
  { date: '2025-01-12', revenue: 6200, orders: 41 },
  { date: '2025-01-13', revenue: 5800, orders: 38 },
  { date: '2025-01-14', revenue: 6800, orders: 45 },
];

const mockTopProducts = [
  { name: 'Premium Headphones', sales: 245, revenue: 12250 },
  { name: 'Smart Watch', sales: 189, revenue: 18900 },
  { name: 'Wireless Earbuds', sales: 156, revenue: 7800 },
  { name: 'Gaming Mouse', sales: 134, revenue: 6700 },
  { name: 'USB-C Cable', sales: 98, revenue: 1960 },
];

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
}

function StatCard({ title, value, change, icon: Icon, prefix = '' }: StatCardProps) {
  const isPositive = change > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{prefix}{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
          )}
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  // In a real app, these would be actual API calls
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => Promise.resolve(mockStats),
    // queryFn: adminApi.getDashboardStats,
  });

  const { data: salesData } = useQuery({
    queryKey: ['sales-data'],
    queryFn: () => Promise.resolve(mockSalesData),
    // queryFn: () => adminApi.getSalesData('7d'),
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 flex items-center space-x-2">
            <Bell className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">
              {mockStats.pending_vendor_approvals} vendors pending approval
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats?.total_revenue.toLocaleString() || '0'}
          change={stats?.revenue_change || 0}
          icon={DollarSign}
          prefix="$"
        />
        <StatCard
          title="Total Orders"
          value={stats?.total_orders.toLocaleString() || '0'}
          change={stats?.orders_change || 0}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Customers"
          value={stats?.total_customers.toLocaleString() || '0'}
          change={stats?.customers_change || 0}
          icon={Users}
        />
        <StatCard
          title="Active Vendors"
          value={stats?.total_vendors.toString() || '0'}
          change={stats?.vendors_change || 0}
          icon={Store}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Daily revenue for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name) => [`$${value}`, name === 'revenue' ? 'Revenue' : 'Orders']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${product.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Orders Overview</CardTitle>
          <CardDescription>Daily orders for the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [value, 'Orders']}
              />
              <Bar dataKey="orders" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: '#12345', customer: 'John Doe', amount: 129.99, status: 'pending' },
                { id: '#12346', customer: 'Jane Smith', amount: 89.50, status: 'processing' },
                { id: '#12347', customer: 'Bob Johnson', amount: 199.99, status: 'shipped' },
                { id: '#12348', customer: 'Alice Brown', amount: 59.99, status: 'delivered' },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{order.id}</p>
                    <p className="text-xs text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${order.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Vendor Approvals</CardTitle>
            <CardDescription>Vendors waiting for approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Tech Solutions Inc.', submitted: '2 days ago', type: 'Electronics' },
                { name: 'Fashion Forward LLC', submitted: '3 days ago', type: 'Clothing' },
                { name: 'Home Essentials Co.', submitted: '1 week ago', type: 'Home & Garden' },
                { name: 'Sports Gear Pro', submitted: '1 week ago', type: 'Sports' },
                { name: 'Book Haven', submitted: '2 weeks ago', type: 'Books' },
              ].map((vendor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{vendor.name}</p>
                    <p className="text-xs text-gray-500">{vendor.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{vendor.submitted}</p>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
