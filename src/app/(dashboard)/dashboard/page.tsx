'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/Badge';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  TrendingUp,
  TrendingDown,
  Package,
  Bell,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  ArrowUpRight,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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
    <Card className="group relative overflow-hidden border-gray-700 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-gray-700/50 group-hover:bg-blue-500/20 transition-colors">
          <Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold text-white mb-2">
          {prefix}{value}
        </div>
        <div className="flex items-center text-xs">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1 text-emerald-400" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1 text-red-400" />
          )}
          <span className={`font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="ml-1 text-gray-400">from last month</span>
        </div>
      </CardContent>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
}

export default function AdminDashboard() {
  // Real API calls - replace mock data with live backend data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminApi.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-data'],
    queryFn: () => adminApi.getSalesData('7d'),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => adminApi.getRecentOrders(4),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000,
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => adminApi.getTopProducts('30d', 5),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000,
  });

  const { data: pendingVendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['pending-vendors'],
    queryFn: () => adminApi.getPendingVendors(5),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });



  // Use real API data when available, show loading state when loading
  const displayStats = stats || { total_revenue: 0, revenue_change: 0, total_orders: 0, orders_change: 0, total_customers: 0, customers_change: 0, total_vendors: 0, vendors_change: 0, pending_vendor_approvals: 0 };
  const displaySalesData = salesData || [];
  const displayTopProducts = topProducts || [];
  const displayRecentOrders = recentOrders || [];
  const displayPendingVendors = pendingVendors || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
              Welcome back! Here&apos;s what&apos;s happening with your store today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {!statsLoading && displayStats.pending_vendor_approvals > 0 && (
              <Link href="/dashboard/vendors" className="block">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-2 backdrop-blur-sm hover:bg-amber-500/20 transition-colors cursor-pointer">
                  <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-sm text-amber-300 font-medium">
                    {displayStats.pending_vendor_approvals} vendors pending approval
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-amber-400" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Revenue"
            value={statsLoading ? '...' : formatCurrency(displayStats.total_revenue)}
            change={displayStats.revenue_change}
            icon={DollarSign}
          />
          <StatCard
            title="Total Orders"
            value={statsLoading ? '...' : displayStats.total_orders.toLocaleString()}
            change={displayStats.orders_change}
            icon={ShoppingCart}
          />
          <StatCard
            title="Total Customers"
            value={statsLoading ? '...' : displayStats.total_customers.toLocaleString()}
            change={displayStats.customers_change}
            icon={Users}
          />
          <StatCard
            title="Active Vendors"
            value={statsLoading ? '...' : displayStats.total_vendors.toString()}
            change={displayStats.vendors_change}
            icon={Store}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Revenue Chart */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Revenue Overview</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    Daily revenue trends for the last 7 days
                  </CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              {salesLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={displaySalesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`} 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                    labelStyle={{ color: '#D1D5DB' }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [
                      `$${value?.toLocaleString()}`, 
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#1E40AF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Top Products</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    Best performing products this month
                  </CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Package className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              {productsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
              ) : (
              <div className="space-y-4">
                {displayTopProducts.map((product, index) => (
                  <div key={product.name} className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' :
                          index === 1 ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30' :
                          'bg-gray-700/50 border border-gray-600/50'
                        }`}>
                          <Package className={`w-4 h-4 ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-blue-400' :
                            'text-gray-400'
                          }`} />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-300">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white group-hover:text-blue-300 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {product.sales} sales
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-white">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className="text-xs text-gray-400">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Orders Chart */}
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">Orders Overview</CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  Daily orders volume for the last 7 days
                </CardDescription>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {salesLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={displaySalesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  labelStyle={{ color: '#D1D5DB' }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [value, 'Orders']}
                />
                <Bar 
                  dataKey="orders" 
                  fill="url(#orderGradient)"
                  radius={[4, 4, 0, 0]}
                  minPointSize={0}
                />
                <defs>
                  <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Recent Orders */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Recent Orders</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    Latest orders that need attention
                  </CardDescription>
                </div>
                <Link href="/dashboard/orders">
                  <Button variant="outline" size="sm" className="border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              {ordersLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              ) : (
              <div className="space-y-3">
                {displayRecentOrders.map((order, idx) => (
                  <div key={order.id || idx} className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/30 transition-all duration-200 border border-transparent hover:border-gray-600/50">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        order.status === 'pending' ? 'bg-amber-500/20' :
                        order.status === 'processing' ? 'bg-blue-500/20' :
                        order.status === 'shipped' ? 'bg-purple-500/20' :
                        'bg-emerald-500/20'
                      }`}>
                        {order.status === 'pending' ? (
                          <Clock className="w-4 h-4 text-amber-400" />
                        ) : order.status === 'processing' ? (
                          <Package className="w-4 h-4 text-blue-400" />
                        ) : order.status === 'shipped' ? (
                          <Truck className="w-4 h-4 text-purple-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white group-hover:text-blue-300 transition-colors">
                          {order.id}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{order.customer}</span>
                          <span>•</span>
                          <span>{order.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-semibold text-sm text-white">{formatCurrency(parseFloat(order.amount))}</p>
                        <Badge className={`text-xs ${
                          order.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          order.status === 'processing' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          order.status === 'shipped' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {order.status}
                        </Badge>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Vendor Approvals */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Vendor Approvals</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    Vendors waiting for approval
                  </CardDescription>
                </div>
                <Link href="/dashboard/vendors">
                  <Button variant="outline" size="sm" className="border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              {vendorsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                </div>
              ) : (
              <div className="space-y-3">
                {displayPendingVendors.map((vendor, index) => (
                  <div key={index} className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/30 transition-all duration-200 border border-transparent hover:border-gray-600/50">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-600 flex items-center justify-center">
                          <Store className="w-4 h-4 text-gray-300" />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                          vendor.urgency === 'high' ? 'bg-red-400' :
                          vendor.urgency === 'medium' ? 'bg-amber-400' :
                          'bg-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white group-hover:text-blue-300 transition-colors truncate">
                          {vendor.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{vendor.type}</span>
                          <span>•</span>
                          <span>{vendor.submitted}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pending
                      </Badge>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
