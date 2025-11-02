import { ChangeEvent } from 'react';

interface DiscountSectionProps {
  discountPrice: string;
  discountStartDate: string;
  discountEndDate: string;
  regularPrice: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  sectionOrder: string[];
}

/**
 * Discount Pricing section for product form
 * Handles discount price and date range with preview
 */
export default function DiscountSection({
  discountPrice,
  discountStartDate,
  discountEndDate,
  regularPrice,
  onChange,
  sectionOrder,
}: DiscountSectionProps) {
  return (
    <section
      id="discount"
      className="bg-white rounded-lg shadow p-4 sm:p-6"
      style={{ order: sectionOrder.indexOf('discount') }}
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
        Discount Pricing (Optional)
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Set a discounted price with optional start and end dates for sales or promotions.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="discountPrice"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Discount Price (€)
            </label>
            <input
              type="number"
              step="0.01"
              id="discountPrice"
              name="discountPrice"
              value={discountPrice}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 79.99"
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be lower than regular price (€{regularPrice || '0.00'})
            </p>
          </div>

          <div>
            <label
              htmlFor="discountStartDate"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Start Date
            </label>
            <input
              type="datetime-local"
              id="discountStartDate"
              name="discountStartDate"
              value={discountStartDate}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              When discount becomes active
            </p>
          </div>

          <div>
            <label
              htmlFor="discountEndDate"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              End Date
            </label>
            <input
              type="datetime-local"
              id="discountEndDate"
              name="discountEndDate"
              value={discountEndDate}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              When discount expires
            </p>
          </div>
        </div>

        {/* Discount Preview */}
        {discountPrice && parseFloat(discountPrice) > 0 && parseFloat(discountPrice) < parseFloat(regularPrice || '0') && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm font-medium text-green-900">
              Discount Preview:
              <span className="ml-2 line-through text-gray-500">€{parseFloat(regularPrice || '0').toFixed(2)}</span>
              <span className="ml-2 text-green-700 font-bold">€{parseFloat(discountPrice).toFixed(2)}</span>
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                -{Math.round(((parseFloat(regularPrice || '0') - parseFloat(discountPrice)) / parseFloat(regularPrice || '1')) * 100)}%
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
