import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CartItem } from '@/types';
import { Currency, convertPrice } from '@/lib/currency';
import { getStripeAmount, getStripeCurrency, isStripeSupportedCurrency } from '@/lib/stripeHelpers';
import { getExchangeRatesServer } from '@/lib/exchangeRatesServer';

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

    // Fetch current exchange rates (server-side)
    const exchangeRates = await getExchangeRatesServer();

    // Calculate subtotal and shipping
    // Note: Prices in cart are in EUR (base currency), need to convert to selected currency
    const subtotalInEUR = items.reduce((sum, item) => sum + item.price, 0);
    const subtotal = convertPrice(subtotalInEUR, currency, exchangeRates);

    // Free shipping threshold: €100 or equivalent
    const shippingThreshold = convertPrice(100, currency, exchangeRates);
    const shippingCost = convertPrice(10, currency, exchangeRates);
    const shipping = subtotal >= shippingThreshold ? 0 : shippingCost;
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
