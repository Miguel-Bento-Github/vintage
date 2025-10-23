'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupportedCountries, type Country } from '@/lib/shipping';

interface CountryComboboxProps {
  value: string; // ISO country code
  onChange: (countryCode: string) => void;
  placeholder?: string;
  className?: string;
  autoDetect?: boolean; // Auto-detect user's country
  error?: string;
}

export default function CountryCombobox({
  value,
  onChange,
  placeholder = 'Type to search countries...',
  className = '',
  autoDetect = false,
  error,
}: CountryComboboxProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const countries = getSupportedCountries();

  // Get selected country name for display
  const selectedCountry = countries.find(c => c.code === value);
  const displayValue = selectedCountry ? selectedCountry.name : '';

  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-detect country function
  const detectCountry = useCallback(async () => {
    try {
      const { detectUserCountry } = await import('@/lib/location');
      const detectedCountry = await detectUserCountry();
      if (detectedCountry) {
        onChange(detectedCountry);
      }
    } catch (error) {
      console.error('Failed to detect country:', error);
    }
  }, [onChange]);

  // Auto-detect country on mount
  useEffect(() => {
    if (autoDetect && !value) {
      detectCountry();
    }
  }, [autoDetect, value, detectCountry]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCountries[highlightedIndex]) {
          selectCountry(filteredCountries[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        inputRef.current?.blur();
        break;
    }
  }

  function selectCountry(country: Country) {
    onChange(country.code);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }

  function handleInputFocus() {
    setIsOpen(true);
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 text-base ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredCountries.length > 0 ? (
            <ul className="py-1">
              {filteredCountries.map((country, index) => (
                <li key={country.code}>
                  <button
                    type="button"
                    onClick={() => selectCountry(country)}
                    className={`w-full text-left px-4 py-2 hover:bg-amber-50 transition-colors ${
                      index === highlightedIndex ? 'bg-amber-50' : ''
                    } ${country.code === value ? 'bg-amber-100 font-medium' : ''}`}
                  >
                    <span className="font-medium text-gray-900">{country.name}</span>
                    <span className="text-gray-500 text-sm ml-2">({country.code})</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No countries found matching &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
