import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CartItem } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: CartItem[] } = await request.json();

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate subtotal and shipping (no tax - Stripe will calculate)
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const shipping = subtotal >= 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + shipping;

    // Convert to cents for Stripe
    const amount = Math.round(total * 100);

    // Create payment intent
    // Store all order data in metadata so we can create the order later
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        // Store full item details for order creation
        items: JSON.stringify(items),
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      },
      { status: 500 }
    );
  }
}
