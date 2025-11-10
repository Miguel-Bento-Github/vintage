'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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
import VintageButton from '@/components/VintageButton';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('checkout');
  const { items, getCartTotal } = useCart();
  const { currency } = useCurrency();

  const [step, setStep] = useState<CheckoutStep>(1);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Restore form data and step from URL on mount
  useEffect(() => {
    if (isInitialized) return;

    const urlStep = searchParams.get('step');
    const urlEmail = searchParams.get('email');
    const urlName = searchParams.get('name');
    const urlStreet = searchParams.get('street');
    const urlCity = searchParams.get('city');
    const urlState = searchParams.get('state');
    const urlPostalCode = searchParams.get('postalCode');
    const urlCountry = searchParams.get('country');

    // Restore step if valid
    if (urlStep && (urlStep === '1' || urlStep === '2')) {
      setStep(parseInt(urlStep) as CheckoutStep);
    }

    // Restore form data if present in URL
    if (urlEmail || urlName || urlStreet || urlCity || urlState || urlPostalCode || urlCountry) {
      setFormData({
        email: urlEmail || '',
        name: urlName || '',
        street: urlStreet || '',
        city: urlCity || '',
        state: urlState || '',
        postalCode: urlPostalCode || '',
        country: urlCountry || '',
      });
    }

    setIsInitialized(true);
  }, [searchParams, isInitialized]);

  // Update URL whenever form data or step changes
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();
    params.set('step', step.toString());

    // Add form data to URL if not empty
    if (formData.email) params.set('email', formData.email);
    if (formData.name) params.set('name', formData.name);
    if (formData.street) params.set('street', formData.street);
    if (formData.city) params.set('city', formData.city);
    if (formData.state) params.set('state', formData.state);
    if (formData.postalCode) params.set('postalCode', formData.postalCode);
    if (formData.country) params.set('country', formData.country);

    // Update URL without navigation
    router.replace(`/${locale}/checkout?${params.toString()}`, { scroll: false });
  }, [formData, step, locale, router, isInitialized]);

  // Calculate totals dynamically based on selected country (tax is $0.00 for second-hand goods)
  const { subtotal, shipping, total } = calculateCheckoutTotals(getCartTotal(), formData.country || undefined, items);

  // Redirect if cart is empty (but only after initialization to avoid flickering)
  useEffect(() => {
    if (isInitialized && items.length === 0) {
      router.push(`/${locale}/cart`);
    }
  }, [items, router, locale, isInitialized]);

  // Use TanStack Query to create payment intent
  // Include formData.country in the query key so it refetches when country changes
  const { data: paymentIntentData, isLoading, error: queryError } = useQuery({
    queryKey: ['payment-intent', items, currency, formData.country],
    queryFn: async () => {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          currency,
          shippingCountry: formData.country || 'NL', // Default to Netherlands if no country selected yet
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      return data.clientSecret;
    },
    enabled: items.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes - payment intents are valid for some time
    retry: 1,
  });

  const clientSecret = paymentIntentData || null;
  const error = queryError ? String(queryError) : null;

  // Handle step navigation
  const handleNextStep = () => {
    if (step === 1) {
      const errors = validateCustomerInfo(formData);
      setFormErrors(errors);
      if (Object.keys(errors).length === 0) {
        setStep(2);
      }
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
            <VintageButton
              type="button"
              onClick={() => router.push(`/${locale}/cart`)}
              variant="danger"
            >
              {t('returnToCart')}
            </VintageButton>
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

        <div className={step === 1 ? "max-w-3xl mx-auto" : "max-w-7xl mx-auto"}>
          <CheckoutProgress currentStep={step} />

          {step === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
              <CustomerInfoForm
                formData={formData}
                formErrors={formErrors}
                onFormDataChange={setFormData}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                cartItems={items}
              />
            </div>
          )}

          {step === 2 && (
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column - Order Review */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
                  <OrderReview
                    items={items}
                    formData={formData}
                    subtotal={subtotal}
                    shipping={shipping}
                    total={total}
                  />
                </div>

                {/* Right column - Payment Form */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
                  <PaymentForm
                    items={items}
                    formData={formData}
                    subtotal={subtotal}
                    shipping={shipping}
                    total={total}
                    onBack={handlePreviousStep}
                  />
                </div>
              </div>
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
