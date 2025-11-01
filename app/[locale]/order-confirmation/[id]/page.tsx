'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useCart } from '@/hooks/useCart';
import { useTranslations } from '@/hooks/useTranslations';
import Price from '@/components/Price';

interface OrderDetails {
  id: string;
  orderNumber: string;
  customerInfo: {
    email: string;
    name: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  items: Array<{
    productId: string;
    title: string;
    brand: string;
    era: string;
    size: string;
    price: number;
    imageUrl: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('confirmation');
  const { clearCart } = useCart();
  const [hasCleared, setHasCleared] = useState(false);

  const orderId = params.id as string;
  const paymentIntentId = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  // Use TanStack Query to fetch or create order
  const { data: order, isLoading, error: queryError } = useQuery<OrderDetails>({
    queryKey: ['order-confirmation', orderId, paymentIntentId],
    queryFn: async () => {
      // If we're on the processing page with a payment intent, we might need to create the order
      if (orderId === 'processing' && paymentIntentId && redirectStatus === 'succeeded') {
          // First, try to fetch existing order
          const response = await fetch(`/api/orders/${paymentIntentId}`);

          if (response.ok) {
            // Order already exists
            const data = await response.json();
            return data.order;
          } else {
            throw new Error('Order not found. Please contact support with your payment confirmation.');
          }
      } else {
        // Regular order fetch by ID
        const fetchId = orderId === 'processing' && paymentIntentId ? paymentIntentId : orderId;
        const response = await fetch(`/api/orders/${fetchId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        return data.order;
      }
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes - order details don't change frequently
    retry: 1,
  });

  // Clear cart when order is successfully loaded (only once)
  useEffect(() => {
    if (order && !hasCleared) {
      clearCart();
      setHasCleared(true);
    }
  }, [order, hasCleared, clearCart]);

  const error = queryError ? String(queryError) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loadingOrder')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">{t('orderNotFound')}</h2>
            <p className="text-red-700 mb-4">{error || t('unableToFindOrder')}</p>
            <Link
              href={`/${locale}/shop`}
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-green-900">{t('orderConfirmed')}</h1>
              <p className="mt-1 text-green-800">
                {t('thankYouMessage')}
              </p>
              <p className="mt-2 text-sm text-green-700">
                {t('orderNumber')}: <span className="font-semibold">{order.orderNumber}</span>
              </p>
              <p className="mt-1 text-sm text-green-700">
                {t('confirmationEmailSent')}{' '}
                <span className="font-semibold">{order.customerInfo.email}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">{t('orderItems')}</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex gap-4 p-6">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">
                        {item.brand} - {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{t('size')}: {item.size}</p>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('shippingAddress')}</h2>
              <div className="text-gray-700">
                <p className="font-medium">{order.customerInfo.name}</p>
                <p className="mt-1">{order.customerInfo.shippingAddress.street}</p>
                <p>
                  {order.customerInfo.shippingAddress.city},{' '}
                  {order.customerInfo.shippingAddress.state}{' '}
                  {order.customerInfo.shippingAddress.postalCode}
                </p>
                <p>{order.customerInfo.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('orderSummary')}</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>{t('subtotal')}</span>
                  <Price amount={order.subtotal} />
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{t('shipping')}</span>
                  <span>{order.shipping === 0 ? t('free') : <Price amount={order.shipping} />}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{t('taxExempt')}</span>
                  <Price amount={order.tax} />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">{t('total')}</span>
                  <Price amount={order.total} className="text-2xl font-bold text-gray-900" />
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/${locale}/shop`}
                  className="block w-full text-center px-6 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition font-medium"
                >
                  {t('continueShopping')}
                </Link>
                <Link
                  href={`/${locale}`}
                  className="block w-full text-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  {t('backToHome')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Delivery Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">{t('whatHappensNext')}</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {t('nextStep1')}
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {t('nextStep2')}
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {t('nextStep3')}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
