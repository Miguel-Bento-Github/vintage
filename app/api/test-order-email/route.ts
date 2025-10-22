import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email/orderEmails';
import { Order } from '@/types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Test Order Email API Route
 * Send test order confirmation emails in different languages
 *
 * Usage: POST /api/test-order-email
 * Body: { "to": "email@example.com", "locale": "en" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, locale = 'en' } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Create a mock order for testing
    const mockOrder: Order = {
      id: 'test-order-' + Date.now(),
      orderNumber: 'VTG-TEST-001',
      customerInfo: {
        email: to,
        name: 'Test Customer',
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TC',
          postalCode: '12345',
          country: 'US',
        },
      },
      items: [
        {
          productId: 'test-1',
          title: "Vintage Levi's 501 Jeans",
          brand: "Levi's",
          era: '1980s',
          size: '32x34',
          price: 89.99,
          imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
        },
        {
          productId: 'test-2',
          title: 'Vintage Leather Jacket',
          brand: 'Wilson',
          era: '1970s',
          size: 'L',
          price: 149.99,
          imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5',
        },
      ],
      subtotal: 239.98,
      shipping: 10.00,
      tax: 0,
      total: 249.98,
      status: 'paid',
      paymentIntentId: 'pi_test_123456',
      locale: locale,
      createdAt: Timestamp.now() as unknown as Order['createdAt'],
      updatedAt: Timestamp.now() as unknown as Order['updatedAt'],
    };

    // Send the email
    const result = await sendOrderConfirmationEmail(mockOrder, locale);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test order confirmation email sent in ${locale.toUpperCase()}`,
        emailId: result.emailId,
        locale: locale,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test order email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}

/**
 * GET method to check if the endpoint is working
 */
export async function GET() {
  return NextResponse.json({
    message: 'Test order email endpoint is active',
    usage: 'POST to this endpoint with { "to": "email@example.com", "locale": "en|es|fr|de|ja" }',
    supportedLocales: ['en', 'es', 'fr', 'de', 'ja'],
  });
}
