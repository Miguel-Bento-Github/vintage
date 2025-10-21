'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { convertPrice, formatPrice } from '@/lib/currency';

interface PriceProps {
  /**
   * Price amount in EUR (base currency)
   */
  amount: number;
  /**
   * Optional className for styling
   */
  className?: string;
  /**
   * Whether to show loading state while currency is initializing
   * @default false
   */
  showLoading?: boolean;
}

/**
 * Price component that automatically converts and formats prices
 * based on the user's selected currency.
 *
 * All prices should be provided in EUR (base currency) and will be
 * converted to the user's selected currency automatically.
 *
 * @example
 * <Price amount={29.99} />
 * // With custom styling
 * <Price amount={29.99} className="text-2xl font-bold" />
 */
export default function Price({ amount, className = '', showLoading = false }: PriceProps) {
  const { currency, isLoading } = useCurrency();

  if (showLoading && isLoading) {
    return <span className={className}>...</span>;
  }

  const converted = convertPrice(amount, currency);
  const formatted = formatPrice(amount, currency, converted);

  return <span className={className}>{formatted}</span>;
}
