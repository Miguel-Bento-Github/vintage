/**
 * Measurement conversion utilities
 * All measurements are stored in centimeters in the database
 */

/**
 * Convert centimeters to inches
 */
export function cmToInches(cm: number): number {
  return cm / 2.54;
}

/**
 * Convert inches to centimeters
 */
export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

/**
 * Format measurement value based on locale
 * @param value - The measurement value in centimeters
 * @param locale - The user's locale (e.g., 'en-US', 'nl', 'es')
 * @param decimals - Number of decimal places to show (default: 1)
 * @returns Formatted measurement string with unit
 */
export function formatMeasurement(
  value: number,
  locale: string,
  decimals: number = 1
): string {
  // US users see inches, everyone else sees centimeters
  if (locale === 'en-US' || locale === 'en') {
    const inches = cmToInches(value);
    return `${inches.toFixed(decimals)}"`;
  }

  return `${value.toFixed(decimals)} cm`;
}

/**
 * Check if a specification key represents a measurement that should be converted
 * (e.g., chest, waist, length, width, height, etc.)
 */
export function isMeasurementField(key: string): boolean {
  const measurementFields = [
    // Clothing measurements
    'chest',
    'waist',
    'hips',
    'length',
    'shoulders',
    'sleeves',
    'inseam',
    // Furniture/general dimensions
    'height',
    'width',
    'depth',
    'diameter',
    // Jewelry/small items
    'size', // could be numeric like ring size in mm
  ];

  return measurementFields.includes(key.toLowerCase());
}
