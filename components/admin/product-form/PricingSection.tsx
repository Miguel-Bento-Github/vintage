import { ChangeEvent } from 'react';
import { Condition } from '@/types';
import { CONDITIONS } from '@/lib/constants';

interface PricingSectionProps {
  condition: Condition | '';
  price: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  sectionOrder: string[];
}

/**
 * Pricing section for product form
 * Handles condition and price inputs
 */
export default function PricingSection({
  condition,
  price,
  onChange,
  sectionOrder,
}: PricingSectionProps) {
  return (
    <section
      id="pricing"
      className="bg-white rounded-lg shadow p-4 sm:p-6"
      style={{ order: sectionOrder.indexOf('pricing') }}
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
        Condition & Pricing
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="condition"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              id="condition"
              name="condition"
              value={condition}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select condition</option>
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Price (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              id="price"
              name="price"
              value={price}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="99.99"
              required
            />
          </div>
        </div>
      </div>
    </section>
  );
}
