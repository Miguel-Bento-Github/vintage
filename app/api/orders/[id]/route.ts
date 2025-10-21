import { NextRequest, NextResponse } from 'next/server';
import { getOrderAdmin } from '@/services/adminOrderService';
import { adminDb } from '@/lib/firebase-admin';

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
          const order = {
            id: doc.id,
            ...doc.data(),
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

    return NextResponse.json({
      success: true,
      order: result.data,
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
