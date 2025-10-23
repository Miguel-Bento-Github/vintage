/**
 * Shipping zone calculations and utilities for international shipping
 * Focus: European market with worldwide coverage
 */

export type ShippingZone =
  | 'domestic'
  | 'europe'
  | 'north-america'
  | 'asia-pacific'
  | 'rest-of-world';

export interface ShippingRate {
  zone: ShippingZone;
  flatRate: number;
  weightTiers?: {
    under500g: number;
    between500gAnd1kg: number;
    between1kgAnd2kg: number;
  };
}

export interface ShippingEstimate {
  cost: number;
  zone: ShippingZone;
  estimatedDays: string;
  destinationCountry: string;
}

export interface Country {
  code: string;
  name: string;
  zone: ShippingZone;
}

// Domestic country (adjust this to your base country)
const DOMESTIC_COUNTRY = 'ES'; // Spain - adjust as needed

// Shipping rates by zone (in USD)
export const SHIPPING_RATES: Record<ShippingZone, ShippingRate> = {
  'domestic': {
    zone: 'domestic',
    flatRate: 5,
    weightTiers: {
      under500g: 5,
      between500gAnd1kg: 8,
      between1kgAnd2kg: 10,
    },
  },
  'europe': {
    zone: 'europe',
    flatRate: 12,
    weightTiers: {
      under500g: 10,
      between500gAnd1kg: 15,
      between1kgAnd2kg: 20,
    },
  },
  'north-america': {
    zone: 'north-america',
    flatRate: 20,
    weightTiers: {
      under500g: 18,
      between500gAnd1kg: 25,
      between1kgAnd2kg: 30,
    },
  },
  'asia-pacific': {
    zone: 'asia-pacific',
    flatRate: 25,
    weightTiers: {
      under500g: 22,
      between500gAnd1kg: 28,
      between1kgAnd2kg: 35,
    },
  },
  'rest-of-world': {
    zone: 'rest-of-world',
    flatRate: 30,
    weightTiers: {
      under500g: 25,
      between500gAnd1kg: 32,
      between1kgAnd2kg: 40,
    },
  },
};

// Estimated delivery times by zone
const DELIVERY_ESTIMATES: Record<ShippingZone, string> = {
  'domestic': '2-3 business days',
  'europe': '5-7 business days',
  'north-america': '7-14 business days',
  'asia-pacific': '10-21 business days',
  'rest-of-world': '14-28 business days',
};

