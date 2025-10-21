'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocale } from 'next-intl';
import {
  Currency,
  getCurrencyFromLocale,
  isValidCurrency,
  fetchExchangeRates,
  setExchangeRates
} from '@/lib/currency';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  isLoading: boolean;
  exchangeRatesLoaded: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'preferred-currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [currency, setCurrencyState] = useState<Currency>('EUR');
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeRatesLoaded, setExchangeRatesLoaded] = useState(false);

  // Fetch exchange rates on mount
  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
        setExchangeRatesLoaded(true);
        console.log('✅ Live exchange rates loaded:', rates);
      } catch (error) {
        console.error('Failed to load exchange rates:', error);
        setExchangeRatesLoaded(false);
      }
    };

    loadExchangeRates();
  }, []);

  // Initialize currency on mount
  useEffect(() => {
    // Priority 1: User's explicit selection from localStorage
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && isValidCurrency(stored)) {
      setCurrencyState(stored);
      setIsLoading(false);
      return;
    }

    // Priority 2: Locale-based default
    const localeCurrency = getCurrencyFromLocale(locale as any);
    setCurrencyState(localeCurrency);
    setIsLoading(false);
  }, [locale]);

  // Update currency and persist to localStorage
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isLoading, exchangeRatesLoaded }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
