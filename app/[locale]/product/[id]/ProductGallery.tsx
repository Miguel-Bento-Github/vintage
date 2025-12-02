'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const openLightbox = () => {
    setIsLightboxOpen(true);
    setTimeout(() => setIsVisible(true), 10);
    const params = new URLSearchParams(searchParams.toString());
    params.set('lightbox', 'true');
    params.set('image', selectedImage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const updateImageInUrl = useCallback((index: number) => {
    if (isLightboxOpen) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('image', index.toString());
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [isLightboxOpen, searchParams, router]);

  const handlePrevious = useCallback(() => {
    setSelectedImage((prev) => {
      const newIndex = prev > 0 ? prev - 1 : images.length - 1;
      updateImageInUrl(newIndex);
      return newIndex;
    });
  }, [images.length, updateImageInUrl]);

  const handleNext = useCallback(() => {
    setSelectedImage((prev) => {
      const newIndex = prev < images.length - 1 ? prev + 1 : 0;
      updateImageInUrl(newIndex);
      return newIndex;
    });
  }, [images.length, updateImageInUrl]);

  const closeLightbox = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setIsLightboxOpen(false), 150);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('lightbox');
    params.delete('image');
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Check URL parameter on mount
  useEffect(() => {
    if (searchParams.get('lightbox') === 'true') {
      const imageIndex = parseInt(searchParams.get('image') || '0', 10);
      if (imageIndex >= 0 && imageIndex < images.length) {
        setSelectedImage(imageIndex);
      }
      setIsLightboxOpen(true);
      setTimeout(() => setIsVisible(true), 10);
    }
  }, [searchParams, images.length]);

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrevious, handleNext, closeLightbox]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
          onClick={openLightbox}
        >
          <Image
            src={images[selectedImage]}
            alt={`${title} - Image ${selectedImage + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImage(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden transition-all ${
                  selectedImage === index
                    ? 'ring-2 ring-amber-700'
                    : 'hover:ring-2 hover:ring-gray-300'
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} thumbnail ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 12vw"
                  loading="lazy"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal - rendered as portal to escape stacking context */}
      {isLightboxOpen && createPortal(
        <div
          className={`fixed inset-0 z-50 backdrop-blur-md bg-amber-50/40 p-4 md:p-12 transition-opacity duration-150 ease-in-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 text-white bg-gray-900/80 hover:bg-gray-900 rounded-full p-3 shadow-lg transition-colors"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-amber-900 bg-amber-100/90 px-4 py-2 rounded-lg text-sm">
            {selectedImage + 1} / {images.length}
          </div>

          {/* Main image */}
          <Image
            src={images[selectedImage]}
            alt={`${title} - Image ${selectedImage + 1}`}
            fill
            className="object-contain"
            onClick={(e) => e.stopPropagation()}
            priority
          />

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900 bg-amber-100/90 rounded-lg p-3"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-900 bg-amber-100/90 rounded-lg p-3"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                    setTimeout(() => updateImageInUrl(index), 0);
                  }}
                  className={`relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-amber-700' : ''
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
