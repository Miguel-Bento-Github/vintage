import { Locale } from "@/i18n";

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD";

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  decimalPlaces: number;
  symbolPosition: "before" | "after";
}

/**
 * Supported currencies with their display information
 */
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    decimalPlaces: 0,
    symbolPosition: "before",
  },
  CAD: {
    code: "CAD",
    symbol: "CA$",
    name: "Canadian Dollar",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
};

/**
 * Map locales to their default currencies
 */
const LOCALE_TO_CURRENCY: Record<Locale, Currency> = {
  en: "USD",
  es: "EUR",
  fr: "EUR",
  de: "EUR",
  ja: "JPY",
};

/**
 * Get the default currency for a given locale
 */
export function getCurrencyFromLocale(locale: Locale): Currency {
  return LOCALE_TO_CURRENCY[locale] || "USD";
}

/**
 * Format a price amount with proper currency symbol and formatting
 * @param amount - The price amount in the base currency (EUR)
 * @param currency - The target currency code
 * @param converted - The converted amount (if already converted)
 */
export function formatPrice(
  amount: number,
  currency: Currency,
  converted?: number
): string {
  const currencyInfo = CURRENCIES[currency];
  const displayAmount = converted ?? amount;

  // Round to appropriate decimal places
  const roundedAmount =
    currencyInfo.decimalPlaces === 0
      ? Math.round(displayAmount)
      : Number(displayAmount.toFixed(currencyInfo.decimalPlaces));

  // Format the number with appropriate separators
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currencyInfo.decimalPlaces,
    maximumFractionDigits: currencyInfo.decimalPlaces,
  }).format(roundedAmount);

  // Position symbol before or after based on currency rules
  if (currencyInfo.symbolPosition === "before") {
    return `${currencyInfo.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber}${currencyInfo.symbol}`;
  }
}

/**
 * Default exchange rates from EUR (base currency)
 * These are used as fallback if the API is unavailable
 * Live rates are fetched from /api/exchange-rates
 * Rates are rounded to 2 decimal places
 */
export const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  EUR: 1.0, // Base currency
  USD: 1.16, // 1 EUR ≈ 1.16 USD
  GBP: 0.87, // 1 EUR ≈ 0.87 GBP
  JPY: 175.58, // 1 EUR ≈ 175.58 JPY
  CAD: 1.64, // 1 EUR ≈ 1.64 CAD
  AUD: 1.79, // 1 EUR ≈ 1.79 AUD
};

/**
 * Current exchange rates (will be updated from API)
 */
let currentExchangeRates: Record<Currency, number> = DEFAULT_EXCHANGE_RATES;

/**
 * Get current exchange rates
 */
export function getExchangeRates(): Record<Currency, number> {
  return currentExchangeRates;
}

/**
 * Update exchange rates (called by CurrencyContext)
 */
export function setExchangeRates(rates: Record<Currency, number>): void {
  currentExchangeRates = rates;
}

/**
 * Fetches live exchange rates from the API
 * Client-side only: Use getExchangeRatesServer() for server-side code
 * Returns cached rates if available and fresh, otherwise fetches new rates
 */
export async function fetchExchangeRates(): Promise<Record<Currency, number>> {
  try {
    // Check if we're on the server
    if (typeof window === 'undefined') {
      console.warn('fetchExchangeRates() called on server-side. Use getExchangeRatesServer() instead.');
      return DEFAULT_EXCHANGE_RATES;
    }

    const response = await fetch('/api/exchange-rates');
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates, using defaults:', error);
    return DEFAULT_EXCHANGE_RATES;
  }
}

/**
 * Convert a price from EUR (base currency) to target currency
 * Uses current exchange rates which are updated from the API
 */
export function convertPrice(
  amountInEUR: number,
  targetCurrency: Currency,
  rates?: Record<Currency, number>
): number {
  const exchangeRates = rates || currentExchangeRates;
  const rate = exchangeRates[targetCurrency];
  return amountInEUR * rate;
}

/**
 * Get the list of all supported currencies
 */
export function getSupportedCurrencies(): Currency[] {
  return Object.keys(CURRENCIES) as Currency[];
}

/**
 * Check if a string is a valid currency code
 */
export function isValidCurrency(code: string): code is Currency {
  return code in CURRENCIES;
}
