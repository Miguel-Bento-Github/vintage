'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllOrders,
  getOrder,
  getOrdersByCustomer,
  createOrder,
  updateOrderStatus,
  updateOrder,
  cancelOrder,
  getOrderByOrderNumber,
  getOrdersCountByStatus,
  getRecentOrders,
  getTotalRevenue,
} from '@/services/orderService';
import {
  Order,
  CreateOrderData,
  OrderStatus,
} from '@/types';

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (statusFilter?: OrderStatus) => [...orderKeys.lists(), { statusFilter }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  byCustomer: (email: string) => [...orderKeys.all, 'customer', email] as const,
  byOrderNumber: (orderNumber: string) => [...orderKeys.all, 'orderNumber', orderNumber] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
  statusCounts: () => [...orderKeys.stats(), 'counts'] as const,
  revenue: (startDate?: Date, endDate?: Date) =>
    [...orderKeys.stats(), 'revenue', { startDate, endDate }] as const,
  recent: (limit?: number) => [...orderKeys.all, 'recent', limit] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch all orders with optional status filtering (admin)
 * Configures: 30s polling for pending orders for real-time updates
 */
export function useOrders(statusFilter?: OrderStatus) {
  return useQuery({
    queryKey: orderKeys.list(statusFilter),
    queryFn: async () => {
      const result = await getAllOrders(statusFilter);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    // Poll every 30 seconds if viewing pending orders for real-time updates
    refetchInterval: statusFilter === 'pending' ? 30000 : false,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fetch a single order by ID
 * Configures: 10min staleTime
 * Only enabled when orderId is provided
 */
export function useOrder(orderId?: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId || ''),
    queryFn: async () => {
      if (!orderId) return null;

      const result = await getOrder(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Fetch all orders for a specific customer
 * Only enabled when email is provided
 */
export function useCustomerOrders(email?: string) {
  return useQuery({
    queryKey: orderKeys.byCustomer(email || ''),
    queryFn: async () => {
      if (!email) return [];

      const result = await getOrdersByCustomer(email);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!email,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fetch order by order number
 * Useful for order tracking pages
 */
export function useOrderByOrderNumber(orderNumber?: string) {
  return useQuery({
    queryKey: orderKeys.byOrderNumber(orderNumber || ''),
    queryFn: async () => {
      if (!orderNumber) return null;

      const result = await getOrderByOrderNumber(orderNumber);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!orderNumber,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fetch recent orders for admin dashboard
 */
export function useRecentOrders(limit: number = 10) {
  return useQuery({
    queryKey: orderKeys.recent(limit),
    queryFn: async () => {
      const result = await getRecentOrders(limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    // Poll every 30 seconds for real-time admin dashboard
    refetchInterval: 30000,
  });
}

/**
 * Fetch order counts by status (admin dashboard)
 */
export function useOrdersCountByStatus() {
  return useQuery({
    queryKey: orderKeys.statusCounts(),
    queryFn: async () => {
      const result = await getOrdersCountByStatus();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    // Poll every 30 seconds for real-time dashboard stats
    refetchInterval: 30000,
  });
}

/**
 * Fetch total revenue (admin dashboard)
 */
export function useTotalRevenue(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: orderKeys.revenue(startDate, endDate),
    queryFn: async () => {
      const result = await getTotalRevenue(startDate, endDate);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new order
 * Invalidates orders and products queries on success
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const result = await createOrder(orderData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (newOrder) => {
      // Invalidate all order lists to show new order
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      queryClient.invalidateQueries({ queryKey: orderKeys.recent() });

      // Invalidate customer orders if applicable
      if (newOrder.customerInfo.email) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.byCustomer(newOrder.customerInfo.email)
        });
      }

      // Set the query data for the new order
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);

      // Invalidate products list (products were marked as sold)
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    },
  });
}

/**
 * Update order status (admin)
 * Uses optimistic updates for better UX
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      trackingNumber,
      carrier,
    }: {
      orderId: string;
      status: OrderStatus;
      trackingNumber?: string;
      carrier?: string;
    }) => {
      const result = await updateOrderStatus(orderId, status, trackingNumber, carrier);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    // Optimistic update
    onMutate: async ({ orderId, status, trackingNumber }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(orderId) });

      // Snapshot previous value
      const previousOrder = queryClient.getQueryData<Order>(
        orderKeys.detail(orderId)
      );

      // Optimistically update to the new value
      if (previousOrder) {
        const optimisticOrder: Order = {
          ...previousOrder,
          status,
          ...(trackingNumber && { trackingNumber }),
          updatedAt: { toDate: () => new Date() } as any, // Mock timestamp
        };

        queryClient.setQueryData<Order>(
          orderKeys.detail(orderId),
          optimisticOrder
        );
      }

      // Return context with the snapshotted value
      return { previousOrder };
    },
    // On error, rollback to previous value
    onError: (error, { orderId }, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(
          orderKeys.detail(orderId),
          context.previousOrder
        );
      }
      console.error('Failed to update order status:', error);
    },
    // Always refetch after error or success
    onSettled: (data, error, { orderId, status }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      queryClient.invalidateQueries({ queryKey: orderKeys.recent() });

      // If order was cancelled, invalidate products (they become available again)
      if (status === 'cancelled') {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    },
  });
}

/**
 * Update order (admin)
 * For updating any order fields
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      updates,
    }: {
      orderId: string;
      updates: Partial<Omit<Order, 'id' | 'createdAt'>>;
    }) => {
      const result = await updateOrder(orderId, updates);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (updatedOrder) => {
      // Update the cache with new order data
      queryClient.setQueryData(
        orderKeys.detail(updatedOrder.id),
        updatedOrder
      );

      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
    onError: (error) => {
      console.error('Failed to update order:', error);
    },
  });
}

/**
 * Cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const result = await cancelOrder(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (cancelledOrder) => {
      // Update the cache with cancelled order
      queryClient.setQueryData(
        orderKeys.detail(cancelledOrder.id),
        cancelledOrder
      );

      // Invalidate lists to update status
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
    onError: (error) => {
      console.error('Failed to cancel order:', error);
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Get loading states for multiple orders
 * Useful for batch operations
 */
export function useOrdersLoadingState(orderIds: string[]) {
  const queries = orderIds.map(id => useOrder(id));

  return {
    isLoading: queries.some(q => q.isLoading),
    isError: queries.some(q => q.isError),
    orders: queries.map(q => q.data).filter(Boolean) as Order[],
  };
}

/**
 * Prefetch an order (for hover effects, etc.)
 */
export function usePrefetchOrder() {
  const queryClient = useQueryClient();

  return (orderId: string) => {
    queryClient.prefetchQuery({
      queryKey: orderKeys.detail(orderId),
      queryFn: async () => {
        const result = await getOrder(orderId);
        if (!result.success) {
          throw new Error(result.error);
        }
        return result.data;
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };
}

/**
 * Combined dashboard stats hook
 * Fetches all dashboard data in one hook
 */
export function useDashboardStats() {
  const { data: statusCounts, isLoading: isLoadingCounts } = useOrdersCountByStatus();
  const { data: revenue, isLoading: isLoadingRevenue } = useTotalRevenue();
  const { data: recentOrders, isLoading: isLoadingRecent } = useRecentOrders(10);

  return {
    statusCounts,
    revenue,
    recentOrders,
    isLoading: isLoadingCounts || isLoadingRevenue || isLoadingRecent,
  };
}

// ============================================================================
// EXPORT TYPES FOR CONVENIENCE
// ============================================================================

export type UseOrdersResult = ReturnType<typeof useOrders>;
export type UseOrderResult = ReturnType<typeof useOrder>;
export type UseCustomerOrdersResult = ReturnType<typeof useCustomerOrders>;
export type UseCreateOrderResult = ReturnType<typeof useCreateOrder>;
export type UseUpdateOrderStatusResult = ReturnType<typeof useUpdateOrderStatus>;
export type UseCancelOrderResult = ReturnType<typeof useCancelOrder>;
export type UseDashboardStatsResult = ReturnType<typeof useDashboardStats>;
