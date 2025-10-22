import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Order,
  CreateOrderData,
  OrderStatus,
  OrderItem,
  UpdateOrderStatusData,
} from '@/types';
import {
  FirebaseServiceResponse,
} from '@/types/firebase';
import { markProductSold } from './productService';
import { calculateTax } from '@/lib/taxCalculation';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique order number
 * Format: VTG-YYYYMMDD-XXX
 * Example: VTG-20250118-001
 */
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');

  return `VTG-${year}${month}${day}-${random}`;
}

/**
 * Calculate order totals for second-hand vintage goods
 * @param items - Array of order items
 * @param shippingRate - Shipping cost (default: $10)
 * @returns Calculated subtotal, shipping, tax, and total
 *
 * Note: Tax is set to 0 for all second-hand vintage goods.
 * See /docs/tax-policy.md and /lib/taxCalculation.ts for details.
 */
export function calculateOrderTotals(
  items: OrderItem[],
  shippingRate: number = 10.00
): {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
} {
  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  // Calculate tax for second-hand goods (always 0)
  // See /lib/taxCalculation.ts for explanation
  const tax = calculateTax(subtotal);

  // Calculate total
  const total = subtotal + shippingRate + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shippingRate * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// ============================================================================
// ORDER CRUD OPERATIONS
// ============================================================================

/**
 * Create a new order
 * Automatically marks products as sold
 * @param orderData - Order data without ID and order number
 * @returns Created order with ID and order number
 */
export async function createOrder(
  orderData: CreateOrderData
): Promise<FirebaseServiceResponse<Order>> {
  try {
    // Validate required fields
    if (!orderData.customerInfo?.email || !orderData.items || orderData.items.length === 0) {
      return {
        success: false,
        error: 'Missing required fields: customerInfo.email and items are required',
      };
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Calculate totals if not provided
    const totals = orderData.total
      ? {
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          tax: orderData.tax,
          total: orderData.total,
        }
      : calculateOrderTotals(orderData.items);

    // Create order document
    const orderToCreate = {
      ...orderData,
      orderNumber,
      ...totals,
      status: orderData.status || 'pending' as OrderStatus,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderToCreate);

    // Mark all products as sold
    // Run in background, don't wait for completion
    orderData.items.forEach(async (item) => {
      try {
        await markProductSold(item.productId);
      } catch (error) {
        console.error(`Failed to mark product ${item.productId} as sold:`, error);
        // Don't fail order creation if marking sold fails
      }
    });

    // Get the created order
    const createdOrder: Order = {
      id: docRef.id,
      ...orderToCreate,
    };

    return {
      success: true,
      data: createdOrder,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Get a single order by ID
 * @param orderId - Order document ID
 * @returns Order data or null if not found
 */
export async function getOrder(
  orderId: string
): Promise<FirebaseServiceResponse<Order | null>> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: true,
        data: null,
      };
    }

    const order: Order = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Order;

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error('Error getting order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get order',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Get all orders for a specific customer
 * @param email - Customer email address
 * @returns Array of customer's orders
 */
export async function getOrdersByCustomer(
  email: string
): Promise<FirebaseServiceResponse<Order[]>> {
  try {
    if (!email) {
      return {
        success: false,
        error: 'Customer email is required',
      };
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('customerInfo.email', '==', email),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const orders: Order[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Order));

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error('Error getting customer orders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get customer orders',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Get all orders (admin function)
 * @param statusFilter - Optional filter by order status
 * @returns Array of all orders
 */
export async function getAllOrders(
  statusFilter?: OrderStatus
): Promise<FirebaseServiceResponse<Order[]>> {
  try {
    const ordersRef = collection(db, 'orders');
    const constraints: QueryConstraint[] = [];

    // Apply status filter if provided
    if (statusFilter) {
      constraints.push(where('status', '==', statusFilter));
    }

    // Always order by creation date descending
    constraints.push(orderBy('createdAt', 'desc'));

    // Build and execute query
    const q = query(ordersRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const orders: Order[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Order));

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error('Error getting all orders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get orders',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Update order status (admin function)
 * Uses API route to ensure emails are sent when status changes
 * @param orderId - Order document ID
 * @param status - New order status
 * @param trackingNumber - Optional tracking number (for shipped status)
 * @param carrier - Optional carrier name (for shipped status)
 * @returns Updated order
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
  carrier?: string
): Promise<FirebaseServiceResponse<Order>> {
  try {
    // Call API route to update order status
    // This ensures emails are sent server-side with proper authentication
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        trackingNumber,
        carrier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to update order status',
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.order,
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status',
    };
  }
}

/**
 * Update multiple order fields (admin function)
 * @param orderId - Order document ID
 * @param updates - Partial order data to update
 * @returns Updated order
 */
export async function updateOrder(
  orderId: string,
  updates: Partial<Omit<Order, 'id' | 'createdAt'>>
): Promise<FirebaseServiceResponse<Order>> {
  try {
    const docRef = doc(db, 'orders', orderId);

    // Check if order exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);

    // Get updated order
    const updatedSnap = await getDoc(docRef);
    const updatedOrder: Order = {
      id: updatedSnap.id,
      ...updatedSnap.data(),
    } as Order;

    return {
      success: true,
      data: updatedOrder,
    };
  } catch (error) {
    console.error('Error updating order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order',
      code: (error as { code?: string }).code,
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get order by order number
 * @param orderNumber - Order number (e.g., "VTG-20250118-001")
 * @returns Order or null if not found
 */
export async function getOrderByOrderNumber(
  orderNumber: string
): Promise<FirebaseServiceResponse<Order | null>> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('orderNumber', '==', orderNumber)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: true,
        data: null,
      };
    }

    // Should only be one order with this number
    const doc = querySnapshot.docs[0];
    const order: Order = {
      id: doc.id,
      ...doc.data(),
    } as Order;

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error('Error getting order by order number:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get order',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Get order by payment intent ID
 * @param paymentIntentId - Stripe payment intent ID
 * @returns Order or null if not found
 */
export async function getOrderByPaymentIntentId(
  paymentIntentId: string
): Promise<FirebaseServiceResponse<Order | null>> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('paymentIntentId', '==', paymentIntentId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: true,
        data: null,
      };
    }

    // Should only be one order with this payment intent
    const doc = querySnapshot.docs[0];
    const order: Order = {
      id: doc.id,
      ...doc.data(),
    } as Order;

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error('Error getting order by payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get order',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Get orders count by status (for admin dashboard)
 * @returns Count of orders by each status
 */
export async function getOrdersCountByStatus(): Promise<
  FirebaseServiceResponse<Record<OrderStatus, number>>
> {
  try {
    const allOrdersResult = await getAllOrders();

    if (!allOrdersResult.success) {
      return {
        success: false,
        error: allOrdersResult.error,
      };
    }

    const orders = allOrdersResult.data;

    const counts: Record<OrderStatus, number> = {
      pending: 0,
      paid: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });

    return {
      success: true,
      data: counts,
    };
  } catch (error) {
    console.error('Error getting orders count:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get orders count',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Get recent orders (for admin dashboard)
 * @param limit - Number of recent orders to fetch (default: 10)
 * @returns Recent orders
 */
export async function getRecentOrders(
  limit: number = 10
): Promise<FirebaseServiceResponse<Order[]>> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      orderBy('createdAt', 'desc')
      // Note: limit() would require additional setup, using client-side filtering
    );

    const querySnapshot = await getDocs(q);

    const orders: Order[] = querySnapshot.docs
      .slice(0, limit)
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Order));

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error('Error getting recent orders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recent orders',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Cancel an order
 * @param orderId - Order document ID
 * @returns Updated order with cancelled status
 */
export async function cancelOrder(
  orderId: string
): Promise<FirebaseServiceResponse<Order>> {
  return updateOrderStatus(orderId, 'cancelled');
}

/**
 * Get total revenue (for admin dashboard)
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns Total revenue from paid orders
 */
export async function getTotalRevenue(
  startDate?: Date,
  endDate?: Date
): Promise<FirebaseServiceResponse<number>> {
  try {
    const allOrdersResult = await getAllOrders();

    if (!allOrdersResult.success) {
      return {
        success: false,
        error: allOrdersResult.error,
      };
    }

    let orders = allOrdersResult.data;

    // Filter by paid status only
    orders = orders.filter(order => order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered');

    // Filter by date range if provided
    if (startDate) {
      orders = orders.filter(order => {
        let orderDate: Date;
        if (typeof order.createdAt === 'string') {
          orderDate = new Date(order.createdAt);
        } else if (order.createdAt instanceof Date) {
          orderDate = order.createdAt;
        } else if ('toDate' in order.createdAt && typeof order.createdAt.toDate === 'function') {
          orderDate = order.createdAt.toDate();
        } else {
          return false;
        }
        return orderDate >= startDate;
      });
    }

    if (endDate) {
      orders = orders.filter(order => {
        let orderDate: Date;
        if (typeof order.createdAt === 'string') {
          orderDate = new Date(order.createdAt);
        } else if (order.createdAt instanceof Date) {
          orderDate = order.createdAt;
        } else if ('toDate' in order.createdAt && typeof order.createdAt.toDate === 'function') {
          orderDate = order.createdAt.toDate();
        } else {
          return false;
        }
        return orderDate <= endDate;
      });
    }

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    return {
      success: true,
      data: Math.round(totalRevenue * 100) / 100,
    };
  } catch (error) {
    console.error('Error calculating total revenue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate revenue',
      code: (error as { code?: string }).code,
    };
  }
}
