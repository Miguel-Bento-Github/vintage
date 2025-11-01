'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Order, OrderStatus } from '@/types';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';

type StatusFilter = OrderStatus | 'all';

export default function OrderManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // TanStack Query hooks
  const { data: orders = [], isLoading, error: queryError, refetch } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  // Local UI state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [carrier, setCarrier] = useState<string>('USPS');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Update URL when modal opens/closes
  useEffect(() => {
    if (selectedOrder) {
      router.push(`/admin/orders?orderId=${selectedOrder.id}`, { scroll: false });
    } else {
      const orderId = searchParams.get('orderId');
      if (orderId) {
        router.push('/admin/orders', { scroll: false });
      }
    }
  }, [selectedOrder, router, searchParams]);

  // Open modal from URL on mount
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0 && !selectedOrder) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [searchParams, orders, selectedOrder]);

  // Error state from query or mutation
  const error = queryError
    ? String(queryError)
    : updateStatusMutation.error
    ? String(updateStatusMutation.error)
    : null;

  // Filter and sort orders with useMemo for performance
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerInfo.email.toLowerCase().includes(term) ||
        order.customerInfo.name.toLowerCase().includes(term)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      // Handle ISO strings, Date objects, Timestamp objects, and plain timestamp objects
      const getTime = (timestamp: string | Date | { toDate: () => Date } | { seconds: number; nanoseconds?: number } | null | undefined): number => {
        if (!timestamp) return 0;
        if (typeof timestamp === 'string') return new Date(timestamp).getTime();
        if (timestamp instanceof Date) return timestamp.getTime();
        // Handle plain timestamp objects with seconds/nanoseconds
        if (typeof timestamp === 'object' && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
          const nanoseconds = timestamp.nanoseconds || 0;
          return timestamp.seconds * 1000 + nanoseconds / 1000000;
        }
        // Handle Timestamp instances with toDate method
        if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') return timestamp.toDate().getTime();
        return 0;
      };

      const dateA = getTime(a.createdAt);
      const dateB = getTime(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [orders, statusFilter, searchTerm, sortOrder]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);

    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: newStatus,
        trackingNumber: newStatus === 'shipped' ? trackingNumber : undefined,
        carrier: newStatus === 'shipped' ? carrier : undefined,
      });

      // Clear tracking fields after successful update
      setTrackingNumber('');
      setCarrier('USPS');
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const formatDate = (timestamp: string | Date | { toDate: () => Date } | { seconds: number; nanoseconds?: number } | null | undefined): string => {
    let date: Date;

    if (!timestamp) return 'N/A';
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'object' && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
      // Handle plain timestamp objects with seconds/nanoseconds
      const nanoseconds = timestamp.nanoseconds || 0;
      date = new Date(timestamp.seconds * 1000 + nanoseconds / 1000000);
    } else if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      return 'N/A';
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="p-8">
        <ErrorState
          title="Unable to load orders"
          message={error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">View and manage all customer orders</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Order number, email, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                        disabled={updatingOrderId === order.id}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-amber-700 hover:text-amber-800 font-medium"
                      >
                        {order.orderNumber}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerInfo.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerInfo.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      €{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Order Details - {selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Name:</span>{' '}
                    <span className="text-gray-900">{selectedOrder.customerInfo.name}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Email:</span>{' '}
                    <span className="text-gray-900">{selectedOrder.customerInfo.email}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Shipping Address:</span>{' '}
                    <span className="text-gray-900">
                      {selectedOrder.customerInfo.shippingAddress.street},{' '}
                      {selectedOrder.customerInfo.shippingAddress.city},{' '}
                      {selectedOrder.customerInfo.shippingAddress.state}{' '}
                      {selectedOrder.customerInfo.shippingAddress.postalCode},{' '}
                      {selectedOrder.customerInfo.shippingAddress.country}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-4 flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 relative">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover rounded"
                            sizes="64px"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.brand} - {item.title}
                        </p>
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                        <p className="text-sm text-gray-600">{item.era}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">€{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="text-gray-900">€{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Shipping:</span>
                    <span className="text-gray-900">
                      {selectedOrder.shipping === 0 ? 'FREE' : `€${selectedOrder.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Tax/VAT:</span>
                    <span className="text-gray-900">€{selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">€{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Status and Tracking */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Status</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Current Status:</span>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  {selectedOrder.trackingNumber && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Tracking Number:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedOrder.trackingNumber}</span>
                    </div>
                  )}

                  {/* Update Status Form */}
                  <div className="border-t border-gray-200 pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Status
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={orders.find(o => o.id === selectedOrder.id)?.status || selectedOrder.status}
                        onChange={(e) => {
                          handleStatusUpdate(selectedOrder.id, e.target.value as OrderStatus);
                        }}
                        disabled={updatingOrderId === selectedOrder.id}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {selectedOrder.status === 'shipped' && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Carrier
                          </label>
                          <select
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="USPS">USPS</option>
                            <option value="UPS">UPS</option>
                            <option value="FedEx">FedEx</option>
                            <option value="DHL">DHL</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tracking Number
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              placeholder="Enter tracking number"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                              disabled={!trackingNumber || updatingOrderId === selectedOrder.id}
                              className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Payment Intent ID:</span>{' '}
                    <span className="text-gray-900 font-mono text-xs">{selectedOrder.paymentIntentId}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Order Date:</span>{' '}
                    <span className="text-gray-900">{formatDate(selectedOrder.createdAt)}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Last Updated:</span>{' '}
                    <span className="text-gray-900">{formatDate(selectedOrder.updatedAt)}</span>
                  </p>
                </div>
              </div>

              {/* Email History */}
              {selectedOrder.emailHistory && selectedOrder.emailHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Email History</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {selectedOrder.emailHistory.map((email, index) => (
                      <div key={index} className="border-b border-gray-200 last:border-b-0 pb-3 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {email.type === 'order_confirmation' && '📧 Order Confirmation'}
                              {email.type === 'shipping_notification' && '📦 Shipping Notification'}
                              {!email.type.includes('order_confirmation') && !email.type.includes('shipping_notification') && `📨 ${email.type}`}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              To: {email.sentTo}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(email.sentAt)}
                            </p>
                            {email.emailId && (
                              <p className="text-xs text-gray-400 mt-1 font-mono">
                                ID: {email.emailId}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            email.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {email.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                          </span>
                        </div>
                        {email.error && (
                          <p className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
                            Error: {email.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
