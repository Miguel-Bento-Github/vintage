import { ChangeEvent } from 'react';
import { ProductType, Era, Category } from '@/types';
import { PRODUCT_TYPES, ERAS, CATEGORIES_BY_TYPE } from '@/lib/constants';

interface BasicInfoSectionProps {
  productType: ProductType | '';
  brand: string;
  era: Era | '';
  category: Category | '';
  sizeLabel: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  sectionOrder: string[];
}

/**
 * Basic Information section for product form
 * Handles product type, brand, era, category, and size selection
 */
export default function BasicInfoSection({
  productType,
  brand,
  era,
  category,
  sizeLabel,
  onChange,
  sectionOrder,
}: BasicInfoSectionProps) {
  return (
    <section
      id="basic-info"
      className="bg-white rounded-lg shadow p-4 sm:p-6"
      style={{ order: sectionOrder.indexOf('basic-info') }}
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
        Basic Information
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="productType"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Product Type <span className="text-red-500">*</span>
          </label>
          <select
            id="productType"
            name="productType"
            value={productType}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select product type</option>
            {PRODUCT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="brand"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Brand
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={brand}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Levi's"
            />
          </div>

          <div>
            <label
              htmlFor="era"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Era
            </label>
            <select
              id="era"
              name="era"
              value={era}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select era</option>
              {ERAS.map((era) => (
                <option key={era} value={era}>
                  {era}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!productType}
            >
              <option value="">
                {productType ? 'Select category' : 'Select product type first'}
              </option>
              {productType &&
                CATEGORIES_BY_TYPE[productType].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sizeLabel"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Size Label
            </label>
            <input
              type="text"
              id="sizeLabel"
              name="sizeLabel"
              value={sizeLabel}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., M, 32x34"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
