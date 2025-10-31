import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import ProductPrice from './ProductPrice';
import Price from './Price';
import { useTranslations } from '@/hooks/useTranslations';
import { isDiscountActive, getEffectivePrice, formatDiscountPercentage } from '@/lib/discount';

interface VintageProductCardProps {
  product: {
    id: string;
    title: string;
    brand: string;
    era: string;
    category: string;
    price: number;
    images: string[];
    inStock?: boolean;
    size?: { label: string } | string;
    discountPrice?: number;
    discountStartDate?: string;
    discountEndDate?: string;
  };
  showDiscount?: boolean;
  showSize?: boolean;
}

export default function VintageProductCard({ product, showDiscount = false, showSize = false }: VintageProductCardProps) {
  const locale = useLocale();
  const tCommon = useTranslations('common');

  return (
    <Link
      href={`/${locale}/product/${product.id}`}
      className="group block bg-white p-4 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12),0_12px_32px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1"
    >
      {/* Photo */}
      <div className="relative aspect-[3/4] bg-gray-100 mb-4 border border-gray-200 rounded">
        {product.inStock === false ? (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center rounded">
            <span className="text-white text-2xl font-bold">{tCommon('sold')}</span>
          </div>
        ) : product.images && product.images.length > 0 && product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={`${product.brand} ${product.title} - ${product.era} vintage ${product.category}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
            className="object-cover rounded"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-400 text-sm">{tCommon('noImage')}</span>
          </div>
        )}
      </div>
      {/* Caption area like Polaroid */}
      <div className="pt-2 pb-1">
        <p className="text-xs text-amber-700 font-semibold mb-1 uppercase tracking-wide">
          {product.era}
        </p>
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>
        {showDiscount && isDiscountActive(product) ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 line-through text-sm">
              <Price amount={product.price} />
            </span>
            <Price amount={getEffectivePrice(product)} className="text-lg font-bold text-red-600" />
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {formatDiscountPercentage(product.price, getEffectivePrice(product))}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <ProductPrice
              amount={product.price}
              className="text-lg font-bold text-gray-900"
            />
            {showSize && product.size && (
              <p className="text-sm text-gray-500">
                {typeof product.size === 'string' ? product.size : product.size.label}
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
