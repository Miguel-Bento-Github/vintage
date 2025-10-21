import { NextResponse } from 'next/server';
import { getExchangeRatesServer } from '@/lib/exchangeRatesServer';

export async function GET() {
  try {
    const rates = await getExchangeRatesServer();

    return NextResponse.json({
      rates,
      timestamp: Date.now(),
      source: 'exchangerate-api.com',
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch exchange rates',
      },
      { status: 503 }
    );
  }
}
