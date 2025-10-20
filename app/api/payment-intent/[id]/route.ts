import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentIntentId = params.id;

    if (!paymentIntentId || !paymentIntentId.startsWith('pi_')) {
      return NextResponse.json(
        { error: 'Invalid payment intent ID' },
        { status: 400 }
      );
    }

    // Fetch payment intent from Stripe with expanded charges to get billing details
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge', 'latest_charge.payment_method_details'],
    });

    return NextResponse.json({
      success: true,
      paymentIntent,
    });
  } catch (error) {
    console.error('Error fetching payment intent:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch payment intent',
      },
      { status: 500 }
    );
  }
}
