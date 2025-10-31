import { Product, SerializedProduct } from '@/types';

/**
 * Check if a product's discount is currently active
 */
export function isDiscountActive(product: Product | SerializedProduct): boolean {
  // Must have a discount price
  if (!product.discountPrice || product.discountPrice >= product.price) {
    return false;
  }

  const now = new Date();

  // Check start date
  if (product.discountStartDate) {
    const startDate = typeof product.discountStartDate === 'string'
      ? new Date(product.discountStartDate)
      : product.discountStartDate.toDate();

    if (now < startDate) {
      return false; // Discount hasn't started yet
    }
  }

  // Check end date
  if (product.discountEndDate) {
    const endDate = typeof product.discountEndDate === 'string'
      ? new Date(product.discountEndDate)
      : product.discountEndDate.toDate();

    if (now > endDate) {
      return false; // Discount has expired
    }
  }

  return true;
}

/**
 * Get the effective price for a product (discounted if active, otherwise regular)
 */
export function getEffectivePrice(product: Product | SerializedProduct): number {
  if (isDiscountActive(product) && product.discountPrice) {
    return product.discountPrice;
  }
  return product.price;
}

/**
 * Calculate the discount percentage
 */
export function getDiscountPercentage(originalPrice: number, discountPrice: number): number {
  if (discountPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

/**
 * Format discount percentage for display (e.g., "-20%")
 */
export function formatDiscountPercentage(originalPrice: number, discountPrice: number): string {
  const percentage = getDiscountPercentage(originalPrice, discountPrice);
  return percentage > 0 ? `-${percentage}%` : '';
}
