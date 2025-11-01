import { NextRequest, NextResponse } from 'next/server';
import { getOrderAdmin } from '@/services/adminOrderService';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { OrderStatus, Order, timestampToISO } from '@/types';
import { sendShippingNotificationEmail, sendDeliveryConfirmationEmail, sendCancellationEmail, getCarrierTrackingUrl } from '@/lib/email/orderEmails';
import { toLocale } from '@/i18n';
import { verifyAdminAuth } from '@/lib/auth/apiAuth';
import { markProductAvailable } from '@/services/productService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Security model:
    // - Anyone with the order ID or payment intent ID can view that specific order
    //   (the ID acts as an unguessable token since Firestore IDs are random)
    // - No authentication required for GET by specific ID
    // - Admin auth only required for listing/querying all orders

    // Try to fetch by order ID first using Admin SDK
    const result = await getOrderAdmin(orderId);

    // If not found and ID looks like a payment intent ID, search for it
    if (!result.success || !result.data) {
      if (orderId.startsWith('pi_')) {
        // Search for order by paymentIntentId using Admin SDK
        const querySnapshot = await adminDb
          .collection('orders')
          .where('paymentIntentId', '==', orderId)
          .limit(1)
          .get();

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const docData = doc.data();
          const order = {
            id: doc.id,
            ...docData,
            // Convert Firestore Timestamps to ISO strings for JSON serialization
            createdAt: timestampToISO(docData?.createdAt) || docData?.createdAt,
            updatedAt: timestampToISO(docData?.updatedAt) || docData?.updatedAt,
          };
          return NextResponse.json({
            success: true,
            order,
          });
        }
      }

      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Convert Firestore Timestamps to ISO strings for JSON serialization
    const orderData = result.data;
    const serializedOrder = orderData ? {
      ...orderData,
      createdAt: timestampToISO(orderData.createdAt) || orderData.createdAt,
      updatedAt: timestampToISO(orderData.updatedAt) || orderData.updatedAt,
    } : null;

    return NextResponse.json({
      success: true,
      order: serializedOrder,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch order',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const adminUid = await verifyAdminAuth(request);
    if (!adminUid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const { status, trackingNumber, carrier } = body as {
      status: OrderStatus;
      trackingNumber?: string;
      carrier?: string;
    };

    // Validate status
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Get the order first to check if it exists and get current data
    const orderResult = await getOrderAdmin(orderId);
    if (!orderResult.success || !orderResult.data) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult.data;

    // Prepare update data
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: Timestamp.now(),
    };

    // Add tracking number if provided
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    // Update order in Firebase
    const orderRef = adminDb.collection('orders').doc(orderId);
    await orderRef.update(updateData);

    // Get updated order
    const updatedDoc = await orderRef.get();
    const orderData = updatedDoc.data();

    if (!orderData) {
      return NextResponse.json(
        { error: 'Order not found after update' },
        { status: 404 }
      );
    }

    // Get the customer's preferred language from the order
    const emailLocale = toLocale(orderData.locale || order.locale);

    // Build order object for API response with ISO string timestamps
    const updatedOrder = {
      id: updatedDoc.id,
      ...orderData,
      createdAt: timestampToISO(orderData.createdAt) || orderData.createdAt,
      updatedAt: timestampToISO(orderData.updatedAt) || orderData.updatedAt,
    };

    // Build order object for email templates with original Timestamp objects
    const orderForEmail: Order = {
      id: updatedDoc.id,
      orderNumber: orderData.orderNumber,
      customerInfo: orderData.customerInfo,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      tax: orderData.tax,
      total: orderData.total,
      status: orderData.status,
      paymentIntentId: orderData.paymentIntentId,
      trackingNumber: orderData.trackingNumber,
      emailHistory: orderData.emailHistory,
      locale: orderData.locale,
      customerId: orderData.customerId,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
    };

    // Send shipping notification email if status changed to 'shipped'
    if (status === 'shipped' && order.status !== 'shipped') {
      // Build tracking URL if we have tracking number and carrier
      let trackingUrl: string | undefined;
      if (trackingNumber && carrier) {
        trackingUrl = getCarrierTrackingUrl(carrier, trackingNumber);
      }

      // Send email asynchronously (don't wait for it)
      sendShippingNotificationEmail(orderForEmail, {
        trackingUrl,
        carrier,
        locale: emailLocale,
      }).catch((error) => {
        console.error('Failed to send shipping notification email:', error);
        // Don't fail status update if email fails
      });
    }

    // Send delivery confirmation email if status changed to 'delivered'
    if (status === 'delivered' && order.status !== 'delivered') {
      // Send email asynchronously (don't wait for it)
      sendDeliveryConfirmationEmail(orderForEmail, emailLocale).catch((error) => {
        console.error('Failed to send delivery confirmation email:', error);
        // Don't fail status update if email fails
      });
    }

    // Send cancellation email if status changed to 'cancelled'
    if (status === 'cancelled' && order.status !== 'cancelled') {
      // Restore product availability for all items in the order
      orderForEmail.items.forEach(async (item) => {
        try {
          await markProductAvailable(item.productId);
          console.log(`Restored availability for product ${item.productId} after order cancellation`);
        } catch (error) {
          console.error(`Failed to restore availability for product ${item.productId}:`, error);
          // Don't fail status update if product update fails
        }
      });

      // Send email asynchronously (don't wait for it)
      sendCancellationEmail(orderForEmail, undefined, emailLocale).catch((error) => {
        console.error('Failed to send cancellation email:', error);
        // Don't fail status update if email fails
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
