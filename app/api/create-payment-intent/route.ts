import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CartItem } from '@/types';
import { Currency, convertPrice } from '@/lib/currency';
import { getStripeAmount, getStripeCurrency, isStripeSupportedCurrency } from '@/lib/stripeHelpers';
import { getExchangeRatesServer } from '@/lib/exchangeRatesServer';
import { calculateShipping } from '@/lib/shipping';

export async function POST(request: NextRequest) {
  try {
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
    // Store essential order data in metadata (Stripe has 500 char limit per value)
    // Full item details will be stored when creating the order
    // Note: Tax is $0.00 for second-hand goods - see /docs/tax-policy.md
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: getStripeCurrency(currency),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        // Store only product IDs (full details fetched from DB when creating order)
        productIds: items.map(item => item.productId).join(','),
        itemCount: items.length.toString(),
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
