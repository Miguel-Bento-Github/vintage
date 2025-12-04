import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 Payment succeeded:', paymentIntent.id);

        // Check if order already exists (frontend may have already created it)
        const existingOrders = await adminDb
          .collection('orders')
          .where('paymentIntentId', '==', paymentIntent.id)
          .limit(1)
          .get();

        if (!existingOrders.empty) {
          console.log('📋 Order already exists for payment:', paymentIntent.id);
          break;
        }

        // Fallback order creation (if frontend didn't create it)
        // This can happen if user closes browser before frontend completes
        const items = JSON.parse(paymentIntent.metadata.items || '[]');

        const orderData = {
          paymentIntentId: paymentIntent.id,
          status: 'paid',
          items,
          subtotal: parseFloat(paymentIntent.metadata.subtotal || '0'),
          shipping: parseFloat(paymentIntent.metadata.shipping || '0'),
          tax: parseFloat(paymentIntent.metadata.tax || '0'),
          total: parseFloat(paymentIntent.metadata.total || '0'),
          customerEmail: paymentIntent.receipt_email || paymentIntent.metadata.customerEmail || '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdVia: 'webhook-fallback',
        };

        const orderDoc = await adminDb.collection('orders').add(orderData);
        console.log('✅ Order created via webhook fallback:', orderDoc.id);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('❌ Payment failed:', paymentIntent.id);
        console.error('Error:', paymentIntent.last_payment_error?.message);

        // TODO: Notify customer of failed payment
        // TODO: Log failed payment attempt

        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('🚫 Payment canceled:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Webhook handler failed',
      },
      { status: 500 }
    );
  }
}
