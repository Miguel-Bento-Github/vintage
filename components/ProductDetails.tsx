import { ProductType, Era, Category, Condition } from '@/types';
import PreviewPrice from './PreviewPrice';
import { isDiscountActive, getEffectivePrice } from '@/lib/discount';
import { Timestamp } from 'firebase/firestore';

interface ProductDetailsProps {
  product: {
    productType: ProductType;
    title: string;
    description: string;
    brand: string;
    era: Era;
    category: Category;
    sizeLabel?: string;
    specifications?: Record<string, string | number>;
    condition: Condition;
    conditionNotes?: string;
    price: number;
    discountPrice?: number;
    discountStartDate?: Timestamp;
    discountEndDate?: Timestamp;
    tags?: string[];
    featured?: boolean;
    inStock?: boolean;
  };
  /** If true, shows preview badges (featured, in stock, product type) */
  showBadges?: boolean;
  /** Custom class for the container */
  className?: string;
}

/**
 * Shared product details display component
 * Used in both the product page and admin preview modal
 */
export default function ProductDetails({
  product,
  showBadges = false,
  className = ''
}: ProductDetailsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Badges */}
      {showBadges && (
        <div className="flex flex-wrap gap-2">
          {product.featured && (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
              Featured
            </span>
          )}
          {product.inStock !== undefined && (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              product.inStock
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {product.inStock ? 'In Stock' : 'Sold'}
            </span>
          )}
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            {product.productType}
          </span>
        </div>
      )}

      {/* Brand */}
      <p className="text-sm text-gray-500 font-medium">
        {product.brand}
      </p>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900">
        {product.title || 'Product Title'}
      </h1>

      {/* Price and Era */}
      <div className="flex flex-wrap items-center gap-3">
        <PreviewPrice
          amount={getEffectivePrice(product)}
          originalAmount={
            isDiscountActive(product) ? product.price : undefined
          }
          className="text-2xl sm:text-3xl font-bold"
        />
        <span className="px-4 py-1 bg-amber-700 text-white text-sm font-semibold rounded-full">
          {product.era}
        </span>
        {!product.inStock && (
          <span className="px-4 py-1 bg-gray-900 text-white text-sm font-semibold rounded-full">
            Sold
          </span>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
        <div
          className="text-gray-700 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: product.description || '<p>No description provided</p>',
          }}
        />
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
        <div>
          <p className="text-sm text-gray-500">Era</p>
          <p className="text-base font-medium text-gray-900">{product.era || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Category</p>
          <p className="text-base font-medium text-gray-900">{product.category || 'N/A'}</p>
        </div>
        {product.sizeLabel && (
          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className="text-base font-medium text-gray-900">{product.sizeLabel}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500">Condition</p>
          <p className="text-base font-medium text-gray-900">{product.condition || 'N/A'}</p>
        </div>
      </div>

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500 capitalize">{key}</p>
                <p className="text-base font-medium text-gray-900">
                  {typeof value === 'number' ? `${value} cm` : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Condition Notes */}
      {product.conditionNotes && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Condition Notes</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-gray-700 text-sm whitespace-pre-line">
              {product.conditionNotes}
            </p>
          </div>
        </div>
      )}

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
