'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductType, Era, Category, Condition } from '@/types';

interface PreviewProduct {
  productType: ProductType;
  title: string;
  description: string;
  brand: string;
  era: Era;
  category: Category;
  sizeLabel?: string;
  specifications?: Record<string, string | number>;
  condition: Condition;
  conditionNotes?: string;
  price: number;
  tags?: string[];
  featured?: boolean;
  inStock?: boolean;
  images: string[]; // Can be URLs or blob URLs for previews
}

interface ProductPreviewModalProps {
  product: PreviewProduct;
  onClose: () => void;
}

export default function ProductPreviewModal({ product, onClose }: ProductPreviewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Preview</h2>
            <p className="text-sm text-gray-500 mt-1">This is how your product will appear to customers</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close preview"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.images.length > 0 ? (
                  <>
                    <Image
                      src={product.images[currentImageIndex]}
                      alt={`${product.title} - Image ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />

                    {/* Navigation Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                          aria-label="Previous image"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                          aria-label="Next image"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {product.images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {product.images.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>No images uploaded</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square bg-gray-100 rounded-md overflow-hidden border-2 transition ${
                        currentImageIndex === index
                          ? 'border-blue-500'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.featured && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                    Featured
                  </span>
                )}
                {product.inStock !== undefined && (
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    product.inStock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Sold'}
                  </span>
                )}
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {product.productType}
                </span>
              </div>

              {/* Title & Brand */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.title || 'Product Title'}
                </h1>
                <p className="text-lg text-gray-600">{product.brand || 'Brand Name'}</p>
              </div>

              {/* Price */}
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  €{product.price.toFixed(2)}
                </p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Era</p>
                  <p className="text-base font-medium text-gray-900">{product.era || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-base font-medium text-gray-900">{product.category || 'N/A'}</p>
                </div>
                {product.sizeLabel && (
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="text-base font-medium text-gray-900">{product.sizeLabel}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="text-base font-medium text-gray-900">{product.condition || 'N/A'}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {product.description || 'No description provided'}
                </p>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-500 capitalize">{key}</p>
                        <p className="text-base font-medium text-gray-900">
                          {typeof value === 'number' ? `${value} cm` : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Condition Notes */}
              {product.conditionNotes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Condition Notes</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm whitespace-pre-line">
                      {product.conditionNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons (Preview Only) */}
              <div className="pt-4 space-y-3">
                <button
                  disabled
                  className="w-full px-6 py-3 bg-amber-700 text-white rounded-md font-semibold opacity-50 cursor-not-allowed"
                >
                  Add to Cart (Preview Mode)
                </button>
                <p className="text-center text-sm text-gray-500">
                  This is a preview. Buttons are disabled.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
