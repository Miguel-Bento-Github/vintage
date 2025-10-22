import { NextRequest, NextResponse } from 'next/server';
import { getOrderAdmin } from '@/services/adminOrderService';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { OrderStatus } from '@/types';
import { sendShippingNotificationEmail, getCarrierTrackingUrl } from '@/lib/email/orderEmails';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

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
            createdAt: docData?.createdAt?.toDate?.()?.toISOString() || docData?.createdAt,
            updatedAt: docData?.updatedAt?.toDate?.()?.toISOString() || docData?.updatedAt,
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
      createdAt: orderData.createdAt?.toDate?.()?.toISOString() || orderData.createdAt,
      updatedAt: orderData.updatedAt?.toDate?.()?.toISOString() || orderData.updatedAt,
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
    const updatedOrder = {
      id: updatedDoc.id,
      ...orderData,
      // Convert Firestore Timestamps to ISO strings for JSON serialization
      createdAt: orderData?.createdAt?.toDate?.()?.toISOString() || orderData?.createdAt,
      updatedAt: orderData?.updatedAt?.toDate?.()?.toISOString() || orderData?.updatedAt,
    };

    // Send shipping notification email if status changed to 'shipped'
    if (status === 'shipped' && order.status !== 'shipped') {
      // Build tracking URL if we have tracking number and carrier
      let trackingUrl: string | undefined;
      if (trackingNumber && carrier) {
        trackingUrl = getCarrierTrackingUrl(carrier, trackingNumber);
      }

      // Use the customer's preferred language from the order
      const emailLocale = order.locale || 'en';

      // Send email asynchronously (don't wait for it)
      sendShippingNotificationEmail(updatedOrder, {
        trackingUrl,
        carrier,
        estimatedDelivery: '5-7 business days',
        locale: emailLocale,
      }).catch((error) => {
        console.error('Failed to send shipping notification email:', error);
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
