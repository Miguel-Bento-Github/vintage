'use client';

import Price from './Price';
import { formatDiscountPercentage } from '@/lib/discount';

interface ProductPriceProps {
  amount: number;
  originalAmount?: number; // Original price if showing discount
  showBadge?: boolean; // Show discount percentage badge
  className?: string;
}

/**
 * Client wrapper for Price component to be used in server components
 * that display product prices with optional discount display
 */
export default function ProductPrice({ amount, originalAmount, showBadge = true, className = '' }: ProductPriceProps) {
  const hasDiscount = originalAmount && originalAmount > amount;

  if (!hasDiscount) {
    return <Price amount={amount} className={className} />;
  }

  // Calculate discount percentage
  const discountText = formatDiscountPercentage(originalAmount, amount);

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Original price with strikethrough */}
      <span className="text-gray-500 line-through text-sm">
        <Price amount={originalAmount} />
      </span>

      {/* Discounted price */}
      <span className="text-red-600 font-bold">
        <Price amount={amount} />
      </span>

      {/* Discount badge */}
      {showBadge && discountText && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {discountText}
        </span>
      )}
    </div>
  );
}
