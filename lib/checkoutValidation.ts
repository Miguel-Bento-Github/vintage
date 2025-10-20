import { CheckoutFormData, CheckoutFormErrors } from '@/types/checkout';

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
  }

  return errors;
}

export function calculateCheckoutTotals(cartTotal: number) {
  const subtotal = cartTotal;
  const shipping = subtotal >= 100 ? 0 : 10;
  // Tax will be calculated by Stripe based on customer location
  // European VAT rates vary by country (19-25%), US sales tax varies by state
  const total = subtotal + shipping;

  return { subtotal, shipping, total };
}
