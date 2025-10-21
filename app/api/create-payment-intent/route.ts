import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CartItem } from '@/types';
import { Currency } from '@/lib/currency';
import { getStripeAmount, getStripeCurrency, isStripeSupportedCurrency } from '@/lib/stripeHelpers';

export async function POST(request: NextRequest) {
  try {
    const { items, currency = 'EUR' }: { items: CartItem[]; currency?: Currency } = await request.json();

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate currency
    if (!isStripeSupportedCurrency(currency)) {
      return NextResponse.json(
        { error: `Currency ${currency} is not supported` },
        { status: 400 }
      );
    }

    // Calculate subtotal and shipping (no tax - Stripe will calculate)
    // Note: Prices in cart are already in the selected currency
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const shipping = subtotal >= 100 ? 0 : 10; // Free shipping over €100 equivalent
    const total = subtotal + shipping;

    // Convert to Stripe's smallest currency unit (cents for most, yen for JPY)
    const amount = getStripeAmount(total, currency);

    // Create payment intent
    // Store all order data in metadata so we can create the order later
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: getStripeCurrency(currency),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        // Store full item details for order creation
        items: JSON.stringify(items),
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        currency: currency, // Store the currency for order creation
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
