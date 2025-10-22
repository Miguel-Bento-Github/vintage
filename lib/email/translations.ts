import type { Locale } from '@/i18n';

// Import all translations
import enMessages from '@/messages/en.json';
import esMessages from '@/messages/es.json';
import frMessages from '@/messages/fr.json';
import deMessages from '@/messages/de.json';
import jaMessages from '@/messages/ja.json';

const messages: Record<Locale, typeof enMessages> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  de: deMessages,
  ja: jaMessages,
};

/**
 * Get a translated message for emails
 * Simple replacement for {variable} patterns
 *
 * @param locale - The locale to use
 * @param key - Dot-notation key (e.g., 'email.orderConfirmation.heading')
 * @param variables - Object with replacement values
 * @returns Translated string with variables replaced
 */
export function getEmailTranslation(
  locale: Locale,
  key: string,
  variables?: Record<string, string | number>
): string {
  const translation = messages[locale] || messages.en;

  // Navigate through nested keys
  const keys = key.split('.');
  let value: unknown = translation;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback to English if key not found
      value = enMessages;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = (value as Record<string, unknown>)[fallbackKey];
        } else {
          return key; // Return key if not found in fallback either
        }
      }
      break;
    }
  }

  let result = String(value);

  // Replace variables
  if (variables) {
    for (const [varKey, varValue] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varValue));
    }
  }

  return result;
}

/**
 * Get all translations for a specific email type
 */
export function getEmailMessages(locale: Locale, emailType: 'orderConfirmation' | 'shippingNotification') {
  const translation = messages[locale] || messages.en;
  // Fallback to English if email translations don't exist in this locale
  if (!translation.email || !translation.email[emailType]) {
    return enMessages.email[emailType];
  }
  return translation.email[emailType];
}

/**
 * Replace variables in a string
 */
export function replaceVars(template: string, vars: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}
