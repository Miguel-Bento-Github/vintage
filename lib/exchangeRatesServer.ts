import { Currency } from './currency';

// Cache exchange rates for 1 hour
let cachedRates: Record<Currency, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Fallback rates in case API fails (rounded to 2 decimal places)
export const FALLBACK_RATES: Record<Currency, number> = {
  EUR: 1.0,
  USD: 1.16,
  GBP: 0.87,
  JPY: 175.58,
  CAD: 1.64,
  AUD: 1.79,
};

/**
 * Fetch exchange rates for server-side use
 * Uses caching to avoid excessive API calls
 */
export async function getExchangeRatesServer(): Promise<Record<Currency, number>> {
  try {
    const now = Date.now();

    // Return cached rates if still valid
    if (cachedRates && now - lastFetchTime < CACHE_DURATION) {
      return cachedRates;
    }

    // Fetch fresh rates from ExchangeRate-API (free, no API key required)
    // Using EUR as base currency
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR', {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();

    // Helper to round exchange rates to 2 decimal places
    const roundRate = (rate: number): number => {
      return Math.round(rate * 100) / 100;
    };

    // Extract only the currencies we support and round the rates
    const rates: Record<Currency, number> = {
      EUR: 1.0, // Base currency
      USD: roundRate(data.rates.USD || FALLBACK_RATES.USD),
      GBP: roundRate(data.rates.GBP || FALLBACK_RATES.GBP),
      JPY: roundRate(data.rates.JPY || FALLBACK_RATES.JPY),
      CAD: roundRate(data.rates.CAD || FALLBACK_RATES.CAD),
      AUD: roundRate(data.rates.AUD || FALLBACK_RATES.AUD),
    };

    // Update cache
    cachedRates = rates;
    lastFetchTime = now;

    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates, using fallback:', error);
    // Return cached rates if available, otherwise fallback rates
    return cachedRates || FALLBACK_RATES;
  }
}
