import { CheckoutFormData, CheckoutFormErrors } from '@/types/checkout';
import { calculateShipping, getShippingEstimate, isCountrySupported } from '@/lib/shipping';

export function validateCustomerInfo(formData: CheckoutFormData): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};

  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Valid email is required';
  }

  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Full name is required';
  }

  if (!formData.street || formData.street.trim().length < 5) {
    errors.street = 'Street address is required';
  }

  if (!formData.city || formData.city.trim().length < 2) {
    errors.city = 'City is required';
  }

  if (!formData.state || formData.state.trim().length < 2) {
    errors.state = 'State/Province/Region is required';
  }

  // More flexible postal code validation to support international formats
  // US: 12345 or 12345-6789
  // UK: SW1A 1AA
  // France/Germany: 75001
  // Netherlands: 1012 AB
  // Canada: A1A 1A1
  if (!formData.postalCode || formData.postalCode.trim().length < 3) {
    errors.postalCode = 'Valid postal code is required';
  }

  if (!formData.country) {
    errors.country = 'Country is required';
  } else if (!isCountrySupported(formData.country)) {
    errors.country = 'We do not currently ship to this country';
  }

  return errors;
}

/**
 * Calculate checkout totals based on cart total and destination country
 * @param cartTotal - Cart subtotal
 * @param countryCode - ISO 3166-1 alpha-2 country code (optional)
 * @returns Subtotal, shipping cost, and total
 */
export function calculateCheckoutTotals(cartTotal: number, countryCode?: string) {
  const subtotal = cartTotal;

  // Calculate shipping based on destination country
  // Default to domestic (ES) if no country provided
  const shipping = countryCode
    ? calculateShipping(countryCode)
    : calculateShipping('ES');

  // Tax is $0.00 for second-hand vintage goods
  // See /lib/taxCalculation.ts for explanation
  const total = subtotal + shipping;

  return { subtotal, shipping, total };
}
