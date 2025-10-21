'use client';

import Image from 'next/image';
import { CartItem } from '@/types';
import { CheckoutFormData } from '@/types/checkout';
import { useTranslations } from '@/hooks/useTranslations';
import Price from '@/components/Price';

interface OrderReviewProps {
  items: CartItem[];
  formData: CheckoutFormData;
  subtotal: number;
  shipping: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
}

export default function OrderReview({
  items,
  formData,
  subtotal,
  shipping,
  total,
  onNext,
  onBack,
}: OrderReviewProps) {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const tCommon = useTranslations('common');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('reviewOrder')}</h2>
        <p className="text-gray-600">{t('reviewOrderDescription')}</p>
      </div>

      {/* Order Items */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{t('orderItems')}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4">
              <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded">
                <Image
                  src={item.imageUrl}
                  alt={`${item.brand} ${item.title}`}
                  fill
                  sizes="80px"
                  loading="eager"
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {item.brand} - {item.title}
                </h4>
                <p className="text-sm text-gray-600">{tCart('size')}: {item.size}</p>
                <p className="text-sm text-gray-600">{item.era}</p>
              </div>
              <div className="text-right">
                <Price amount={item.price} className="font-semibold text-gray-900" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{t('shippingAddress')}</h3>
        </div>
        <div className="p-4">
          <p className="text-gray-900 font-medium">{formData.name}</p>
          <p className="text-gray-600">{formData.email}</p>
          <p className="text-gray-600 mt-2">{formData.street}</p>
          <p className="text-gray-600">
            {formData.city}, {formData.state} {formData.postalCode}
          </p>
          <p className="text-gray-600">{formData.country}</p>
        </div>
      </div>

      {/* Order Totals */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{t('orderSummary')}</h3>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>{tCart('subtotal')}</span>
            <Price amount={subtotal} />
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{tCart('shipping')}</span>
            <span>{shipping === 0 ? tCart('free') : <Price amount={shipping} />}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{tCart('tax')}</span>
            <span className="text-sm">{tCart('calculatedAtCheckout')}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>{tCart('totalBeforeTax')}</span>
              <Price amount={total} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {tCart('taxCalculationNote')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          {tCommon('back')}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 px-6 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition font-medium"
        >
          {t('continueToPayment')}
        </button>
      </div>
    </div>
  );
}
