import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CartItem } from '@/types';
import { Currency, convertPrice } from '@/lib/currency';
import { getStripeAmount, getStripeCurrency, isStripeSupportedCurrency } from '@/lib/stripeHelpers';
import { getExchangeRatesServer } from '@/lib/exchangeRatesServer';
import { calculateShipping } from '@/lib/shipping';
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(identifier, rateLimitConfigs.createPaymentIntent);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    const { items, currency = 'EUR', shippingCountry }: { items: CartItem[]; currency?: Currency; shippingCountry?: string } = await request.json();

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

    // Calculate total weight for shipping
    const totalWeightGrams = items.reduce((sum, item) => sum + (item.weightGrams || 500), 0); // Default 500g if no weight specified

    // Calculate shipping based on destination country and weight
    // Default to Netherlands (NL) if no country specified
    const destinationCountry = shippingCountry || 'NL';
    const shippingCostInEUR = calculateShipping(destinationCountry, totalWeightGrams);
    const shippingCost = convertPrice(shippingCostInEUR, currency, exchangeRates);

    // Free shipping threshold: €100 or equivalent
    const shippingThreshold = convertPrice(100, currency, exchangeRates);
    const shipping = subtotal >= shippingThreshold ? 0 : shippingCost;
    const total = subtotal + shipping;

    // Validate minimum amount for Stripe
    // Stripe requires at least €0.50 (or equivalent) in the settlement currency
    const minimumInEUR = 0.50;
    const totalInEUR = subtotalInEUR + (shipping > 0 ? shippingCostInEUR : 0);

    if (totalInEUR < minimumInEUR) {
      return NextResponse.json(
        {
          error: `Minimum order amount is €${minimumInEUR.toFixed(2)} (${convertPrice(minimumInEUR, currency, exchangeRates).toFixed(2)} ${currency}). Please add more items to your cart.`,
        },
        { status: 400 }
      );
    }

    // Convert to Stripe's smallest currency unit (cents for most, yen for JPY)
    const amount = getStripeAmount(total, currency);

    // Create payment intent
    // Store all order data in metadata so we can create the order later
    // Note: Tax is $0.00 for second-hand goods - see /docs/tax-policy.md
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
        tax: '0.00', // Second-hand goods tax-exempt
        total: total.toFixed(2),
        currency: currency, // Store the currency for order creation
        taxExemptReason: 'second_hand_goods', // For record-keeping
        shippingCountry: destinationCountry, // Store destination for order records
        totalWeightGrams: totalWeightGrams.toString(), // Store weight for shipping records
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
