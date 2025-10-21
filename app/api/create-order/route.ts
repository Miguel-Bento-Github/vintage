import { NextRequest, NextResponse } from 'next/server';
import { createOrderAdmin } from '@/services/adminOrderService';
import { CustomerInfo, OrderItem } from '@/types';

interface CreateOrderRequest {
  paymentIntentId: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    if (!body.customerInfo || !body.customerInfo.email) {
      return NextResponse.json(
        { error: 'Customer information is required' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Create order in Firebase using Admin SDK (bypasses security rules)
    const result = await createOrderAdmin({
      paymentIntentId: body.paymentIntentId,
      customerInfo: body.customerInfo,
      items: body.items,
      subtotal: body.subtotal,
      shipping: body.shipping,
      tax: body.tax,
      total: body.total,
      status: 'paid', // Payment already succeeded at this point
    });

    if (!result.success) {
      console.error('Failed to create order:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to create order' },
        { status: 500 }
      );
    }

    // Return order ID
    return NextResponse.json({
      success: true,
      orderId: result.data?.id,
      orderNumber: result.data?.orderNumber,
    });
  } catch (error) {
    console.error('Error in create-order API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
