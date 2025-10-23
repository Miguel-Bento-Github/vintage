import { NextRequest, NextResponse } from 'next/server';
import { getSendCloudRate } from '@/lib/sendcloud';
import { calculateShipping, getShippingEstimate } from '@/lib/shipping';

/**
 * POST /api/shipping-quote
 *
 * Get real-time shipping quote from SendCloud API with fallback to static rates
 *
 * Request body:
 * {
 *   countryCode: string;     // ISO 3166-1 alpha-2 (e.g., 'NL', 'DE', 'US')
 *   postalCode?: string;     // Optional for more accurate rates
 *   weightGrams?: number;    // Optional, defaults to 500g
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     cost: number;
 *     carrier: string;
 *     service: string;
 *     zone: string;
 *     estimatedDays: string;
 *     source: 'api' | 'static';  // Indicates if from real API or fallback
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, postalCode, weightGrams = 500 } = body;

    // Validate input
    if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Valid countryCode (ISO 3166-1 alpha-2) is required' },
        { status: 400 }
      );
    }

    // Try to get real-time rate from SendCloud API
    const sendCloudRate = await getSendCloudRate(countryCode, weightGrams, postalCode);

    if (sendCloudRate) {
      // Successfully got rate from SendCloud API
      // Estimate delivery days based on carrier
      const estimatedDays = getDeliveryEstimate(sendCloudRate.carrier, countryCode);

      return NextResponse.json({
        success: true,
        data: {
          cost: sendCloudRate.price,
          carrier: sendCloudRate.carrier,
          service: sendCloudRate.service,
          zone: getZoneFromCountry(countryCode),
          estimatedDays,
          source: 'api', // Real-time rate from SendCloud
          currency: sendCloudRate.currency,
        },
      });
    }

    // Fallback to static rates if SendCloud API unavailable or fails
    console.log(`Using static fallback rate for ${countryCode}`);
    const staticEstimate = getShippingEstimate(countryCode, weightGrams);

    return NextResponse.json({
      success: true,
      data: {
        cost: staticEstimate.cost,
        carrier: 'Standard',
        service: `${staticEstimate.zone} shipping`,
        zone: staticEstimate.zone,
        estimatedDays: staticEstimate.estimatedDays,
        source: 'static', // Fallback to static rates
        currency: 'USD',
      },
    });
  } catch (error) {
    console.error('Error in shipping-quote API:', error);

    // On error, return static rate as fallback
    try {
      const body = await request.json();
      const { countryCode, weightGrams = 500 } = body;

      if (countryCode) {
        const staticEstimate = getShippingEstimate(countryCode, weightGrams);
        return NextResponse.json({
          success: true,
          data: {
            cost: staticEstimate.cost,
            carrier: 'Standard',
            service: `${staticEstimate.zone} shipping`,
            zone: staticEstimate.zone,
            estimatedDays: staticEstimate.estimatedDays,
            source: 'static',
            currency: 'USD',
          },
        });
      }
    } catch (fallbackError) {
      // If even fallback fails, return error
      console.error('Fallback also failed:', fallbackError);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get shipping quote',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get delivery estimate based on carrier and destination
 */
function getDeliveryEstimate(carrier: string, countryCode: string): string {
  const carrierLower = carrier.toLowerCase();

  // Domestic Netherlands
  if (countryCode === 'NL') {
    if (carrierLower.includes('postnl')) return '1-2 business days';
    if (carrierLower.includes('dhl')) return '1-2 business days';
    return '2-3 business days';
  }

  // European Union
  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

  if (euCountries.includes(countryCode)) {
    if (carrierLower.includes('dhl express') || carrierLower.includes('ups')) return '2-4 business days';
    if (carrierLower.includes('dhl')) return '3-5 business days';
    if (carrierLower.includes('dpd')) return '3-5 business days';
    return '5-7 business days';
  }

  // UK
  if (countryCode === 'GB') {
    return '5-7 business days';
  }

  // North America
  if (['US', 'CA', 'MX'].includes(countryCode)) {
    if (carrierLower.includes('dhl express') || carrierLower.includes('ups')) return '5-7 business days';
    return '7-14 business days';
  }

  // Asia-Pacific
  if (['JP', 'CN', 'KR', 'AU', 'NZ', 'SG', 'HK', 'TW'].includes(countryCode)) {
    if (carrierLower.includes('dhl express') || carrierLower.includes('ups')) return '5-10 business days';
    return '10-21 business days';
  }

  // Rest of world
  return '14-28 business days';
}

/**
 * Helper: Get shipping zone from country code
 */
function getZoneFromCountry(countryCode: string): string {
  if (countryCode === 'ES' || countryCode === 'NL') return 'domestic';

  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'NO', 'CH', 'IS'];
  if (euCountries.includes(countryCode)) return 'europe';

  if (['US', 'CA', 'MX'].includes(countryCode)) return 'north-america';
  if (['JP', 'CN', 'KR', 'AU', 'NZ', 'SG', 'HK', 'TW', 'TH', 'MY', 'IN', 'ID', 'PH', 'VN'].includes(countryCode)) return 'asia-pacific';

  return 'rest-of-world';
}
