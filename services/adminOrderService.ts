/**
 * Admin Order Service
 * Uses Firebase Admin SDK to create orders server-side
 * Bypasses Firestore security rules for secure server-side operations
 */

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import {
  Order,
  CreateOrderData,
  OrderStatus,
} from '@/types';
import {
  FirebaseServiceResponse,
} from '@/types/firebase';

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
 * Create a new order using Admin SDK
 * This bypasses Firestore security rules and is only callable from server-side API routes
 * @param orderData - Order data without ID and order number
 * @returns Created order with ID and order number
 */
export async function createOrderAdmin(
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

    // Create order document
    const orderToCreate = {
      ...orderData,
      orderNumber,
      status: (orderData.status || 'pending') as OrderStatus,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Use Admin SDK to create order (bypasses security rules)
    const docRef = await adminDb.collection('orders').add(orderToCreate);

    // Mark products as sold (run in background)
    orderData.items.forEach(async (item) => {
      try {
        await adminDb.collection('products').doc(item.productId).update({
          inStock: false,
          soldAt: FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error(`Failed to mark product ${item.productId} as sold:`, error);
        // Don't fail order creation if marking sold fails
      }
    });

    // Get the created order
    const doc = await docRef.get();
    const createdOrder: Order = {
      id: doc.id,
      ...doc.data(),
    } as Order;

    return {
      success: true,
      data: createdOrder,
    };
  } catch (error) {
    console.error('Error creating order with Admin SDK:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };
  }
}

/**
 * Get order by ID using Admin SDK
 */
export async function getOrderAdmin(
  orderId: string
): Promise<FirebaseServiceResponse<Order | null>> {
  try {
    const doc = await adminDb.collection('orders').doc(orderId).get();

    if (!doc.exists) {
      return {
        success: true,
        data: null,
      };
    }

    const order: Order = {
      id: doc.id,
      ...doc.data(),
    } as Order;

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error('Error getting order with Admin SDK:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get order',
    };
  }
}
