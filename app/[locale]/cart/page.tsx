'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useCartValidation } from '@/hooks/useCartValidation';
import { useLocale } from 'next-intl';
import { useTranslations } from '@/hooks/useTranslations';
import Price from '@/components/Price';

export default function CartPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const { items, removeFromCart, getCartTotal, clearCart } = useCart();
  const { validatedItems, hasUnavailableItems, hasDeletedItems, isValidating } = useCartValidation(items);

  // Use validated items for display
  const displayItems = validatedItems;

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 10) : 0; // Free shipping over €100
  // Tax/VAT calculated by Stripe at checkout based on customer location
  const total = subtotal + shipping;

  // Show loading while validating
  if (isValidating && items.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mb-4"></div>
          <p className="text-gray-600">{t('validatingCart')}</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('emptyCart')}</h1>
          <p className="text-gray-600 mb-8">
            {t('emptyCartDescription')}
          </p>
          <Link
            href={`/${locale}/shop`}
            className="inline-block bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-800 transition-colors"
          >
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('yourCart')}</h1>

        {/* Warning banner for unavailable/deleted items */}
        {(hasUnavailableItems || hasDeletedItems) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {hasDeletedItems
                    ? t('deletedItemsWarning')
                    : t('unavailableItemsWarning')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900">
                  {displayItems.length} {displayItems.length === 1 ? t('item') : t('items')}
                </h2>
                {displayItems.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md font-medium transition-colors"
                    style={{ minHeight: '44px' }}
                  >
                    {t('clearCart')}
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-200">
                {displayItems.map((item) => (
                  <div key={item.productId} className="p-4 sm:p-6">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {item.isDeleted ? (
                          <div className="relative w-24 h-32 bg-gray-100 rounded-lg overflow-hidden opacity-60">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={`${item.brand} ${item.title}`}
                                fill
                                sizes="96px"
                                loading="eager"
                                className="object-cover grayscale"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                {tCommon('noImage')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link href={`/${locale}/product/${item.productId}`}>
                            <div className="relative w-24 h-32 bg-gray-100 rounded-lg overflow-hidden">
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt={`${item.brand} ${item.title}`}
                                  fill
                                  sizes="96px"
                                  loading="eager"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                  {tCommon('noImage')}
                                </div>
                              )}
                            </div>
                          </Link>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        {item.isDeleted ? (
                          <>
                            <p className="text-sm text-gray-500 mb-1">{item.brand}</p>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-through opacity-60">
                              {item.title}
                            </h3>
                          </>
                        ) : (
                          <Link href={`/${locale}/product/${item.productId}`}>
                            <p className="text-sm text-gray-500 mb-1">{item.brand}</p>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-amber-700">
                              {item.title}
                            </h3>
                          </Link>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                            {item.era}
                          </span>
                          <span>{t('size')}: {item.size}</span>
                        </div>

                        {/* Availability warning */}
                        {item.isDeleted && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                            <p className="text-sm text-red-800 font-medium">
                              🗑️ {t('itemDeleted')}
                            </p>
                          </div>
                        )}
                        {!item.inStock && !item.isDeleted && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                            <p className="text-sm text-red-800 font-medium">
                              ⚠️ {t('itemNotAvailable')}
                            </p>
                          </div>
                        )}

                        {/* Price and Remove */}
                        <div className="flex items-center justify-between mt-4">
                          <Price amount={item.price} className="text-xl font-bold text-gray-900" />
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md font-medium transition-colors"
                            style={{ minHeight: '44px', minWidth: '80px' }}
                          >
                            {t('remove')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                href={`/${locale}/shop`}
                className="text-amber-700 hover:text-amber-800 font-medium flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {t('continueShopping')}
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('orderSummary')}</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>{t('subtotal')}</span>
                  <Price amount={subtotal} className="font-medium" />
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{t('shipping')}</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">{t('free')}</span>
                    ) : (
                      <Price amount={shipping} />
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-500">
                    {t('freeShippingNote')}
                  </p>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>{t('tax')}</span>
                  <span className="font-medium text-sm">{t('calculatedAtCheckout')}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">{t('totalBeforeTax')}</span>
                  <Price amount={total} className="text-2xl font-bold text-gray-900" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('taxCalculationNote')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/${locale}/checkout`)}
                disabled={hasUnavailableItems}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  hasUnavailableItems
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-700 text-white hover:bg-amber-800'
                }`}
              >
                {t('proceedToCheckout')}
              </button>

              {hasUnavailableItems && (
                <p className="text-sm text-red-600 mt-3 text-center">
                  {t('removeUnavailableItems')}
                </p>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">{t('weAccept')}</h3>
                <div className="flex gap-2">
                  <div className="px-3 py-2 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    Visa
                  </div>
                  <div className="px-3 py-2 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    Mastercard
                  </div>
                  <div className="px-3 py-2 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    Amex
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">{t('secureCheckout')}</p>
                    <p>{t('secureCheckoutDescription')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
