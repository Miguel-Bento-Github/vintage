'use client';

import Price from './Price';

interface ProductPriceProps {
  amount: number;
  className?: string;
}

/**
 * Client wrapper for Price component to be used in server components
 * that display product prices
 */
export default function ProductPrice({ amount, className }: ProductPriceProps) {
  return <Price amount={amount} className={className} />;
}
