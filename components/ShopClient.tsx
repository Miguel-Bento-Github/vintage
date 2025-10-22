'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types';
import { ERAS, CATEGORIES, CONDITIONS } from '@/lib/constants';
import { useLocale } from 'next-intl';
import { useTranslations } from '@/hooks/useTranslations';
import Price from '@/components/Price';

type SortOption = 'newest' | 'price-asc' | 'price-desc';
type PriceRange = 'under-50' | '50-100' | '100-200' | '200-plus';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'] as const;

const PRICE_RANGES: { value: PriceRange; labelKey: string; min: number; max: number }[] = [
  { value: 'under-50', labelKey: 'priceRanges.under50', min: 0, max: 50 },
  { value: '50-100', labelKey: 'priceRanges.50to100', min: 50, max: 100 },
  { value: '100-200', labelKey: 'priceRanges.100to200', min: 100, max: 200 },
  { value: '200-plus', labelKey: 'priceRanges.200plus', min: 200, max: Infinity },
];

interface ShopClientProps {
  initialProducts: Product[];
}

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const locale = useLocale();
  const t = useTranslations('shop');
  const tCommon = useTranslations('common');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    era: true,
    category: true,
    price: false,
    size: false,
    condition: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleEra = (era: string) => {
    setSelectedEras((prev) =>
      prev.includes(era) ? prev.filter((e) => e !== era) : [...prev, era]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const togglePriceRange = (range: PriceRange) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedEras([]);
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedSizes([]);
    setSelectedConditions([]);
    setInStockOnly(false);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...initialProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      );
    }

    if (selectedEras.length > 0) {
      filtered = filtered.filter((p) => selectedEras.includes(p.era));
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter((p) => {
        return selectedPriceRanges.some((rangeValue) => {
          const range = PRICE_RANGES.find((r) => r.value === rangeValue);
          if (!range) return false;
          return p.price >= range.min && p.price < range.max;
        });
      });
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) => selectedSizes.includes(p.size.label));
    }

    if (selectedConditions.length > 0) {
      filtered = filtered.filter((p) => selectedConditions.includes(p.condition));
    }

    if (inStockOnly) {
      filtered = filtered.filter((p) => p.inStock === true);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
        default:
          return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
    });

    return filtered;
  }, [
    initialProducts,
    searchQuery,
    selectedEras,
    selectedCategories,
    selectedPriceRanges,
    selectedSizes,
    selectedConditions,
    inStockOnly,
    sortBy,
  ]);

  const activeFilterCount =
    selectedEras.length +
    selectedCategories.length +
    selectedPriceRanges.length +
    selectedSizes.length +
    selectedConditions.length +
    (inStockOnly ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-900">{t('filters')}</h3>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-amber-700 hover:text-amber-800"
            >
              {t('clearAll')} ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 text-amber-700 border-gray-300 rounded focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-gray-900">{t('inStockOnly')}</span>
        </label>
      </div>

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection('era')}
          className="flex items-center justify-between w-full mb-3 text-gray-900"
        >
          <h4 className="font-medium">{t('era')}</h4>
          <svg
            className={`w-5 h-5 transition-transform ${expandedSections.era ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.era && (
          <div className="space-y-2">
            {ERAS.map((era) => (
              <label key={era} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEras.includes(era)}
                  onChange={() => toggleEra(era)}
                  className="w-4 h-4 text-amber-700 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">{era}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full mb-3 text-gray-900"
        >
          <h4 className="font-medium">{t('category')}</h4>
          <svg
            className={`w-5 h-5 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.category && (
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="w-4 h-4 text-amber-700 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3 text-gray-900"
        >
          <h4 className="font-medium">{t('priceRange')}</h4>
          <svg
            className={`w-5 h-5 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.price && (
          <div className="space-y-2">
            {PRICE_RANGES.map((range) => (
              <label key={range.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPriceRanges.includes(range.value)}
                  onChange={() => togglePriceRange(range.value)}
                  className="w-4 h-4 text-amber-700 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">{t(range.labelKey)}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection('size')}
          className="flex items-center justify-between w-full mb-3 text-gray-900"
        >
          <h4 className="font-medium">{t('size')}</h4>
          <svg
            className={`w-5 h-5 transition-transform ${expandedSections.size ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.size && (
          <div className="space-y-2">
            {SIZES.map((size) => (
              <label key={size} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleSize(size)}
                  className="w-4 h-4 text-amber-700 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">{size}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => toggleSection('condition')}
          className="flex items-center justify-between w-full mb-3 text-gray-900"
        >
          <h4 className="font-medium">{t('condition')}</h4>
          <svg
            className={`w-5 h-5 transition-transform ${expandedSections.condition ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.condition && (
          <div className="space-y-2">
            {CONDITIONS.map((condition) => (
              <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(condition)}
                  onChange={() => toggleCondition(condition)}
                  className="w-4 h-4 text-amber-700 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">{condition}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('shopVintage')}</h1>
          <p className="text-gray-600">
            {t('browseCollection')}
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('searchProducts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
              style={{ minHeight: '44px' }}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort products"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-base"
              style={{ minHeight: '44px' }}
            >
              <option value="newest">{t('newest')}</option>
              <option value="price-asc">{t('priceLowToHigh')}</option>
              <option value="price-desc">{t('priceHighToLow')}</option>
            </select>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium whitespace-nowrap"
              style={{ minHeight: '44px' }}
            >
              {t('filters')} {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <FiltersContent />
            </div>
          </aside>

          {showFilters && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowFilters(false)}>
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">{t('filters')}</h2>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      aria-label="Close filters"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <FiltersContent />
                  <div className="mt-6 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="w-full px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-semibold"
                    >
                      {t('showProducts', { count: filteredAndSortedProducts.length })}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <main className="flex-1">
            <div className="mb-4 text-sm text-gray-600">
              {filteredAndSortedProducts.length === 1
                ? t('productsFound', { count: filteredAndSortedProducts.length })
                : t('productsFoundPlural', { count: filteredAndSortedProducts.length })}
            </div>

            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/${locale}/product/${product.id}`}
                    className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {!product.inStock ? (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">{tCommon('sold')}</span>
                        </div>
                      ) : product.images && product.images.length > 0 && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={`${product.brand} ${product.title} - ${product.era} vintage ${product.category}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">{tCommon('noImage')}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-3 py-1 bg-amber-700 text-white text-xs font-semibold rounded-full">
                          {product.era}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        {product.brand}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <Price amount={product.price} className="text-xl font-bold text-gray-900" />
                        <p className="text-sm text-gray-500">{product.size.label}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg mb-4">{t('noProductsFound')}</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-amber-700 hover:text-amber-800 font-semibold"
                >
                  {t('clearAllFilters')}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
