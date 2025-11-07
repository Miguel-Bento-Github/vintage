import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp, deleteField } from 'firebase/firestore';
import { useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { uploadProductImages, deleteProductImage, addProduct } from '@/services/productService';
import { ProductType, Era, Category, Condition, ProductTranslations, Product } from '@/types';

interface ExistingImage {
  url: string;
  markedForDeletion: boolean;
}

interface ProductFormData {
  productType: ProductType | '';
  title: string;
  description: string;
  brand: string;
  era: Era | '';
  category: Category | '';
  sizeLabel: string;
  specifications: Record<string, string>;
  condition: Condition | '';
  conditionNotes: string;
  price: string;
  tags: string;
  featured: boolean;
  inStock: boolean;
  weightGrams: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  freeShipping: boolean;
  discountPrice: string;
  discountStartDate: string;
  discountEndDate: string;
}

interface UseProductSubmitProps {
  productId: string;
  isNewProduct: boolean;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  translations: ProductTranslations;
  existingImages: ExistingImage[];
  setExistingImages: React.Dispatch<React.SetStateAction<ExistingImage[]>>;
  newImages: File[];
  setNewImages: React.Dispatch<React.SetStateAction<File[]>>;
  newImagePreviews: string[];
  setNewImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  setInitialFormData: React.Dispatch<React.SetStateAction<ProductFormData | null>>;
  setInitialTranslations: React.Dispatch<React.SetStateAction<ProductTranslations>>;
  setInitialImages: React.Dispatch<React.SetStateAction<ExistingImage[]>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setError: (error: string) => void;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  product?: Product | null;
}

/**
 * Custom hook for handling product form submissions
 * Handles create, update, delete, duplicate, and mark as sold operations
 */
export function useProductSubmit({
  productId,
  isNewProduct,
  formData,
  setFormData,
  translations,
  existingImages,
  setExistingImages,
  newImages,
  setNewImages,
  newImagePreviews,
  setNewImagePreviews,
  setInitialFormData,
  setInitialTranslations,
  setInitialImages,
  setIsSubmitting,
  setError,
  setSuccess,
  product,
}: UseProductSubmitProps) {
  const router = useRouter();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  /**
   * Prepare product data from form data
   * @param isUpdate - Whether this is for an update operation (uses deleteField) or create (omits fields)
   */
  const prepareProductData = useCallback((isUpdate = false): any => {
    // Prepare specifications
    const specifications: Record<string, string | number> = {};
    Object.entries(formData.specifications).forEach(([key, value]) => {
      if (value && value.trim()) {
        const cleanedValue = value.trim().replace(/\s*(cm|in|inches|")\s*$/i, '');
        const numValue = parseFloat(cleanedValue);
        specifications[key] = isNaN(numValue) ? value.trim() : numValue;
      }
    });

    const productType: ProductType = formData.productType as ProductType;
    const era: Era = formData.era as Era;
    const category: Category = formData.category as Category;
    const condition: Condition = formData.condition as Condition;

    const baseData = {
      productType,
      title: formData.title.trim(),
      description: formData.description.trim(),
      brand: formData.brand.trim(),
      era,
      category,
      ...(formData.sizeLabel.trim() && {
        size: {
          label: formData.sizeLabel.trim(),
          specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        },
      }),
      ...(Object.keys(specifications).length > 0 && { specifications }),
      condition,
      conditionNotes: formData.conditionNotes.trim(),
      price: parseFloat(formData.price),
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      featured: formData.featured,
      inStock: formData.inStock,
      ...(formData.weightGrams && { weightGrams: parseFloat(formData.weightGrams) }),
      ...(formData.lengthCm && { lengthCm: parseFloat(formData.lengthCm) }),
      ...(formData.widthCm && { widthCm: parseFloat(formData.widthCm) }),
      ...(formData.heightCm && { heightCm: parseFloat(formData.heightCm) }),
      freeShipping: formData.freeShipping,
      ...(Object.keys(translations).length > 0 && { translations }),
    };

    // Handle discount fields differently for create vs update
    if (isUpdate) {
      // For updates, use deleteField() to explicitly remove empty fields
      return {
        ...baseData,
        discountPrice: formData.discountPrice && formData.discountPrice.trim() ? parseFloat(formData.discountPrice) : deleteField(),
        discountStartDate: formData.discountStartDate && formData.discountStartDate.trim() ? Timestamp.fromDate(new Date(formData.discountStartDate)) : deleteField(),
        discountEndDate: formData.discountEndDate && formData.discountEndDate.trim() ? Timestamp.fromDate(new Date(formData.discountEndDate)) : deleteField(),
      };
    } else {
      // For creates, use conditional spread to omit empty fields
      return {
        ...baseData,
        ...(formData.discountPrice && formData.discountPrice.trim() && { discountPrice: parseFloat(formData.discountPrice) }),
        ...(formData.discountStartDate && formData.discountStartDate.trim() && { discountStartDate: Timestamp.fromDate(new Date(formData.discountStartDate)) }),
        ...(formData.discountEndDate && formData.discountEndDate.trim() && { discountEndDate: Timestamp.fromDate(new Date(formData.discountEndDate)) }),
      };
    }
  }, [formData, translations]);

  /**
   * Handle product creation (new product)
   */
  const handleCreate = useCallback(async () => {
    if (newImages.length === 0) {
      setError('Please upload at least one image');
      return false;
    }

    const productData = prepareProductData();
    const result = await addProduct(productData, newImages);

    if (!result.success) {
      throw new Error(result.error || 'Failed to create product');
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/admin/products');
    }, 1500);

    return true;
  }, [newImages, prepareProductData, setError, setSuccess, router]);

  /**
   * Handle product update (existing product)
   */
  const handleUpdate = useCallback(async () => {
    // Handle new image uploads
    let uploadedImageUrls: string[] = [];
    if (newImages.length > 0) {
      const uploadResult = await uploadProductImages(newImages, productId);

      if (uploadResult.failed.length > 0) {
        throw new Error(`Failed to upload ${uploadResult.failed.length} image(s)`);
      }

      uploadedImageUrls = uploadResult.successful.map((result) => result.url);
    }

    // Combine existing images (not marked for deletion) with new uploads
    const finalImages = [
      ...existingImages.filter((img) => !img.markedForDeletion).map((img) => img.url),
      ...uploadedImageUrls,
    ];

    const productData = prepareProductData(true);
    const updateData = {
      ...productData,
      images: finalImages,
    };

    await updateProductMutation.mutateAsync({
      productId,
      updates: updateData,
    });

    // Delete removed images from storage (best effort)
    const imagesToDelete = existingImages
      .filter((img) => img.markedForDeletion)
      .map((img) => img.url);

    for (const imageUrl of imagesToDelete) {
      try {
        const path = imageUrl.split('/o/')[1]?.split('?')[0];
        if (path) {
          await deleteProductImage(decodeURIComponent(path));
        }
      } catch (err) {
        console.warn('Failed to delete image from storage:', err);
      }
    }

    setSuccess(true);

    // Clear new images
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImages([]);
    setNewImagePreviews([]);

    // Update initial state to reflect saved changes
    setInitialFormData(formData);
    setInitialTranslations(translations);
    setInitialImages(existingImages.filter(img => !img.markedForDeletion));

    // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccess(false);
    }, 3000);

    return true;
  }, [
    productId,
    newImages,
    existingImages,
    newImagePreviews,
    formData,
    translations,
    prepareProductData,
    updateProductMutation,
    setNewImages,
    setNewImagePreviews,
    setInitialFormData,
    setInitialTranslations,
    setInitialImages,
    setSuccess,
  ]);

  /**
   * Handle product deletion
   */
  const handleDelete = useCallback(async () => {
    if (!product) return;

    try {
      await deleteProductMutation.mutateAsync(productId);
      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  }, [product, productId, deleteProductMutation, router, setError]);

  /**
   * Handle product duplication
   */
  const handleDuplicate = useCallback(async () => {
    if (!product) return;

    setIsSubmitting(true);
    try {
      const duplicateData = {
        productType: product.productType,
        title: `${product.title} (Copy)`,
        description: product.description,
        brand: product.brand,
        era: product.era,
        category: product.category,
        ...(product.size && { size: product.size }),
        ...(product.specifications && { specifications: product.specifications }),
        condition: product.condition,
        conditionNotes: product.conditionNotes || '',
        price: product.price,
        tags: product.tags,
        featured: false,
        inStock: true,
        images: product.images,
      };

      const result = await addProduct(duplicateData, []);

      if (!result.success) {
        throw new Error(result.error || 'Failed to duplicate product');
      }

      router.push(`/admin/products/edit/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate product');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [product, router, setIsSubmitting, setError]);

  /**
   * Handle marking product as sold
   */
  const handleMarkAsSold = useCallback(async () => {
    if (!formData.inStock) {
      alert('Product is already marked as sold');
      return;
    }

    if (confirm('Mark this product as sold?')) {
      try {
        await updateProductMutation.mutateAsync({
          productId,
          updates: { inStock: false },
        });
        setFormData((prev) => ({ ...prev, inStock: false }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to mark as sold');
      }
    }
  }, [formData.inStock, productId, updateProductMutation, setFormData, setError]);

  /**
   * Main submit handler
   */
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      if (isNewProduct) {
        await handleCreate();
      } else {
        await handleUpdate();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isNewProduct
          ? 'Failed to create product'
          : 'Failed to update product'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isNewProduct, handleCreate, handleUpdate, setIsSubmitting, setError]);

  return {
    handleSubmit,
    handleDelete,
    handleDuplicate,
    handleMarkAsSold,
    prepareProductData,
  };
}
