'use client';

import { useState } from 'react';
import { locales, Locale, defaultLocale } from '@/i18n';
import type { ProductTranslations } from '@/types';
import RichTextEditor from '@/components/RichTextEditor';

interface UnifiedProductContentEditorProps {
  // Base content (English)
  baseTitle: string;
  baseDescription: string;
  baseConditionNotes?: string;
  onBaseTitleChange: (value: string) => void;
  onBaseDescriptionChange: (value: string) => void;
  onBaseConditionNotesChange: (value: string) => void;

  // Translations
  translations?: ProductTranslations;
  onTranslationsChange: (translations: ProductTranslations) => void;
}

const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
};

const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  ja: '🇯🇵',
};

export default function UnifiedProductContentEditor({
  baseTitle,
  baseDescription,
  baseConditionNotes = '',
  onBaseTitleChange,
  onBaseDescriptionChange,
  onBaseConditionNotesChange,
  translations = {},
  onTranslationsChange,
}: UnifiedProductContentEditorProps) {
  const [selectedLocale, setSelectedLocale] = useState<Locale>(defaultLocale);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationProgress, setTranslationProgress] = useState<string>('');

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

    onTranslationsChange(updatedTranslations);
  };

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

      onTranslationsChange(updatedTranslations);
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

  const handleTranslateAll = async () => {
    if (!baseTitle || !baseDescription) {
      setTranslationError('Please fill in the English title and description first');
      return;
    }

    setIsTranslatingAll(true);
    setTranslationError(null);
    setTranslationProgress('');

    const targetLocales = locales.filter((l) => l !== defaultLocale);
    const updatedTranslations = { ...translations };
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < targetLocales.length; i++) {
      const targetLang = targetLocales[i];
      setTranslationProgress(`Translating to ${localeNames[targetLang]}... (${i + 1}/${targetLocales.length})`);

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: baseTitle,
            description: baseDescription,
            conditionNotes: baseConditionNotes,
            targetLang,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          updatedTranslations[targetLang] = {
            title: data.translation.title,
            description: data.translation.description,
            ...(data.translation.conditionNotes && { conditionNotes: data.translation.conditionNotes }),
          };
          successCount++;
        } else {
          console.error(`Translation failed for ${targetLang}:`, data.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`Translation error for ${targetLang}:`, error);
        errorCount++;
      }
    }

    onTranslationsChange(updatedTranslations);
    setTranslationProgress('');

    if (errorCount > 0) {
      setTranslationError(
        `Completed with ${successCount} successful and ${errorCount} failed translations. Check console for details.`
      );
    }

    setIsTranslatingAll(false);
  };

  const currentTranslation = translations[selectedLocale] || {};
  const isBaseLocale = selectedLocale === defaultLocale;

  // Get title, description, and condition notes for current locale
  const currentTitle = isBaseLocale ? baseTitle : (currentTranslation.title || '');
  const currentDescription = isBaseLocale ? baseDescription : (currentTranslation.description || '');
  const currentConditionNotes = isBaseLocale ? baseConditionNotes : (currentTranslation.conditionNotes || '');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Content</h2>
            <p className="text-sm text-gray-600">
              Add your product content in multiple languages. Start with English, then translate to other languages.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTranslateAll}
            disabled={isTranslatingAll || !baseTitle || !baseDescription}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium transition-all shadow-md hover:shadow-lg"
          >
            {isTranslatingAll ? (
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
                Translate All Languages
              </>
            )}
          </button>
        </div>

        {/* Translation Progress */}
        {translationProgress && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg
                className="animate-spin h-5 w-5 text-blue-600 mr-2"
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
              <p className="text-sm font-medium text-blue-900">{translationProgress}</p>
            </div>
          </div>
        )}
      </div>

      {/* Language Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {locales.map((locale) => {
          const hasTranslation = locale === defaultLocale || !!(
            translations[locale]?.title ||
            translations[locale]?.description ||
            translations[locale]?.conditionNotes
          );

          return (
            <button
              key={locale}
              type="button"
              onClick={() => {
                setSelectedLocale(locale);
                setTranslationError(null);
              }}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                selectedLocale === locale
                  ? 'bg-amber-700 text-white'
                  : locale === defaultLocale
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  : hasTranslation
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
              {locale === defaultLocale && <span className="text-xs">(Base)</span>}
              {locale !== defaultLocale && hasTranslation && <span>✓</span>}
            </button>
          );
        })}
      </div>

      {/* Content Fields */}
      <div className="space-y-6">
        {/* Header with Auto-Translate button for non-English locales */}
        {!isBaseLocale && (
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h3 className="font-medium text-gray-900">
                {localeFlags[selectedLocale]} {localeNames[selectedLocale]} Translation
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Translate from English or use AI to auto-translate
              </p>
            </div>
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
                    onTranslationsChange(updatedTranslations);
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* Translation Error */}
        {translationError && !isBaseLocale && (
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

        {/* Title Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Title {isBaseLocale && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={currentTitle}
            onChange={(e) =>
              isBaseLocale
                ? onBaseTitleChange(e.target.value)
                : handleTranslationChange(selectedLocale, 'title', e.target.value)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder={isBaseLocale ? 'Enter product title' : `Translate: ${baseTitle}`}
          />
        </div>

        {/* Description Field with RichTextEditor */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Description {isBaseLocale && <span className="text-red-500">*</span>}
          </label>
          <RichTextEditor
            content={currentDescription}
            onChange={(value) =>
              isBaseLocale
                ? onBaseDescriptionChange(value)
                : handleTranslationChange(selectedLocale, 'description', value)
            }
          />
          {!isBaseLocale && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 mb-1">English (Base):</p>
              <div
                className="text-xs text-blue-800 prose prose-sm max-h-24 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: baseDescription || '(no description)' }}
              />
            </div>
          )}
        </div>

        {/* Condition Notes Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Condition Notes (Optional)
          </label>
          <textarea
            value={currentConditionNotes}
            onChange={(e) =>
              isBaseLocale
                ? onBaseConditionNotesChange(e.target.value)
                : handleTranslationChange(selectedLocale, 'conditionNotes', e.target.value)
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder={
              isBaseLocale
                ? 'Any specific notes about wear, flaws, repairs...'
                : baseConditionNotes
                ? `Translate: ${baseConditionNotes}`
                : 'No condition notes in base language'
            }
          />
          {!isBaseLocale && baseConditionNotes && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 mb-1">English (Base):</p>
              <p className="text-xs text-blue-800">{baseConditionNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Translation Status Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Translation Status:</p>
        <div className="flex flex-wrap gap-2">
          {locales.filter(l => l !== defaultLocale).map((locale) => {
            const trans = translations[locale];
            const count = trans
              ? [trans.title, trans.description, trans.conditionNotes].filter(Boolean).length
              : 0;
            const total = baseConditionNotes ? 3 : 2;

            return (
              <div
                key={locale}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  count === 0
                    ? 'bg-gray-100 text-gray-600'
                    : count === total
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                <span>{localeFlags[locale]}</span>
                <span>{localeNames[locale]}: {count}/{total}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
