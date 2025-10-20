import { NextRequest, NextResponse } from 'next/server';
import { getOrder, getOrderByPaymentIntentId } from '@/services/orderService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Try to fetch by order ID first
    let result = await getOrder(orderId);

    // If not found and ID looks like a payment intent ID, try that
    if (!result.success && orderId.startsWith('pi_')) {
      result = await getOrderByPaymentIntentId(orderId);
    } else if (result.success && !result.data && orderId.startsWith('pi_')) {
      // Also try payment intent if order not found by ID
      result = await getOrderByPaymentIntentId(orderId);
    }

    if (!result.success || !result.data) {
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
