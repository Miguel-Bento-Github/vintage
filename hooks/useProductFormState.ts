import { useCallback, ChangeEvent } from 'react';
import { ProductType, ProductTranslations } from '@/types';

interface UseProductFormStateProps<
  T extends {
    productType: ProductType | '';
    title: string;
    description: string;
    brand: string;
    era: string;
    category: string;
    sizeLabel: string;
    specifications: Record<string, string>;
    condition: string;
    conditionNotes: string;
    price: string;
    tags: string;
    featured: boolean;
    inStock: boolean;
    weightGrams: string;
    lengthCm: string;
    widthCm: string;
    heightCm: string;
    discountPrice: string;
    discountStartDate: string;
    discountEndDate: string;
  },
  E extends { url: string; markedForDeletion: boolean } = { url: string; markedForDeletion: boolean },
  S extends { id: string; label: string } = { id: string; label: string }
> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  initialFormData: T | null;
  translations: ProductTranslations;
  initialTranslations: ProductTranslations;
  existingImages: E[];
  initialImages: E[];
  newImages: File[];
  sections: S[];
}

/**
 * Custom hook for managing product form state and change detection
 * Handles input changes, section completion tracking, and unsaved changes detection
 */
export function useProductFormState<
  T extends {
    productType: ProductType | '';
    title: string;
    description: string;
    brand: string;
    era: string;
    category: string;
    sizeLabel: string;
    specifications: Record<string, string>;
    condition: string;
    conditionNotes: string;
    price: string;
    tags: string;
    featured: boolean;
    inStock: boolean;
    weightGrams: string;
    lengthCm: string;
    widthCm: string;
    heightCm: string;
    discountPrice: string;
    discountStartDate: string;
    discountEndDate: string;
  },
  E extends { url: string; markedForDeletion: boolean } = { url: string; markedForDeletion: boolean },
  S extends { id: string; label: string } = { id: string; label: string }
>({
  formData,
  setFormData,
  initialFormData,
  translations,
  initialTranslations,
  existingImages,
  initialImages,
  newImages,
  sections,
}: UseProductFormStateProps<T, E, S>) {

  /**
   * Handle form input changes with special logic for different field types
   */
  const handleInputChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'productType') {
      // Reset category and specs when product type changes
      setFormData((prev) => ({
        ...prev,
        productType: value as ProductType,
        category: '',
        specifications: {},
      }));
    } else if (name.startsWith('specifications.')) {
      // Handle nested specifications object
      const specKey = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, [setFormData]);

  /**
   * Check if a section has all required fields filled
   */
  const isSectionComplete = useCallback((sectionId: string): boolean => {
    switch (sectionId) {
      case 'basic-info':
        return !!(formData.productType && formData.brand && formData.era && formData.category);
      case 'content':
        return !!(formData.title.trim() && formData.description.trim());
      case 'specifications':
        return true; // Optional
      case 'pricing':
        return !!(formData.condition && formData.price && parseFloat(formData.price) > 0);
      case 'discount':
        return true; // Optional
      case 'shipping':
        return !!formData.weightGrams; // Optional but recommended
      case 'images':
        const hasImages = existingImages.filter(img => !img.markedForDeletion).length + newImages.length > 0;
        return hasImages;
      case 'tags':
        return true; // Optional
      case 'actions':
        return true; // Always available
      default:
        return false;
    }
  }, [formData, existingImages, newImages]);

  /**
   * Check if a section has unsaved changes
   */
  const hasSectionChanges = useCallback((sectionId: string): boolean => {
    if (!initialFormData) return false;

    switch (sectionId) {
      case 'basic-info':
        return (
          formData.productType !== initialFormData.productType ||
          formData.brand !== initialFormData.brand ||
          formData.era !== initialFormData.era ||
          formData.category !== initialFormData.category ||
          formData.sizeLabel !== initialFormData.sizeLabel
        );
      case 'content':
        return (
          formData.title !== initialFormData.title ||
          formData.description !== initialFormData.description ||
          formData.conditionNotes !== initialFormData.conditionNotes ||
          JSON.stringify(translations) !== JSON.stringify(initialTranslations)
        );
      case 'specifications':
        return JSON.stringify(formData.specifications) !== JSON.stringify(initialFormData.specifications);
      case 'pricing':
        return (
          formData.condition !== initialFormData.condition ||
          formData.price !== initialFormData.price
        );
      case 'discount':
        return (
          formData.discountPrice !== initialFormData.discountPrice ||
          formData.discountStartDate !== initialFormData.discountStartDate ||
          formData.discountEndDate !== initialFormData.discountEndDate
        );
      case 'shipping':
        return (
          formData.weightGrams !== initialFormData.weightGrams ||
          formData.lengthCm !== initialFormData.lengthCm ||
          formData.widthCm !== initialFormData.widthCm ||
          formData.heightCm !== initialFormData.heightCm
        );
      case 'images':
        const imagesChanged = JSON.stringify(existingImages) !== JSON.stringify(initialImages);
        const hasNewImages = newImages.length > 0;
        return imagesChanged || hasNewImages;
      case 'tags':
        return (
          formData.tags !== initialFormData.tags ||
          formData.featured !== initialFormData.featured ||
          formData.inStock !== initialFormData.inStock
        );
      default:
        return false;
    }
  }, [formData, initialFormData, translations, initialTranslations, existingImages, initialImages, newImages]);

  /**
   * Check if there are any unsaved changes across all sections
   */
  const hasAnyChanges = useCallback((): boolean => {
    return sections.some((section) => hasSectionChanges(section.id));
  }, [sections, hasSectionChanges]);

  return {
    handleInputChange,
    isSectionComplete,
    hasSectionChanges,
    hasAnyChanges,
  };
}