// Comprehensive country list with shipping zones
export const SUPPORTED_COUNTRIES: Country[] = [
  // Domestic
  { code: 'ES', name: 'Spain', zone: 'domestic' },

  // Europe - EU Countries
  { code: 'AT', name: 'Austria', zone: 'europe' },
  { code: 'BE', name: 'Belgium', zone: 'europe' },
  { code: 'BG', name: 'Bulgaria', zone: 'europe' },
  { code: 'HR', name: 'Croatia', zone: 'europe' },
  { code: 'CY', name: 'Cyprus', zone: 'europe' },
  { code: 'CZ', name: 'Czech Republic', zone: 'europe' },
  { code: 'DK', name: 'Denmark', zone: 'europe' },
  { code: 'EE', name: 'Estonia', zone: 'europe' },
  { code: 'FI', name: 'Finland', zone: 'europe' },
  { code: 'FR', name: 'France', zone: 'europe' },
  { code: 'DE', name: 'Germany', zone: 'europe' },
  { code: 'GR', name: 'Greece', zone: 'europe' },
  { code: 'HU', name: 'Hungary', zone: 'europe' },
  { code: 'IE', name: 'Ireland', zone: 'europe' },
  { code: 'IT', name: 'Italy', zone: 'europe' },
  { code: 'LV', name: 'Latvia', zone: 'europe' },
  { code: 'LT', name: 'Lithuania', zone: 'europe' },
  { code: 'LU', name: 'Luxembourg', zone: 'europe' },
  { code: 'MT', name: 'Malta', zone: 'europe' },
  { code: 'NL', name: 'Netherlands', zone: 'europe' },
  { code: 'PL', name: 'Poland', zone: 'europe' },
  { code: 'PT', name: 'Portugal', zone: 'europe' },
  { code: 'RO', name: 'Romania', zone: 'europe' },
  { code: 'SK', name: 'Slovakia', zone: 'europe' },
  { code: 'SI', name: 'Slovenia', zone: 'europe' },
  { code: 'SE', name: 'Sweden', zone: 'europe' },

  // Europe - Non-EU Countries
  { code: 'GB', name: 'United Kingdom', zone: 'europe' },
  { code: 'NO', name: 'Norway', zone: 'europe' },
  { code: 'CH', name: 'Switzerland', zone: 'europe' },
  { code: 'IS', name: 'Iceland', zone: 'europe' },
  { code: 'LI', name: 'Liechtenstein', zone: 'europe' },
  { code: 'MC', name: 'Monaco', zone: 'europe' },
  { code: 'AD', name: 'Andorra', zone: 'europe' },

  // North America
  { code: 'US', name: 'United States', zone: 'north-america' },
  { code: 'CA', name: 'Canada', zone: 'north-america' },
  { code: 'MX', name: 'Mexico', zone: 'north-america' },

  // Asia-Pacific
  { code: 'JP', name: 'Japan', zone: 'asia-pacific' },
  { code: 'CN', name: 'China', zone: 'asia-pacific' },
  { code: 'KR', name: 'South Korea', zone: 'asia-pacific' },
  { code: 'AU', name: 'Australia', zone: 'asia-pacific' },
  { code: 'NZ', name: 'New Zealand', zone: 'asia-pacific' },
  { code: 'SG', name: 'Singapore', zone: 'asia-pacific' },
  { code: 'HK', name: 'Hong Kong', zone: 'asia-pacific' },
  { code: 'TW', name: 'Taiwan', zone: 'asia-pacific' },
  { code: 'TH', name: 'Thailand', zone: 'asia-pacific' },
  { code: 'MY', name: 'Malaysia', zone: 'asia-pacific' },
  { code: 'IN', name: 'India', zone: 'asia-pacific' },
  { code: 'ID', name: 'Indonesia', zone: 'asia-pacific' },
  { code: 'PH', name: 'Philippines', zone: 'asia-pacific' },
  { code: 'VN', name: 'Vietnam', zone: 'asia-pacific' },

  // Rest of World - South America
  { code: 'BR', name: 'Brazil', zone: 'rest-of-world' },
  { code: 'AR', name: 'Argentina', zone: 'rest-of-world' },
  { code: 'CL', name: 'Chile', zone: 'rest-of-world' },
  { code: 'CO', name: 'Colombia', zone: 'rest-of-world' },
  { code: 'PE', name: 'Peru', zone: 'rest-of-world' },

  // Rest of World - Middle East
  { code: 'AE', name: 'United Arab Emirates', zone: 'rest-of-world' },
  { code: 'SA', name: 'Saudi Arabia', zone: 'rest-of-world' },
  { code: 'IL', name: 'Israel', zone: 'rest-of-world' },
  { code: 'TR', name: 'Turkey', zone: 'rest-of-world' },

  // Rest of World - Africa
  { code: 'ZA', name: 'South Africa', zone: 'rest-of-world' },
  { code: 'EG', name: 'Egypt', zone: 'rest-of-world' },
  { code: 'MA', name: 'Morocco', zone: 'rest-of-world' },
];

/**
 * Get shipping zone for a country code
 */
export function getShippingZone(countryCode: string): ShippingZone {
  const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
  return country?.zone || 'rest-of-world';
}

/**
 * Calculate shipping cost based on country and optional weight
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param weightInGrams - Optional weight in grams for weight-based calculation
 * @returns Shipping cost in USD
 */
export function calculateShipping(
  countryCode: string,
  weightInGrams?: number
): number {
  const zone = getShippingZone(countryCode);
  const rates = SHIPPING_RATES[zone];

  // If no weight provided, use flat rate
  if (!weightInGrams || !rates.weightTiers) {
    return rates.flatRate;
  }

  // Weight-based calculation
  if (weightInGrams < 500) {
    return rates.weightTiers.under500g;
  } else if (weightInGrams < 1000) {
    return rates.weightTiers.between500gAnd1kg;
  } else if (weightInGrams <= 2000) {
    return rates.weightTiers.between1kgAnd2kg;
  } else {
    // For items over 2kg, use flat rate + surcharge
    return rates.flatRate + 10;
  }
}

