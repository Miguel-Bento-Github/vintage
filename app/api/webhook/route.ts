import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

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

        // Create order in Firebase
        const items = JSON.parse(paymentIntent.metadata.items || '[]');

        const orderData = {
          paymentIntentId: paymentIntent.id,
          status: 'paid',
          items,
          subtotal: parseFloat(paymentIntent.metadata.subtotal || '0'),
          shipping: parseFloat(paymentIntent.metadata.shipping || '0'),
          tax: parseFloat(paymentIntent.metadata.tax || '0'),
          total: parseFloat(paymentIntent.metadata.total || '0'),
          customerEmail: paymentIntent.receipt_email || '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const ordersRef = collection(db, 'orders');
        const orderDoc = await addDoc(ordersRef, orderData);
        console.log('✅ Order created:', orderDoc.id);

        // TODO: Mark products as sold in Firebase
        // TODO: Send confirmation email

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
