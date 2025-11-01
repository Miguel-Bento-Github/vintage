import { NextRequest, NextResponse } from 'next/server';
import { createOrderAdmin } from '@/services/adminOrderService';
import { CustomerInfo, OrderItem } from '@/types';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email/orderEmails';
import { toLocale } from '@/i18n';
import { stripe } from '@/lib/stripe';

interface CreateOrderRequest {
  paymentIntentId: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  locale?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // CRITICAL SECURITY: Verify the payment was actually successful
    // Never trust client-provided payment status
    if (!body.paymentIntentId || !body.paymentIntentId.startsWith('pi_')) {
      return NextResponse.json(
        { error: 'Invalid payment intent ID' },
        { status: 400 }
      );
    }

    // Fetch payment intent from Stripe to verify payment succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(body.paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    // Verify the payment amount matches (prevent price manipulation)
    const expectedAmount = Math.round(body.total * 100); // Convert to cents
    if (Math.abs(paymentIntent.amount - expectedAmount) > 1) { // Allow 1 cent rounding difference
      console.error('Amount mismatch:', {
        expected: expectedAmount,
        actual: paymentIntent.amount,
        difference: Math.abs(paymentIntent.amount - expectedAmount)
      });
      return NextResponse.json(
        { error: 'Payment amount mismatch' },
        { status: 400 }
      );
    }

    // Check if order already exists for this payment intent (prevent duplicate orders)
    const { adminDb } = await import('@/lib/firebase-admin');
    const existingOrders = await adminDb
      .collection('orders')
      .where('paymentIntentId', '==', body.paymentIntentId)
      .limit(1)
      .get();

    if (!existingOrders.empty) {
      const existingOrder = existingOrders.docs[0];
      return NextResponse.json({
        success: true,
        orderId: existingOrder.id,
        orderNumber: existingOrder.data().orderNumber,
        message: 'Order already exists for this payment',
      });
    }

    // Get locale from request headers (next-intl sets this)
    const headerLocale = request.headers.get('x-locale') || request.headers.get('accept-language')?.split(',')[0]?.split('-')[0];

    // Try to extract locale from referer URL (most reliable source)
    const referer = request.headers.get('referer');
    let refererLocale: string | null = null;
    if (referer) {
      const match = referer.match(/\/([a-z]{2})\//);
      if (match) refererLocale = match[1];
    }

    // Priority: body locale > referer locale > header locale > default 'en'
    const finalLocale = body.locale || refererLocale || headerLocale || 'en';

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
      locale: finalLocale, // Store user's language preference
    });

    if (!result.success) {
      console.error('Failed to create order:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to create order' },
        { status: 500 }
      );
    }

    // Send emails (async, don't wait for completion)
    if (result.data) {
      const emailLocale = toLocale(result.data.locale);

      // Send customer confirmation email
      sendOrderConfirmationEmail(result.data, emailLocale).catch((error) => {
        console.error('Failed to send order confirmation email:', error);
        // Don't fail order creation if email fails
      });

      // Send admin notification email
      sendAdminOrderNotification(result.data).catch((error) => {
        console.error('Failed to send admin notification email:', error);
        // Don't fail order creation if email fails
      });
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
