import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRatesServer } from '@/lib/exchangeRatesServer';
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(identifier, rateLimitConfigs.exchangeRates);

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
