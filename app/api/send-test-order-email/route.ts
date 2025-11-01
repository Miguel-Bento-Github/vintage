import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, sendShippingNotificationEmail, sendDeliveryConfirmationEmail, sendCancellationEmail } from '@/lib/email/orderEmails';
import { Order } from '@/types';
import { Timestamp } from 'firebase-admin/firestore';
import { verifyAdminAuth } from '@/lib/auth/apiAuth';

/**
 * Send Test Order Emails
 * Send actual order emails to verify they look good
 * REQUIRES ADMIN AUTHENTICATION
 *
 * Usage: POST /api/send-test-order-email
 * Headers: { "Authorization": "Bearer <firebase-id-token>" }
 * Body: { "to": "email@example.com", "type": "confirmation|shipping|delivery|cancellation", "locale": "en" }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUid = await verifyAdminAuth(request);
    if (!adminUid) {
      return NextResponse.json(
        { error: 'Unauthorized - admin authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { to, type = 'confirmation', locale = 'en' } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Create a realistic mock order
    const mockOrder: Order = {
      id: 'test-' + Date.now(),
      orderNumber: 'VTG-20251101-001',
      customerInfo: {
        email: to,
        name: 'Test Customer',
        shippingAddress: {
          street: '123 Main Street',
          city: 'Amsterdam',
          state: 'NH',
          postalCode: '1012 AB',
          country: 'NL',
        },
      },
      items: [
        {
          productId: 'test-1',
          title: "Vintage Levi's 501 Jeans",
          brand: "Levi's",
          era: '1980s',
          size: 'W32 L34',
          price: 89.99,
          imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
        },
        {
          productId: 'test-2',
          title: 'Vintage Leather Jacket',
          brand: 'Schott NYC',
          era: '1970s',
          size: 'L',
          price: 249.99,
          imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5',
        },
      ],
      subtotal: 339.98,
      shipping: 12.50,
      tax: 0,
      total: 352.48,
      status: 'paid',
      paymentIntentId: 'pi_test_123456789',
      trackingNumber: type === 'shipping' || type === 'delivery' ? 'NL1234567890' : undefined,
      locale: locale,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    let result;
    let emailType;

    // Send the appropriate email type
    switch (type) {
      case 'confirmation':
        result = await sendOrderConfirmationEmail(mockOrder, locale);
        emailType = 'Order Confirmation';
        break;

      case 'shipping':
        result = await sendShippingNotificationEmail(mockOrder, {
          trackingUrl: 'https://track.postnl.nl/track-and-trace/NL1234567890',
          carrier: 'PostNL',
          locale,
        });
        emailType = 'Shipping Notification';
        break;

      case 'delivery':
        result = await sendDeliveryConfirmationEmail(mockOrder, locale);
        emailType = 'Delivery Confirmation';
        break;

      case 'cancellation':
        result = await sendCancellationEmail(mockOrder, 'Customer request', locale);
        emailType = 'Cancellation';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use: confirmation, shipping, delivery, or cancellation' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${emailType} email sent to ${to}`,
        emailId: result.emailId,
        type: emailType,
        locale: locale.toUpperCase(),
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send test order emails',
    usage: 'POST { "to": "email@example.com", "type": "confirmation|shipping|delivery|cancellation", "locale": "en|es|fr|de|ja" }',
    types: {
      confirmation: 'Order confirmation email',
      shipping: 'Shipping notification with tracking',
      delivery: 'Delivery confirmation',
      cancellation: 'Order cancellation notice',
    },
  });
}
