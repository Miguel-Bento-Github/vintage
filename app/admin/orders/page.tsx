'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types';
import { getAllOrders, updateOrderStatus } from '@/services/orderService';

type StatusFilter = OrderStatus | 'all';

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch all orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter and sort orders when filters change
  useEffect(() => {
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
      const dateA = a.createdAt.toDate().getTime();
      const dateB = b.createdAt.toDate().getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm, sortOrder]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllOrders();
      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        setError(result.error || 'Failed to load orders');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const result = await updateOrderStatus(
        orderId,
        newStatus,
        newStatus === 'shipped' ? trackingNumber : undefined
      );

      if (result.success && result.data) {
        // Update local state
        setOrders(prev =>
          prev.map(order => (order.id === orderId ? result.data! : order))
        );
        setTrackingNumber('');
        setError(null);
      } else {
        setError(result.error || 'Failed to update order status');
      }
    } catch (err) {
      setError('An unexpected error occurred');
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

  const formatDate = (timestamp: any): string => {
    return timestamp.toDate().toLocaleDateString('en-US', {
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
        </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                      <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover rounded"
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
                        value={selectedOrder.status}
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
                      <div className="mt-3">
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
