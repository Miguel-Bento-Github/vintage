import { useCallback } from 'react';

interface UseProductFormValidationProps<
  T = Record<string, unknown>,
  E extends { url: string; markedForDeletion?: boolean } = { url: string; markedForDeletion?: boolean }
> {
  formData: T & {
    title: string;
    description: string;
    condition: string;
    price: string;
  };
  existingImages: E[];
  newImages: File[];
  isNewProduct: boolean;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Custom hook for validating product form data
 * Validates required fields and image requirements
 */
export function useProductFormValidation<
  T = Record<string, unknown>,
  E extends { url: string; markedForDeletion?: boolean } = { url: string; markedForDeletion?: boolean }
>({
  formData,
  existingImages,
  newImages,
  isNewProduct,
}: UseProductFormValidationProps<T, E>) {

  const validateForm = useCallback((): ValidationResult => {
    // Title validation
    if (!formData.title.trim()) {
      return {
        isValid: false,
        error: 'Title is required',
      };
    }

    // Description validation
    if (!formData.description.trim()) {
      return {
        isValid: false,
        error: 'Description is required',
      };
    }

    // Condition validation
    if (!formData.condition) {
      return {
        isValid: false,
        error: 'Condition is required',
      };
    }

    // Price validation
    if (!formData.price || parseFloat(formData.price) <= 0) {
      return {
        isValid: false,
        error: 'Valid price is required',
      };
    }

    // Image validation
    if (isNewProduct) {
      // For new products, only check new images
      if (newImages.length === 0) {
        return {
          isValid: false,
          error: 'At least one image is required',
        };
      }
    } else {
      // For existing products, check both existing and new images
      const remainingImages = existingImages.filter((img) => !img.markedForDeletion).length;
      if (remainingImages + newImages.length === 0) {
        return {
          isValid: false,
          error: 'At least one image is required',
        };
      }
    }

    return { isValid: true };
  }, [formData, existingImages, newImages, isNewProduct]);

  return {
    validateForm,
  };
}
