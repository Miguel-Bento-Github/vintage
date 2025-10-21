'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { CURRENCIES, getSupportedCurrencies, Currency } from '@/lib/currency';

export default function CurrencySelector() {
  const { currency, setCurrency, exchangeRatesLoaded } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  const currencies = getSupportedCurrencies();
  const currentCurrencyInfo = CURRENCIES[currency];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="Select currency"
        aria-expanded={isOpen}
      >
        <span className="text-base">{currentCurrencyInfo.symbol}</span>
        <span className="hidden sm:inline">{currency}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {currencies.map((curr) => {
              const info = CURRENCIES[curr];
              return (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center justify-between ${
                    curr === currency ? 'bg-amber-50 text-amber-900 font-medium' : 'text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base font-medium">{info.symbol}</span>
                    <span>{curr}</span>
                  </span>
                  {curr === currency && (
                    <svg
                      className="w-4 h-4 text-amber-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              {exchangeRatesLoaded ? (
                <>
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Live rates • Converted from EUR</span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span>Prices converted from EUR</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
