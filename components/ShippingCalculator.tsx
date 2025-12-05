'use client';

import { useState } from 'react';
import { formatShippingCost } from '@/lib/shipping';
import { useCurrency } from '@/hooks/useCurrency';
import { useShippingQuote } from '@/hooks/useShipping';
import { useTranslations } from '@/hooks/useTranslations';
import CountryCombobox from './CountryCombobox';

interface ShippingCalculatorProps {
  productWeight?: number; // Optional weight in grams
  className?: string;
}

export default function ShippingCalculator({ productWeight, className = '' }: ShippingCalculatorProps) {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { currency } = useCurrency();
  const t = useTranslations('shippingCalculator');

  // Fetch real-time shipping quote with TanStack Query
  const { data: shippingQuote, isLoading: isLoadingQuote } = useShippingQuote(
    selectedCountry,
    undefined,
    productWeight
  );

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition rounded-lg"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span className="font-medium text-gray-900">{t('calculateShipping')}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <div>
            <label htmlFor="shipping-country" className="block text-sm font-medium text-gray-700 mb-1">
              {t('shipTo')}
            </label>
            <CountryCombobox
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder={t('typeCountry')}
              autoDetect={true}
            />
            <p className="text-xs text-gray-500 mt-1">
              {selectedCountry ? `✓ ${t('countrySelected')}` : `🌍 ${t('autoDetecting')}`}
            </p>
          </div>

          {isLoadingQuote && selectedCountry && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700"></div>
                <p className="text-sm text-gray-600">{t('loadingRates')}</p>
              </div>
            </div>
          )}

          {!isLoadingQuote && shippingQuote && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{t('shippingCost')}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatShippingCost(shippingQuote.cost, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-700">
                    <span>via {shippingQuote.carrier}</span>
                    {shippingQuote.source === 'api' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-700 text-white font-medium">
                        ✓ {t('liveRate')}
                      </span>
                    )}
                    {shippingQuote.source === 'static' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700">
                        {t('estimate')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200">
                <p className="text-xs text-gray-700">
                  📦 {t('delivery')} {shippingQuote.estimatedDays}
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  {shippingQuote.zone === 'domestic'
                    ? t('domesticShipping')
                    : shippingQuote.zone === 'europe'
                    ? t('europeanShipping')
                    : t('internationalShipping')}
                </p>
              </div>
            </div>
          )}

          {!selectedCountry && !isLoadingQuote && (
            <p className="text-xs text-gray-500 italic">
              {t('startTyping')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
