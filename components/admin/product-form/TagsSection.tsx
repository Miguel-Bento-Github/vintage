import { ChangeEvent } from 'react';

interface TagsSectionProps {
  tags: string;
  featured: boolean;
  inStock: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  sectionOrder: string[];
}

/**
 * Tags & Options section for product form
 * Handles tags input and feature/stock checkboxes
 */
export default function TagsSection({
  tags,
  featured,
  inStock,
  onChange,
  sectionOrder,
}: TagsSectionProps) {
  return (
    <section
      id="tags"
      className="bg-white rounded-lg shadow p-4 sm:p-6"
      style={{ order: sectionOrder.indexOf('tags') }}
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
        Tags & Options
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={tags}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="vintage, denim, americana, workwear"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={featured}
              onChange={onChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="featured"
              className="ml-2 block text-sm text-gray-700"
            >
              Feature this product on homepage
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="inStock"
              name="inStock"
              checked={inStock}
              onChange={onChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="inStock"
              className="ml-2 block text-sm text-gray-700"
            >
              Product is in stock
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
