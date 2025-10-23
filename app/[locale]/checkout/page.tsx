'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from '@/hooks/useCurrency';
import { CheckoutFormData, CheckoutStep, CheckoutFormErrors } from '@/types/checkout';
import { validateCustomerInfo, calculateCheckoutTotals } from '@/lib/checkoutValidation';
import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import OrderReview from '@/components/checkout/OrderReview';
import PaymentForm from '@/components/checkout/PaymentForm';
import { useLocale } from 'next-intl';
import { useTranslations } from '@/hooks/useTranslations';

export default function CheckoutPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('checkout');
  const { items, getCartTotal } = useCart();
  const { currency } = useCurrency();

  const [step, setStep] = useState<CheckoutStep>(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [formErrors, setFormErrors] = useState<CheckoutFormErrors>({});

  // Calculate totals dynamically based on selected country (tax is $0.00 for second-hand goods)
  const { subtotal, shipping, total } = calculateCheckoutTotals(getCartTotal(), formData.country || undefined);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/cart`);
    }
  }, [items, router, locale]);

  // Create payment intent on mount
  useEffect(() => {
    if (items.length === 0) return;

    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, currency }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setError(null);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize checkout. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [items, currency]);

  // Handle step navigation
  const handleNextStep = () => {
    if (step === 1) {
      const errors = validateCustomerInfo(formData);
      setFormErrors(errors);
      if (Object.keys(errors).length === 0) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep((step - 1) as CheckoutStep);
    } else {
      router.push(`/${locale}/cart`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loadingCheckout')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">{t('checkoutError')}</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/cart`)}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              {t('returnToCart')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main checkout with Stripe Elements
  const stripePromise = getStripe();

  if (!clientSecret || !stripePromise) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('checkout')}</h1>
          <p className="mt-2 text-gray-600">{t('checkoutDescription')}</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <CheckoutProgress currentStep={step} />

          <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
            {step === 1 && (
              <CustomerInfoForm
                formData={formData}
                formErrors={formErrors}
                onFormDataChange={setFormData}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
              />
            )}

            {step === 2 && (
              <OrderReview
                items={items}
                formData={formData}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
              />
            )}

            {step === 3 && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#92400e',
                      colorBackground: '#ffffff',
                      colorText: '#1f2937',
                      colorDanger: '#dc2626',
                      fontFamily: 'system-ui, sans-serif',
                      borderRadius: '0.375rem',
                    },
                  },
                }}
              >
                <PaymentForm
                  items={items}
                  formData={formData}
                  subtotal={subtotal}
                  shipping={shipping}
                  total={total}
                  onBack={handlePreviousStep}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
