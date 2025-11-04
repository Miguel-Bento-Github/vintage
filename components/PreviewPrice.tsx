interface PreviewPriceProps {
  amount: number;
  originalAmount?: number; // Original price if showing discount
  className?: string;
}

/**
 * Simple price display for admin preview (no currency conversion needed)
 * Matches ProductPrice styling but works without CurrencyProvider
 */
export default function PreviewPrice({ amount, originalAmount, className = '' }: PreviewPriceProps) {
  const hasDiscount = originalAmount && originalAmount > amount;

  if (!hasDiscount) {
    return <span className={className}>€{amount.toFixed(2)}</span>;
  }

  // Calculate discount percentage
  const discountPercentage = Math.round(((originalAmount - amount) / originalAmount) * 100);

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Original price with strikethrough */}
      <span className="text-gray-500 line-through text-lg">
        €{originalAmount.toFixed(2)}
      </span>

      {/* Discounted price */}
      <span className="text-red-600 font-bold text-3xl">
        €{amount.toFixed(2)}
      </span>

      {/* Discount badge */}
      {discountPercentage > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          -{discountPercentage}%
        </span>
      )}
    </div>
  );
}