/**
 * Get complete shipping estimate including cost, zone, and delivery time
 */
export function getShippingEstimate(
  countryCode: string,
  weightInGrams?: number
): ShippingEstimate {
  const zone = getShippingZone(countryCode);
  const cost = calculateShipping(countryCode, weightInGrams);
  const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);

  return {
    cost,
    zone,
    estimatedDays: DELIVERY_ESTIMATES[zone],
    destinationCountry: country?.name || 'Unknown',
  };
}

/**
 * Get list of all supported countries
 */
export function getSupportedCountries(): Country[] {
  return SUPPORTED_COUNTRIES;
}

/**
 * Get countries grouped by zone for display purposes
 */
export function getCountriesByZone(): Record<ShippingZone, Country[]> {
  return SUPPORTED_COUNTRIES.reduce((acc, country) => {
    if (!acc[country.zone]) {
      acc[country.zone] = [];
    }
    acc[country.zone].push(country);
    return acc;
  }, {} as Record<ShippingZone, Country[]>);
}

/**
 * Check if a country code is supported
 */
export function isCountrySupported(countryCode: string): boolean {
  return SUPPORTED_COUNTRIES.some(c => c.code === countryCode);
}

/**
 * Get country name from country code
 */
export function getCountryName(countryCode: string): string {
  const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
  return country?.name || countryCode;
}

/**
 * Format shipping cost for display
 */
export function formatShippingCost(cost: number, currencyCode = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(cost);
}

/**
 * Get customs and tax information for a zone
 */
export function getCustomsInfo(zone: ShippingZone): {
  requiresCustomsForm: boolean;
  estimatedDuties: string;
  taxExemption: string;
} {
  switch (zone) {
    case 'domestic':
      return {
        requiresCustomsForm: false,
        estimatedDuties: 'None',
        taxExemption: 'Domestic shipping - no customs',
      };
    case 'europe':
      return {
        requiresCustomsForm: true,
        estimatedDuties: 'Varies by country (typically low for used goods)',
        taxExemption: 'VAT exempt for second-hand goods under margin scheme in many EU countries',
      };
    case 'north-america':
    case 'asia-pacific':
    case 'rest-of-world':
      return {
        requiresCustomsForm: true,
        estimatedDuties: 'Customer responsible for customs duties and import taxes',
        taxExemption: 'Declared as used/vintage clothing - may reduce duties',
      };
  }
}

/**
 * HS Code for used clothing (for customs declarations)
 */
export const HS_CODE_USED_CLOTHING = '6309.00';

/**
 * Get customs declaration template
 */
export function getCustomsDeclaration(itemDescription: string, value: number): {
  description: string;
  hsCode: string;
  value: number;
  origin: string;
} {
  return {
    description: `Used vintage clothing - ${itemDescription}`,
    hsCode: HS_CODE_USED_CLOTHING,
    value,
    origin: 'Various vintage sources',
  };
}

/**
 * Get real-time shipping quote from API (client-side)
 * Falls back to static rates if API unavailable or fails
 *
 * Note: Caching is handled by TanStack Query in the useShippingQuote hook
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param postalCode - Optional postal code for more accurate rates
 * @param weightGrams - Optional weight in grams
 * @returns Shipping quote with carrier info
 */
export async function getRealTimeShippingQuote(
  countryCode: string,
  postalCode?: string,
  weightGrams?: number
): Promise<{
  cost: number;
  carrier: string;
  service: string;
  zone: ShippingZone;
  estimatedDays: string;
  source: 'api' | 'static';
  currency: string;
}> {
  const weight = weightGrams || 500;

  const response = await fetch('/api/shipping-quote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      countryCode,
      postalCode,
      weightGrams: weight,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shipping quote');
  }

  const data = await response.json();

  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error || 'Unknown error');
  }
}
