import { useCallback } from 'react';

interface UseImageDragAndDropProps<T> {
  existingImages: T[];
  setExistingImages: React.Dispatch<React.SetStateAction<T[]>>;
  newImages: File[];
  setNewImages: React.Dispatch<React.SetStateAction<File[]>>;
  newImagePreviews: string[];
  setNewImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
}

interface UseImageDragAndDropReturn {
  handleDragStart: (e: React.DragEvent, index: number, type: 'existing' | 'new') => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, toIndex: number, type: 'existing' | 'new') => void;
  moveExistingImage: (fromIndex: number, toIndex: number) => void;
  moveNewImage: (fromIndex: number, toIndex: number) => void;
}

/**
 * Custom hook for handling drag-and-drop reordering of images
 * Supports both existing images (from database) and new images (pending upload)
 */
export function useImageDragAndDrop<T>({
  existingImages,
  setExistingImages,
  newImages,
  setNewImages,
  newImagePreviews,
  setNewImagePreviews,
}: UseImageDragAndDropProps<T>): UseImageDragAndDropReturn {

  const moveExistingImage = useCallback((fromIndex: number, toIndex: number) => {
    setExistingImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  }, [setExistingImages]);

  const moveNewImage = useCallback((fromIndex: number, toIndex: number) => {
    setNewImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
    setNewImagePreviews((prev) => {
      const newPreviews = [...prev];
      const [movedPreview] = newPreviews.splice(fromIndex, 1);
      newPreviews.splice(toIndex, 0, movedPreview);
      return newPreviews;
    });
  }, [setNewImages, setNewImagePreviews]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number, type: 'existing' | 'new') => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, type }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number, type: 'existing' | 'new') => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const fromIndex = data.index;
    const fromType = data.type;

    if (fromType === type && fromIndex !== toIndex) {
      if (type === 'existing') {
        moveExistingImage(fromIndex, toIndex);
      } else {
        moveNewImage(fromIndex, toIndex);
      }
    }
  }, [moveExistingImage, moveNewImage]);

  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    moveExistingImage,
    moveNewImage,
  };
}
