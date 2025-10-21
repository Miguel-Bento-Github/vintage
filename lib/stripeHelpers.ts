import { Currency } from './currency';

/**
 * Stripe-specific currency helpers
 * Handles the conversion of amounts to Stripe's smallest currency unit
 */

/**
 * Zero-decimal currencies (no cents/minor units)
 * These currencies are charged in whole units, not fractional units
 * @see https://stripe.com/docs/currencies#zero-decimal
 */
const ZERO_DECIMAL_CURRENCIES: Currency[] = ['JPY'];

/**
 * Convert an amount to Stripe's smallest currency unit
 *
 * For most currencies (USD, EUR, GBP, CAD, AUD), this means cents (multiply by 100)
 * For zero-decimal currencies (JPY), the amount is already in the smallest unit
 *
 * @param amount - The amount in standard units (e.g., 10.50 USD = $10.50)
 * @param currency - The currency code
 * @returns The amount in Stripe's smallest unit (e.g., 1050 for $10.50 USD, 1050 for ¥1050 JPY)
 *
 * @example
 * getStripeAmount(10.50, 'USD') // Returns 1050 (cents)
 * getStripeAmount(1050, 'JPY')  // Returns 1050 (yen, no conversion)
 */
export function getStripeAmount(amount: number, currency: Currency): number {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency)) {
    // Zero-decimal currencies: use the amount as-is
    return Math.round(amount);
  }

  // Standard currencies: convert to cents
  return Math.round(amount * 100);
}

/**
 * Convert a Stripe amount back to standard units
 *
 * @param stripeAmount - The amount in Stripe's smallest unit
 * @param currency - The currency code
 * @returns The amount in standard units
 *
 * @example
 * fromStripeAmount(1050, 'USD') // Returns 10.50
 * fromStripeAmount(1050, 'JPY') // Returns 1050
 */
export function fromStripeAmount(stripeAmount: number, currency: Currency): number {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency)) {
    return stripeAmount;
  }

  return stripeAmount / 100;
}

/**
 * Format currency code for Stripe
 * Stripe requires lowercase currency codes
 *
 * @param currency - The currency code
 * @returns Lowercase currency code for Stripe
 */
export function getStripeCurrency(currency: Currency): string {
  return currency.toLowerCase();
}

/**
 * Validate if a currency is supported by Stripe
 * All our supported currencies are supported by Stripe
 *
 * @param currency - The currency code to validate
 * @returns true if supported
 */
export function isStripeSupportedCurrency(currency: Currency): boolean {
  const supportedCurrencies: Currency[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  return supportedCurrencies.includes(currency);
}

/**
 * Get the minimum charge amount for a currency
 * Stripe has minimum charge amounts that vary by currency
 * @see https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
 *
 * @param currency - The currency code
 * @returns Minimum amount in standard units
 */
export function getMinimumChargeAmount(currency: Currency): number {
  const minimums: Record<Currency, number> = {
    USD: 0.50,  // $0.50
    EUR: 0.50,  // €0.50
    GBP: 0.30,  // £0.30
    JPY: 50,    // ¥50
    CAD: 0.50,  // CA$0.50
    AUD: 0.50,  // A$0.50
  };

  return minimums[currency];
}
