import { ChangeEvent } from 'react';
import { ProductType } from '@/types';

interface SpecificationsSectionProps {
  productType: ProductType;
  specifications: Record<string, string>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  sectionOrder: string[];
}

const SPECIFICATION_FIELDS: Record<ProductType, string[]> = {
  'Clothing': ['chest', 'waist', 'hips', 'length', 'shoulders', 'sleeves'],
  'Furniture': ['height', 'width', 'depth'],
  'Jewelry': ['material', 'stone', 'size'],
  'Vinyl Records': ['format', 'rpm', 'label', 'year'],
  'Electronics': ['model', 'year', 'condition', 'working'],
  'Books': ['author', 'publisher', 'year', 'isbn'],
  'Art': ['artist', 'medium', 'dimensions', 'year'],
  'Collectibles': ['manufacturer', 'year', 'edition', 'quantity'],
  'Other': [],
};

/**
 * Specifications section for product form
 * Shows relevant specification fields based on product type
 */
export default function SpecificationsSection({
  productType,
  specifications,
  onChange,
  sectionOrder,
}: SpecificationsSectionProps) {
  if (!productType || SPECIFICATION_FIELDS[productType].length === 0) {
    return null;
  }

  return (
    <section
      id="specifications"
      className="bg-white rounded-lg shadow p-4 sm:p-6"
      style={{ order: sectionOrder.indexOf('specifications') }}
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
        Specifications (Optional)
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Add relevant details for this {productType.toLowerCase()} item
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {SPECIFICATION_FIELDS[productType].map((field) => {
          const isMeasurement = ['chest', 'waist', 'hips', 'length', 'shoulders', 'sleeves', 'height', 'width', 'depth', 'dimensions', 'size'].includes(field);

          return (
            <div key={field}>
              <label
                htmlFor={`specifications.${field}`}
                className="block text-sm font-medium text-gray-700 mb-2 capitalize"
              >
                {field}
                {isMeasurement && <span className="text-gray-500 text-xs ml-1">(cm)</span>}
              </label>
              <input
                type="text"
                id={`specifications.${field}`}
                name={`specifications.${field}`}
                value={specifications[field] || ''}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={isMeasurement ? `e.g., 91 (cm)` : `Enter ${field}`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
