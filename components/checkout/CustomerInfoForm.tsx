'use client';

import { CheckoutFormData, CheckoutFormErrors } from '@/types/checkout';
import { useTranslations } from '@/hooks/useTranslations';
import { useShippingQuote } from '@/hooks/useShipping';
import { useCurrency } from '@/hooks/useCurrency';
import { formatPrice, convertPrice, Currency, getExchangeRates } from '@/lib/currency';
import CountryCombobox from '@/components/CountryCombobox';

interface CustomerInfoFormProps {
  formData: CheckoutFormData;
  formErrors: CheckoutFormErrors;
  onFormDataChange: (data: CheckoutFormData) => void;
  onNext: () => void;
  onBack: () => void;
  cartItems?: Array<{ freeShipping?: boolean }>;
}

export default function CustomerInfoForm({
  formData,
  formErrors,
  onFormDataChange,
  onNext,
  onBack,
  cartItems = [],
}: CustomerInfoFormProps) {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const { currency } = useCurrency();

  // Check if all items in cart have free shipping
  const allItemsFreeShipping = cartItems.length > 0 && cartItems.every(item => item.freeShipping === true);

  // Fetch real-time shipping quote with TanStack Query (only if not all items have free shipping)
  const { data: shippingQuote, isLoading: isLoadingQuote } = useShippingQuote(
    formData.country,
    formData.postalCode || undefined
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('shippingInformation')}</h2>
        <p className="text-gray-600">Enter your contact and shipping details</p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('name')} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 text-base ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('email')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 text-base ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{ minHeight: '44px' }}
            placeholder="you@example.com"
          />
          {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
        </div>

        {/* Street Address */}
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            {t('addressLine1')} *
          </label>
          <input
            type="text"
            id="street"
            name="street-address"
            autoComplete="shipping street-address"
            value={formData.street}
            onChange={(e) => onFormDataChange({ ...formData, street: e.target.value })}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 text-base ${
              formErrors.street ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g. 123 Rue de Rivoli, Hauptstraße 45"
          />
          {formErrors.street && <p className="mt-1 text-sm text-red-600">{formErrors.street}</p>}
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              {t('city')} *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              autoComplete="shipping address-level2"
              value={formData.city}
              onChange={(e) => onFormDataChange({ ...formData, city: e.target.value })}
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 text-base ${
                formErrors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. Paris, Berlin, Amsterdam"
            />
            {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              {t('state')} *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              autoComplete="shipping address-level1"
              value={formData.state}
              onChange={(e) => onFormDataChange({ ...formData, state: e.target.value })}
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 text-base ${
                formErrors.state ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. CA, Bavaria, Cornwall"
            />
            {formErrors.state && <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              {t('postalCode')} *
            </label>
            <input
              type="text"
              id="postalCode"
              name="postal-code"
              autoComplete="shipping postal-code"
              value={formData.postalCode}
              onChange={(e) => onFormDataChange({ ...formData, postalCode: e.target.value })}
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 text-base ${
                formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. 75001, 10115, SW1A 1AA"
            />
            {formErrors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            {t('country')} *
          </label>
          <CountryCombobox
            value={formData.country}
            onChange={(countryCode) => onFormDataChange({ ...formData, country: countryCode })}
            placeholder="Type your country name..."
            autoDetect={true}
            error={formErrors.country}
          />

          {/* Shipping Estimate */}
          {allItemsFreeShipping && formData.country && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-semibold text-green-800">
                  🎁 Free Shipping
                </p>
              </div>
              <p className="text-xs text-green-700 mt-1 ml-7">
                All items in your cart ship free!
              </p>
            </div>
          )}

          {!allItemsFreeShipping && isLoadingQuote && formData.country && (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700"></div>
                <p className="text-sm text-gray-600">Loading shipping rates...</p>
              </div>
            </div>
          )}

          {!allItemsFreeShipping && !isLoadingQuote && shippingQuote && (() => {
            // Convert shipping cost to user's selected currency
            const rates = getExchangeRates();
            let costInEUR = shippingQuote.cost;

            // If shipping cost is in USD, convert to EUR first (base currency)
            if (shippingQuote.currency === 'USD') {
              const usdToEurRate = rates.USD;
              costInEUR = shippingQuote.cost / usdToEurRate; // Convert USD to EUR
            }

            // Convert from EUR to target currency
            const convertedCost = convertPrice(costInEUR, currency as Currency);
            const formattedPrice = formatPrice(costInEUR, currency as Currency, convertedCost);

            return (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Shipping:</span>{' '}
                      {formattedPrice} via {shippingQuote.carrier}
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      {shippingQuote.service} • Delivery: {shippingQuote.estimatedDays}
                    </p>
                  </div>
                  {shippingQuote.source === 'api' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-700 text-white font-medium">
                      ✓ Live rate
                    </span>
                  )}
                  {shippingQuote.source === 'static' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700">
                      Estimate
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          {tCommon('back')} to Cart
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 px-6 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition font-medium"
        >
          Continue to {t('reviewOrder')}
        </button>
      </div>
    </div>
  );
}
