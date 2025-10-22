// Re-export locale configuration
export const locales = ['en', 'es', 'fr', 'de', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/**
 * Type guard to check if a string is a valid Locale
 */
export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

/**
 * Safely converts a string to a Locale, falling back to defaultLocale if invalid
 */
export function toLocale(value: string | undefined | null): Locale {
  if (!value) return defaultLocale;
  return isLocale(value) ? value : defaultLocale;
}
