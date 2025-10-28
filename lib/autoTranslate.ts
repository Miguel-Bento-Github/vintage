import type { Locale } from '@/i18n';
import { defaultLocale } from '@/i18n';

/**
 * Auto-translation helper for product content
 *
 * To enable automatic translation:
 *
 * 1. Choose a translation service:
 *    - DeepL API: https://www.deepl.com/pro-api (best quality)
 *    - OpenAI/Claude: For context-aware translations
 *
 * 2. Add API keys to your .env.local:
 *    DEEPL_API_KEY=your_key
 *    OPENAI_API_KEY=your_key
 */

export interface TranslationRequest {
  text: string;
  sourceLang: Locale;
  targetLang: Locale;
}

export interface TranslationResult {
  translatedText: string;
  success: boolean;
  error?: string;
}

/**
 * Translate text using DeepL API
 * Requires: DEEPL_API_KEY environment variable
 */
export async function translateWithDeepL(
  request: TranslationRequest
): Promise<TranslationResult> {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    return {
      translatedText: '',
      success: false,
      error: 'DeepL API key not configured',
    };
  }

  // Map locale codes to DeepL language codes
  const langMap: Record<Locale, string> = {
    en: 'EN',
    es: 'ES',
    fr: 'FR',
    de: 'DE',
    ja: 'JA',
  };

  try {
    const params = new URLSearchParams({
      auth_key: apiKey,
      text: request.text,
      source_lang: langMap[request.sourceLang],
      target_lang: langMap[request.targetLang],
    });

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.translations[0].text;

    return {
      translatedText,
      success: true,
    };
  } catch (error) {
    return {
      translatedText: '',
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed',
    };
  }
}

/**
 * Translate text using OpenAI for context-aware translations
 * Requires: OPENAI_API_KEY environment variable
 */
export async function translateWithOpenAI(
  request: TranslationRequest,
  context?: string
): Promise<TranslationResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      translatedText: '',
      success: false,
      error: 'OpenAI API key not configured',
    };
  }

  const localeNames: Record<Locale, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ja: 'Japanese',
  };

  const systemPrompt = context
    ? `You are a professional translator specializing in e-commerce and vintage fashion. Translate the following text from ${localeNames[request.sourceLang]} to ${localeNames[request.targetLang]}. Context: ${context}`
    : `You are a professional translator. Translate the following text from ${localeNames[request.sourceLang]} to ${localeNames[request.targetLang]}.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.text },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content;

    return {
      translatedText,
      success: true,
    };
  } catch (error) {
    return {
      translatedText: '',
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed',
    };
  }
}

/**
 * Main translation function with automatic fallback
 * Tries translation services in order: DeepL -> OpenAI
 */
export async function autoTranslate(
  request: TranslationRequest,
  context?: string
): Promise<TranslationResult> {
  // Skip if translating to same language
  if (request.sourceLang === request.targetLang) {
    return {
      translatedText: request.text,
      success: true,
    };
  }

  // Try DeepL first (best quality)
  if (process.env.DEEPL_API_KEY) {
    const result = await translateWithDeepL(request);
    if (result.success) return result;
  }

  // Try OpenAI as fallback (context-aware)
  if (process.env.OPENAI_API_KEY) {
    const result = await translateWithOpenAI(request, context);
    if (result.success) return result;
  }

  return {
    translatedText: '',
    success: false,
    error: 'No translation service configured. Please add DEEPL_API_KEY or OPENAI_API_KEY to .env.local',
  };
}

/**
 * Batch translate multiple texts
 */
export async function batchTranslate(
  texts: string[],
  sourceLang: Locale,
  targetLang: Locale,
  context?: string
): Promise<TranslationResult[]> {
  const promises = texts.map(text =>
    autoTranslate({ text, sourceLang, targetLang }, context)
  );
  return Promise.all(promises);
}

/**
 * Translate product fields
 */
export async function translateProductFields(
  title: string,
  description: string,
  conditionNotes: string | undefined,
  targetLang: Locale
): Promise<{
  title: string;
  description: string;
  conditionNotes?: string;
  success: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  const context = 'vintage fashion e-commerce product';

  // Translate title
  const titleResult = await autoTranslate(
    { text: title, sourceLang: defaultLocale, targetLang },
    context
  );
  if (!titleResult.success) {
    errors.push(`Title: ${titleResult.error}`);
  }

  // Translate description
  const descResult = await autoTranslate(
    { text: description, sourceLang: defaultLocale, targetLang },
    context
  );
  if (!descResult.success) {
    errors.push(`Description: ${descResult.error}`);
  }

  // Translate condition notes if present
  let conditionNotesResult: TranslationResult | undefined;
  if (conditionNotes) {
    conditionNotesResult = await autoTranslate(
      { text: conditionNotes, sourceLang: defaultLocale, targetLang },
      context
    );
    if (!conditionNotesResult.success) {
      errors.push(`Condition notes: ${conditionNotesResult.error}`);
    }
  }

  return {
    title: titleResult.translatedText || title,
    description: descResult.translatedText || description,
    conditionNotes: conditionNotesResult?.translatedText || conditionNotes,
    success: errors.length === 0,
    errors,
  };
}
