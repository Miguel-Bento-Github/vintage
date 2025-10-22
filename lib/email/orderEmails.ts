import { render } from '@react-email/components';
import { sendEmailSafely } from '../resend';
import { EmailType, getFromAddress } from './config';
import { adminDb } from '../firebase-admin';
import { Order, EmailHistoryEntry } from '@/types';
import OrderConfirmation from '@/emails/templates/OrderConfirmation';
import ShippingNotification from '@/emails/templates/ShippingNotification';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

interface SendEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Send order confirmation email
 * Triggered when payment is successful
 */
export async function sendOrderConfirmationEmail(
  order: Order,
  locale: string = 'en'
): Promise<SendEmailResult> {
  try {
    // Render email template
    const emailHtml = await render(
      OrderConfirmation({ order, locale })
    );

    // Send email via Resend
    const result = await sendEmailSafely({
      to: order.customerInfo.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: emailHtml,
      from: getFromAddress('orders'),
      replyTo: 'support@dreamazul.com',
    });

    // Create email history entry
    const emailHistoryEntry: Omit<EmailHistoryEntry, 'sentAt'> = {
      type: EmailType.ORDER_CONFIRMATION,
      sentTo: order.customerInfo.email,
      emailId: result.data?.id,
      status: result.success ? 'sent' : 'failed',
      error: result.error ? String(result.error) : undefined,
    };

    // Update order with email history
    await updateOrderEmailHistory(order.id, emailHistoryEntry);

    return {
      success: result.success,
      emailId: result.data?.id,
      error: result.error ? String(result.error) : undefined,
    };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);

    // Log failed attempt
    const emailHistoryEntry: Omit<EmailHistoryEntry, 'sentAt'> = {
      type: EmailType.ORDER_CONFIRMATION,
      sentTo: order.customerInfo.email,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    await updateOrderEmailHistory(order.id, emailHistoryEntry);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send shipping notification email
 * Triggered when order status changes to 'shipped'
 */
export async function sendShippingNotificationEmail(
  order: Order,
  options?: {
    trackingUrl?: string;
    carrier?: string;
    estimatedDelivery?: string;
    locale?: string;
  }
): Promise<SendEmailResult> {
  try {
    const locale = options?.locale || 'en';

    // Render email template
    const emailHtml = await render(
      ShippingNotification({
        order,
        trackingUrl: options?.trackingUrl,
        carrier: options?.carrier,
        estimatedDelivery: options?.estimatedDelivery,
        locale,
      })
    );

    // Send email via Resend
    const result = await sendEmailSafely({
      to: order.customerInfo.email,
      subject: `Your Order Has Shipped - ${order.orderNumber}`,
      html: emailHtml,
      from: getFromAddress('orders'),
      replyTo: 'support@dreamazul.com',
    });

    // Create email history entry
    const emailHistoryEntry: Omit<EmailHistoryEntry, 'sentAt'> = {
      type: EmailType.SHIPPING_NOTIFICATION,
      sentTo: order.customerInfo.email,
      emailId: result.data?.id,
      status: result.success ? 'sent' : 'failed',
      error: result.error ? String(result.error) : undefined,
    };

    // Update order with email history
    await updateOrderEmailHistory(order.id, emailHistoryEntry);

    return {
      success: result.success,
      emailId: result.data?.id,
      error: result.error ? String(result.error) : undefined,
    };
  } catch (error) {
    console.error('Failed to send shipping notification email:', error);

    // Log failed attempt
    const emailHistoryEntry: Omit<EmailHistoryEntry, 'sentAt'> = {
      type: EmailType.SHIPPING_NOTIFICATION,
      sentTo: order.customerInfo.email,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    await updateOrderEmailHistory(order.id, emailHistoryEntry);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update order document with email history entry
 * Appends new entry to emailHistory array
 */
async function updateOrderEmailHistory(
  orderId: string,
  emailEntry: Omit<EmailHistoryEntry, 'sentAt'>
): Promise<void> {
  try {
    const orderRef = adminDb.collection('orders').doc(orderId);

    // Add sentAt timestamp and remove undefined fields
    const fullEntry: EmailHistoryEntry = {
      type: emailEntry.type,
      sentTo: emailEntry.sentTo,
      status: emailEntry.status,
      sentAt: Timestamp.now(),
      ...(emailEntry.emailId && { emailId: emailEntry.emailId }),
      ...(emailEntry.error && { error: emailEntry.error }),
    };

    // Append to emailHistory array
    await orderRef.update({
      emailHistory: FieldValue.arrayUnion(fullEntry),
      updatedAt: Timestamp.now(),
    });

    console.log(`Email history updated for order ${orderId}:`, emailEntry.type, emailEntry.status);
  } catch (error) {
    console.error('Failed to update order email history:', error);
    // Don't throw - email was sent, logging failure shouldn't break the flow
  }
}

/**
 * Get tracking URL for common carriers
 */
export function getCarrierTrackingUrl(carrier: string, trackingNumber: string): string {
  const carriers: Record<string, string> = {
    'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    'DHL': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
  };

  return carriers[carrier] || `https://www.google.com/search?q=${carrier}+tracking+${trackingNumber}`;
}
