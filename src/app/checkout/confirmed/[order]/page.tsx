'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, Package, Truck, Phone, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { apiClient } from '@/lib/apiClient';
import Image from 'next/image';

interface OrderItemDTO {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  price: number;
  quantity: number;
  total: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    thumb?: string;
    images?: string[];
  };
}

interface OrderDTO {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  created_at: string;
  customer?: { id: number; name: string; phone: string };
  shipping?: { address: string; city_id: number | null; zone_id: number | null; shipping_amount: number; status: string; consignment_id?: string | null };
  items: OrderItemDTO[];
}

export default function OrderConfirmedPage() {
  const params = useParams();
  const orderParam = params?.order as string; // id or order_number
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiClient.get(`/v1/orders/${orderParam}`);
        setOrder(res.data?.data || res.data);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    if (orderParam) fetchOrder();
  }, [orderParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Order not found'}</p>
          <Link href="/products" className="text-blue-600 underline mt-4 inline-block">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Thank you! Your order is confirmed.</h1>
          </div>
          <p className="text-gray-600">Order <span className="font-mono font-semibold">{order.order_number}</span> • Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Order details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              </div>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 items-center">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image fill src={item.product?.thumb || '/placeholder-product.svg'} alt={item.product_name} className="object-cover rounded" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">SKU: {item.product_sku}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping details */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Shipping</h2>
              </div>
              {order.shipping ? (
                <div className="space-y-2">
                  <p className="text-gray-800 flex items-center gap-2"><MapPin className="w-4 h-4" /> {order.shipping.address}</p>
                  <p className="text-gray-600">Shipping Charge: <span className="font-medium">{formatCurrency(order.shipping.shipping_amount)}</span></p>
                  <p className="text-gray-600">Status: <span className="font-medium capitalize">{order.shipping.status}</span></p>
                  {order.shipping.consignment_id && (
                    <p className="text-gray-600">Consignment: <span className="font-mono">{order.shipping.consignment_id}</span></p>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Shipping details will be available soon.</p>
              )}
            </div>

            {/* Customer */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
              </div>
              {order.customer ? (
                <div className="space-y-1">
                  <p className="text-gray-800">{order.customer.name}</p>
                  <p className="text-gray-600">{order.customer.phone}</p>
                </div>
              ) : (
                <p className="text-gray-600">Guest</p>
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-700">- {formatCurrency(order.discount_amount)}</span>
                </div>
                {order.shipping && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{formatCurrency(order.shipping.shipping_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-3 mt-3 text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Guidance and action buttons removed as requested */}
          </div>
        </div>
      </div>
    </div>
  );
}
