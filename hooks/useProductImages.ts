import { useState, useCallback, ChangeEvent } from 'react';

interface ExistingImage {
  url: string;
  markedForDeletion: boolean;
}

interface UseProductImagesProps {
  existingImages: ExistingImage[];
  setExistingImages: React.Dispatch<React.SetStateAction<ExistingImage[]>>;
  newImages: File[];
  setNewImages: React.Dispatch<React.SetStateAction<File[]>>;
  newImagePreviews: string[];
  setNewImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  setError: (error: string) => void;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UseProductImagesReturn {
  handleNewImageChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeNewImage: (index: number) => void;
  toggleExistingImage: (index: number) => void;
}

/**
 * Custom hook for managing product images
 * Handles image upload, conversion to WebP, preview generation, and deletion
 */
export function useProductImages({
  existingImages,
  setExistingImages,
  newImages,
  setNewImages,
  newImagePreviews,
  setNewImagePreviews,
  setError,
  setIsSubmitting,
}: UseProductImagesProps): UseProductImagesReturn {

  /**
   * Toggle deletion flag on existing image
   */
  const toggleExistingImage = useCallback((index: number) => {
    setExistingImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, markedForDeletion: !img.markedForDeletion } : img
      )
    );
  }, [setExistingImages]);

  /**
   * Remove a new image (not yet uploaded)
   */
  const removeNewImage = useCallback((index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, [setNewImages, setNewImagePreviews]);

  /**
   * Handle new image upload with validation and WebP conversion
   */
  const handleNewImageChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const invalidFiles = files.filter((file) => {
      const isValidType = validTypes.includes(file.type);
      const isHeicByExtension = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
      return !isValidType && !isHeicByExtension;
    });

    if (invalidFiles.length > 0) {
      setError('Please upload only JPG, PNG, WebP, or HEIC images');
      return;
    }

    // Check total image limit
    const totalImages =
      existingImages.filter((img) => !img.markedForDeletion).length +
      newImages.length +
      files.length;

    if (totalImages > 5) {
      setError('Maximum 5 images allowed in total');
      return;
    }

    setIsSubmitting(true);
    setError('Converting images...');

    try {
      // Convert all images to WebP
      const convertedFiles = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);

          const response = await fetch('/api/convert-image', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to convert ${file.name}`);
          }

          const blob = await response.blob();
          const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
          });

          return webpFile;
        })
      );

      setNewImages((prev) => [...prev, ...convertedFiles]);

      const previews = convertedFiles.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...previews]);
      setError('');
    } catch (error) {
      setError(`Image conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [existingImages, newImages, setNewImages, setNewImagePreviews, setError, setIsSubmitting]);

  return {
    handleNewImageChange,
    removeNewImage,
    toggleExistingImage,
  };
}
