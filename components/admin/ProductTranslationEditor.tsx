'use client';

import { useState } from 'react';
import { locales, Locale, defaultLocale } from '@/i18n';
import type { ProductTranslations } from '@/types';

interface ProductTranslationEditorProps {
  translations?: ProductTranslations;
  baseTitle: string;
  baseDescription: string;
  baseConditionNotes?: string;
  onChange: (translations: ProductTranslations) => void;
}

const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
};

export default function ProductTranslationEditor({
  translations = {},
  baseTitle,
  baseDescription,
  baseConditionNotes,
  onChange,
}: ProductTranslationEditorProps) {
  const [selectedLocale, setSelectedLocale] = useState<Locale>(
    locales.find((l) => l !== defaultLocale) || 'es'
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Available locales (excluding default/English)
  const availableLocales = locales.filter((l) => l !== defaultLocale);

  const handleTranslationChange = (
    locale: Locale,
    field: 'title' | 'description' | 'conditionNotes',
    value: string
  ) => {
    const updatedTranslations = { ...translations };

    if (!updatedTranslations[locale]) {
      updatedTranslations[locale] = {};
    }

    if (value.trim()) {
      updatedTranslations[locale] = {
        ...updatedTranslations[locale],
        [field]: value,
      };
    } else {
      // Remove empty translations
      delete updatedTranslations[locale]![field];
      // If locale has no translations left, remove it entirely
      if (Object.keys(updatedTranslations[locale]!).length === 0) {
        delete updatedTranslations[locale];
      }
    }

    onChange(updatedTranslations);
  };

  const currentTranslation = translations[selectedLocale] || {};

  const handleAutoTranslate = async () => {
    if (!baseTitle || !baseDescription) {
      setTranslationError('Please fill in the English title and description first');
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: baseTitle,
          description: baseDescription,
          conditionNotes: baseConditionNotes,
          targetLang: selectedLocale,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Translation failed');
      }

      // Update translations with the auto-translated content
      const updatedTranslations = { ...translations };
      updatedTranslations[selectedLocale] = {
        title: data.translation.title,
        description: data.translation.description,
        ...(data.translation.conditionNotes && { conditionNotes: data.translation.conditionNotes }),
      };

      onChange(updatedTranslations);
    } catch (error) {
      console.error('Auto-translation error:', error);
      setTranslationError(
        error instanceof Error
          ? error.message
          : 'Translation failed. Please check your API configuration.'
      );
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Translations</h3>
        <p className="text-sm text-gray-600">
          Add translations for your product in different languages. English is the base language.
        </p>
      </div>

      {/* Locale Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availableLocales.map((locale) => {
          const hasTranslation = !!(
            translations[locale]?.title ||
            translations[locale]?.description ||
            translations[locale]?.conditionNotes
          );

          return (
            <button
              key={locale}
              type="button"
              onClick={() => setSelectedLocale(locale)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedLocale === locale
                  ? 'bg-amber-700 text-white'
                  : hasTranslation
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {localeNames[locale]}
              {hasTranslation && ' ✓'}
            </button>
          );
        })}
      </div>

      {/* Translation Fields */}
      <div className="space-y-6 bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h4 className="font-medium text-gray-900">
            {localeNames[selectedLocale]} Translation
          </h4>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={isTranslating || !baseTitle || !baseDescription}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium transition-colors"
            >
              {isTranslating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Translating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  Translate Now
                </>
              )}
            </button>
            {(currentTranslation.title ||
              currentTranslation.description ||
              currentTranslation.conditionNotes) && (
              <button
                type="button"
                onClick={() => {
                  const updatedTranslations = { ...translations };
                  delete updatedTranslations[selectedLocale];
                  onChange(updatedTranslations);
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Translation Error */}
        {translationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Translation Error</p>
                <p className="text-sm text-red-700 mt-1">{translationError}</p>
                <p className="text-xs text-red-600 mt-2">
                  To enable auto-translation, add an API key to your .env.local file:
                  <br />
                  <code className="bg-red-100 px-1 py-0.5 rounded">DEEPL_API_KEY</code> or{' '}
                  <code className="bg-red-100 px-1 py-0.5 rounded">OPENAI_API_KEY</code>
                </p>
              </div>
            </div>
          </div>
        )}


        {/* Base Language Reference */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-blue-900 mb-1">Base (English):</p>
          <p className="text-blue-800 line-clamp-2">{baseTitle || '(no title)'}</p>
        </div>

        {/* Title Translation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title ({localeNames[selectedLocale]})
          </label>
          <input
            type="text"
            value={currentTranslation.title || ''}
            onChange={(e) =>
              handleTranslationChange(selectedLocale, 'title', e.target.value)
            }
            placeholder={`Translation of: ${baseTitle}`}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Description Translation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description ({localeNames[selectedLocale]})
          </label>
          <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm max-h-24 overflow-y-auto">
            <p className="font-medium text-blue-900 mb-1">Base (English):</p>
            <div
              className="text-blue-800 prose prose-sm"
              dangerouslySetInnerHTML={{ __html: baseDescription || '(no description)' }}
            />
          </div>
          <textarea
            value={currentTranslation.description || ''}
            onChange={(e) =>
              handleTranslationChange(selectedLocale, 'description', e.target.value)
            }
            placeholder={`Translate the description to ${localeNames[selectedLocale]}...`}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Plain text only (HTML from original will be preserved in base language)
          </p>
        </div>

        {/* Condition Notes Translation (if base exists) */}
        {baseConditionNotes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition Notes ({localeNames[selectedLocale]})
            </label>
            <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-blue-900 mb-1">Base (English):</p>
              <p className="text-blue-800">{baseConditionNotes}</p>
            </div>
            <textarea
              value={currentTranslation.conditionNotes || ''}
              onChange={(e) =>
                handleTranslationChange(selectedLocale, 'conditionNotes', e.target.value)
              }
              placeholder={`Translation of: ${baseConditionNotes}`}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Translation Status Summary */}
      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Translation Status:</p>
        <div className="flex flex-wrap gap-2">
          {availableLocales.map((locale) => {
            const trans = translations[locale];
            const count = trans
              ? [trans.title, trans.description, trans.conditionNotes].filter(Boolean).length
              : 0;
            const total = baseConditionNotes ? 3 : 2;

            return (
              <div
                key={locale}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  count === 0
                    ? 'bg-gray-100 text-gray-600'
                    : count === total
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {localeNames[locale]}: {count}/{total}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
