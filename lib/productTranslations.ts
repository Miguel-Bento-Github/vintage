import type { Product, SerializedProduct } from '@/types';
import type { Locale } from '@/i18n';
import { defaultLocale } from '@/i18n';

/**
 * Get translated product field with fallback logic:
 * 1. Try to get translation for requested locale
 * 2. Fall back to base language (product.field)
 * 3. Fall back to empty string
 */
export function getTranslatedField(
  product: Product | SerializedProduct,
  field: 'title' | 'description' | 'conditionNotes',
  locale: Locale
): string {
  // If requesting default locale or no translations exist, return base field
  if (locale === defaultLocale || !product.translations) {
    return product[field] || '';
  }

  // Try to get translation for the requested locale
  const translation = product.translations[locale]?.[field];
  if (translation) {
    return translation;
  }

  // Fall back to base language
  return product[field] || '';
}

/**
 * Get a fully translated product object for a specific locale
 * Returns a new object with translated fields
 */
export function getTranslatedProduct<T extends Product | SerializedProduct>(
  product: T,
  locale: Locale
): T {
  return {
    ...product,
    title: getTranslatedField(product, 'title', locale),
    description: getTranslatedField(product, 'description', locale),
    conditionNotes: product.conditionNotes
      ? getTranslatedField(product, 'conditionNotes', locale)
      : undefined,
  };
}

/**
 * Check if a product has any translations for a specific locale
 */
export function hasTranslation(
  product: Product | SerializedProduct,
  locale: Locale
): boolean {
  if (!product.translations || locale === defaultLocale) {
    return false;
  }

  const translation = product.translations[locale];
  return !!(translation?.title || translation?.description || translation?.conditionNotes);
}

/**
 * Get all available locales that have translations for this product
 */
export function getAvailableLocales(
  product: Product | SerializedProduct
): Locale[] {
  if (!product.translations) {
    return [defaultLocale];
  }

  const locales = Object.keys(product.translations) as Locale[];
  return [defaultLocale, ...locales];
}

/**
 * Calculate translation completion percentage for a specific locale
 * Returns 0-100 based on how many translatable fields have translations
 */
export function getTranslationCompleteness(
  product: Product | SerializedProduct,
  locale: Locale
): number {
  if (locale === defaultLocale) {
    return 100; // Base language is always complete
  }

  if (!product.translations?.[locale]) {
    return 0;
  }

  const translatableFields = ['title', 'description', 'conditionNotes'] as const;
  const fieldsToTranslate = translatableFields.filter(field => !!product[field]);

  if (fieldsToTranslate.length === 0) {
    return 100;
  }

  const translatedFields = fieldsToTranslate.filter(
    field => !!product.translations?.[locale]?.[field]
  );

  return Math.round((translatedFields.length / fieldsToTranslate.length) * 100);
}
