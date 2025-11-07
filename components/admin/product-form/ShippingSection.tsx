import { ChangeEvent } from 'react';

interface ShippingSectionProps {
  weightGrams: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  freeShipping: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  sectionOrder: string[];
}

/**
 * Shipping Information section for product form
 * Handles weight and package dimensions
 */
export default function ShippingSection({
  weightGrams,
  lengthCm,
  widthCm,
  heightCm,
  freeShipping,
  onChange,
  sectionOrder,
}: ShippingSectionProps) {
  return (
    <section
      id="shipping"
      className="bg-white rounded-lg shadow p-4 sm:p-6"
      style={{ order: sectionOrder.indexOf('shipping') }}
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
        Shipping Information
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Add weight and dimensions for accurate shipping cost calculation. Weight is especially important.
      </p>

      {/* Free Shipping Checkbox */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="freeShipping"
            name="freeShipping"
            checked={freeShipping}
            onChange={onChange}
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <span className="ml-3 text-sm font-semibold text-gray-900">
            🎁 Free Shipping
          </span>
        </label>
        <p className="mt-2 ml-8 text-xs text-gray-600">
          Check this box to offer free shipping for this product. Customers will not be charged for shipping.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="weightGrams"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Weight (grams) <span className="text-amber-600">*recommended</span>
            </label>
            <input
              type="number"
              step="1"
              id="weightGrams"
              name="weightGrams"
              value={weightGrams}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Used for shipping cost calculation. Defaults to 500g if not specified.
            </p>
          </div>

          <div>
            <label
              htmlFor="lengthCm"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Length (cm)
            </label>
            <input
              type="number"
              step="0.1"
              id="lengthCm"
              name="lengthCm"
              value={lengthCm}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 30"
            />
          </div>

          <div>
            <label
              htmlFor="widthCm"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Width (cm)
            </label>
            <input
              type="number"
              step="0.1"
              id="widthCm"
              name="widthCm"
              value={widthCm}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 25"
            />
          </div>

          <div>
            <label
              htmlFor="heightCm"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Height (cm)
            </label>
            <input
              type="number"
              step="0.1"
              id="heightCm"
              name="heightCm"
              value={heightCm}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 5"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
