import { useTranslations as useNextIntlTranslations } from 'next-intl';

/**
 * Custom wrapper around next-intl's useTranslations hook
 * This allows us to add custom logic or fallbacks if needed in the future
 */
export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

export default useTranslations;
