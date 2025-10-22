/**
 * Tax Calculation for Second-Hand Vintage Goods
 *
 * IMPORTANT: All items sold on this platform are second-hand/vintage goods.
 * In most jurisdictions, second-hand goods are exempt from standard sales tax/VAT
 * when sold by individuals or under special margin schemes.
 *
 * See /docs/tax-policy.md for detailed information about tax treatment by jurisdiction.
 */

/**
 * Calculate tax for second-hand vintage goods
 *
 * @param subtotal - Order subtotal before tax
 * @returns Tax amount (always 0 for second-hand goods)
 *
 * Tax Exemption Rationale:
 * - US: Most states exempt used goods from sales tax (tax already paid on original purchase)
 * - EU: Second-hand goods qualify for VAT Margin Scheme (VAT exempt or reduced)
 * - UK: VAT Margin Scheme applies to second-hand goods
 * - Canada: GST/HST generally not applicable to personal used goods
 * - Australia: GST may not apply to second-hand goods under margin scheme
 * - Japan: Special consumption tax rules for used goods
 *
 * Compliance Notes:
 * - We maintain the tax field in orders for accounting and potential future use
 * - Set to 0 to reflect tax-exempt status of genuine second-hand goods
 * - Customers may have use tax or import duty obligations in their jurisdiction
 * - Sellers should consult tax professionals about their specific situation
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateTax(_subtotal: number): number {
  // All items are second-hand vintage goods, tax-exempt in most jurisdictions
  return 0;
}

/**
 * Get tax exemption notice for display to customers
 *
 * @param locale - Current locale (for future localization)
 * @returns Tax exemption message
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getTaxExemptionNotice(_locale: string = 'en'): string {
  // Future: Could be localized based on locale
  return 'Tax: $0.00 (Second-hand goods tax-exempt)';
}

/**
 * Get compliance note for order records
 *
 * @returns Compliance note explaining tax exemption
 */
export function getComplianceNote(): string {
  return 'Second-hand goods - Tax exempt under applicable margin scheme or personal property exemption. See tax policy for details.';
}

/**
 * Validate tax calculation (for future use if tax rules change)
 *
 * @param subtotal - Order subtotal
 * @param appliedTax - Tax amount applied
 * @returns Whether tax calculation is correct
 */
export function validateTaxCalculation(subtotal: number, appliedTax: number): boolean {
  const expectedTax = calculateTax(subtotal);
  return appliedTax === expectedTax;
}
