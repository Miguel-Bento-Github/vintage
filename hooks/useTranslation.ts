'use client';

import { useMutation } from '@tanstack/react-query';
import { translateProduct, TranslateRequest, TranslationResult } from '@/services/translationService';

/**
 * Translate product content to a target language
 * Returns mutation for translating product fields
 */
export function useTranslateProduct() {
  return useMutation({
    mutationFn: async (request: TranslateRequest) => {
      const result = await translateProduct(request);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onError: (error) => {
      console.error('Translation mutation failed:', error);
    },
  });
}

export type UseTranslateProductResult = ReturnType<typeof useTranslateProduct>;
