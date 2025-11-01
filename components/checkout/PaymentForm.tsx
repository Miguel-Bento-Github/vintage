import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CartItem, CustomerInfo, OrderItem } from '@/types';
import { CheckoutFormData } from '@/types/checkout';
import { useTranslations } from '@/hooks/useTranslations';
import { trackPurchase } from '@/services/analyticsService';

interface PaymentFormProps {
  items: CartItem[];
  formData: CheckoutFormData;
  subtotal: number;
  shipping: number;
  total: number;
  onBack: () => void;
}

export default function PaymentForm({
  items,
  formData,
  subtotal,
  shipping,
  total,
  onBack,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage(t('stripeNotLoaded'));
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Submit payment to Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || t('paymentSubmitError'));
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/${locale}/order-confirmation/processing`,
          payment_method_data: {
            billing_details: {
              email: formData.email,
              name: formData.name,
              address: {
                line1: formData.street,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postalCode,
                country: formData.country,
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || t('paymentFailed'));
        setIsProcessing(false);
        return;
      }

      // Payment succeeded
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order in Firebase
        const orderItems: OrderItem[] = items.map((item: CartItem) => ({
          productId: item.productId,
          title: item.title,
          brand: item.brand,
          era: item.era,
          size: item.size,
          price: item.price,
          imageUrl: item.imageUrl,
        }));

        const customerInfo: CustomerInfo = {
          email: formData.email,
          name: formData.name,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
        };

        // Call API to create order
        // Note: Actual total with tax is in paymentIntent.amount
        const finalTotal = paymentIntent.amount / 100; // Convert from cents

        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            customerInfo,
            items: orderItems,
            subtotal,
            shipping,
            tax: 0, // Tax calculated by Stripe
            total: finalTotal, // Use actual charged amount from Stripe
            // Note: locale is auto-detected server-side from referer URL
          }),
        });

        if (!response.ok) {
          console.error('Failed to create order in database');
          // Payment succeeded but order creation failed
          // Still redirect to success page with payment intent ID
        }

        const { orderId, orderNumber } = await response.json();

        // Track purchase analytics
        trackPurchase(
          orderId || paymentIntent.id,
          orderNumber || orderId || paymentIntent.id,
          finalTotal,
          orderItems
        );

        // Navigate to order confirmation - cart will be cleared there
        router.push(`/${locale}/order-confirmation/${orderId || paymentIntent.id}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage(t('unexpectedError'));
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('payment')}</h2>
        <p className="text-gray-600">{t('completePaymentSecurely')}</p>
      </div>

      {/* Order Summary (Compact) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">{t('totalAmount')}</span>
          <span className="text-2xl font-bold text-gray-900">€{total.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {items.length !== 1 ? t('itemsNotePlural', { count: items.length }) : t('itemsNote', { count: items.length })}
        </p>
      </div>

      {/* Stripe Payment Element */}
      <div className="border border-gray-200 rounded-lg p-6">
        <PaymentElement />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {tCommon('back')}
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-6 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? t('processing') : t('completePayment')}
        </button>
      </div>

      {/* Security Notice */}
      <p className="text-xs text-gray-500 text-center">
        {t('securityNotice')}
      </p>
    </form>
  );
}
