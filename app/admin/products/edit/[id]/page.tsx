'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useProduct } from '@/hooks/useProducts';
import { ProductType, Era, Category, Condition, ProductTranslations } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import ProductPreviewModal from '@/components/ProductPreviewModal';
import UnifiedProductContentEditor from '@/components/admin/UnifiedProductContentEditor';
import DraggableSections from '@/components/admin/DraggableSections';
import { useImageDragAndDrop } from '@/hooks/useImageDragAndDrop';
import { useProductImages } from '@/hooks/useProductImages';
import { useProductFormState } from '@/hooks/useProductFormState';
import { useProductSubmit } from '@/hooks/useProductSubmit';
import BasicInfoSection from '@/components/admin/product-form/BasicInfoSection';
import SpecificationsSection from '@/components/admin/product-form/SpecificationsSection';
import PricingSection from '@/components/admin/product-form/PricingSection';
import DiscountSection from '@/components/admin/product-form/DiscountSection';
import ShippingSection from '@/components/admin/product-form/ShippingSection';
import TagsSection from '@/components/admin/product-form/TagsSection';

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
  // Shipping fields
  weightGrams: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  // Discount fields
  discountPrice: string;
  discountStartDate: string;
  discountEndDate: string;
}

interface ExistingImage {
  url: string;
  markedForDeletion: boolean;
}

const sections = [
  { id: 'basic-info', label: 'Basic Information' },
  { id: 'content', label: 'Product Content' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'pricing', label: 'Condition & Pricing' },
  { id: 'discount', label: 'Discount Pricing' },
  { id: 'shipping', label: 'Shipping Information' },
  { id: 'images', label: 'Images' },
  { id: 'tags', label: 'Tags & Options' },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const isNewProduct = productId === 'new';

  // TanStack Query hooks - only fetch if editing existing product
  // Pass undefined for new products to prevent fetching
  const { data: product, isLoading, error: fetchError, refetch } = useProduct(
    isNewProduct ? undefined : productId
  );

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    productType: '',
    title: '',
    description: '',
    brand: '',
    era: '',
    category: '',
    sizeLabel: '',
    specifications: {},
    condition: '',
    conditionNotes: '',
    price: '',
    tags: '',
    featured: false,
    inStock: true,
    weightGrams: '',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    discountPrice: '',
    discountStartDate: '',
    discountEndDate: '',
  });
  const [translations, setTranslations] = useState<ProductTranslations>({});

  // Image state
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);

  // Track initial state for change detection
  const [initialFormData, setInitialFormData] = useState<ProductFormData | null>(null);
  const [initialTranslations, setInitialTranslations] = useState<ProductTranslations>({});
  const [initialImages, setInitialImages] = useState<ExistingImage[]>([]);

  // Image drag and drop hook
  const { handleDragStart, handleDragOver, handleDrop } = useImageDragAndDrop({
    existingImages,
    setExistingImages,
    newImages,
    setNewImages,
    newImagePreviews,
    setNewImagePreviews,
  });


  // Image management hook
  const { handleNewImageChange, removeNewImage, toggleExistingImage } = useProductImages({
    existingImages,
    setExistingImages,
    newImages,
    setNewImages,
    newImagePreviews,
    setNewImagePreviews,
    setError,
    setIsSubmitting,
  });

  // Form state management hook
  const { handleInputChange, isSectionComplete, hasSectionChanges, hasAnyChanges } = useProductFormState({
    formData,
    setFormData,
    initialFormData,
    translations,
    initialTranslations,
    existingImages,
    initialImages,
    newImages,
    sections,
  });

  // Product submit hook
  const { handleSubmit, handleDelete, handleDuplicate, handleMarkAsSold, prepareProductData } = useProductSubmit({
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
  });

  // Load section order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('adminEditPageSectionOrder');
    if (savedOrder) {
      try {
        setSectionOrder(JSON.parse(savedOrder));
      } catch {
        setSectionOrder(sections.map(s => s.id));
      }
    } else {
      setSectionOrder(sections.map(s => s.id));
    }
  }, []);

  // Callback to update section order
  const handleSectionOrderChange = (newOrder: string[]) => {
    setSectionOrder(newOrder);
  };

  // Populate form when product loads (edit mode) or set defaults (new mode)
  useEffect(() => {
    if (isNewProduct) {
      // Set default values for new product
      const defaultData: ProductFormData = {
        productType: 'Clothing',
        title: '',
        description: '',
        brand: '',
        era: '',
        category: '',
        sizeLabel: '',
        specifications: {},
        condition: '',
        conditionNotes: '',
        price: '',
        tags: '',
        featured: false,
        inStock: true,
        weightGrams: '',
        lengthCm: '',
        widthCm: '',
        heightCm: '',
        discountPrice: '',
        discountStartDate: '',
        discountEndDate: '',
      };
      setFormData(defaultData);
      setInitialFormData(defaultData);
      setTranslations({});
      setInitialTranslations({});
    } else if (product) {
      // Load existing product data
      const initialData = {
        productType: product.productType,
        title: product.title,
        description: product.description,
        brand: product.brand,
        era: product.era,
        category: product.category,
        sizeLabel: product.size?.label || '',
        specifications: product.specifications
          ? Object.fromEntries(
              Object.entries(product.specifications).map(([k, v]) => [k, String(v)])
            )
          : {},
        condition: product.condition,
        conditionNotes: product.conditionNotes || '',
        price: product.price.toString(),
        tags: product.tags.join(', '),
        featured: product.featured,
        inStock: product.inStock,
        weightGrams: product.weightGrams?.toString() || '',
        lengthCm: product.lengthCm?.toString() || '',
        widthCm: product.widthCm?.toString() || '',
        heightCm: product.heightCm?.toString() || '',
        discountPrice: product.discountPrice?.toString() || '',
        discountStartDate: product.discountStartDate ? product.discountStartDate.toDate().toISOString().slice(0, 16) : '',
        discountEndDate: product.discountEndDate ? product.discountEndDate.toDate().toISOString().slice(0, 16) : '',
      };

      const initialTrans = product.translations || {};
      const initialImgs = product.images.map((url) => ({ url, markedForDeletion: false }));

      setFormData(initialData);
      setInitialFormData(initialData);

      setTranslations(initialTrans);
      setInitialTranslations(initialTrans);

      setExistingImages(initialImgs);
      setInitialImages(initialImgs);
    }
  }, [product, isNewProduct]);

  // Scroll to top when error or success message appears
  useEffect(() => {
    if (error || success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error, success]);

  const handlePreview = () => {
    // Don't validate for preview - just show what we have
    setShowPreview(true);
  };

  const getPreviewProduct = () => {
    const productData = prepareProductData();

    // Combine existing and new images for preview
    const previewImages = [
      ...existingImages.filter((img) => !img.markedForDeletion).map((img) => img.url),
      ...newImagePreviews,
    ];

    return {
      ...productData,
      title: productData.title || 'Product Title',
      description: productData.description || 'No description provided',
      brand: productData.brand || 'Brand Name',
      price: productData.price || 0,
      images: previewImages,
    };
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Loading state (skip for new product)
  if (!isNewProduct && isLoading) {
    return (
      <div className="max-w-4xl">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (skip for new product)
  if (!isNewProduct && (fetchError || !product)) {
    return (
      <div className="max-w-4xl">
        <ErrorState
          title="Unable to load product"
          message={fetchError?.message || 'Product not found'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex max-w-full px-4 sm:px-6">
      <div className={`max-w-4xl w-full ${!isNewProduct && isSidebarOpen ? 'mr-64' : ''}`}>
      {/* Header with breadcrumb */}
      <div className="mb-6 sm:mb-8">
        <nav className="text-xs sm:text-sm text-gray-500 mb-2">
          <button
            onClick={() => router.push('/admin/products')}
            className="hover:text-gray-700"
          >
            Products
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none inline-block align-bottom">
            {isNewProduct ? 'New Product' : `Edit ${product?.title}`}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isNewProduct ? 'Add New Product' : 'Edit Product'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              {isNewProduct ? 'Create a new product listing' : 'Update product information and images'}
            </p>
          </div>

          <button
            onClick={() => router.push('/admin/products')}
            className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm sm:text-base"
          >
            Back to Products
          </button>
        </div>
      </div>

      {/* Status messages - Sticky Banner */}
      {(error || success) && (
        <div className="sticky top-0 z-40 mb-6">
          {error && (
            <div className={`${error.toLowerCase().includes('converting') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-md shadow-lg`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  {error.toLowerCase().includes('converting') ? (
                    <svg className="animate-spin w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError('')}
                  className={`${error.toLowerCase().includes('converting') ? 'text-blue-700 hover:text-blue-900' : 'text-red-700 hover:text-red-900'} ml-4`}
                  aria-label="Dismiss"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Product updated successfully!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="text-green-700 hover:text-green-900 ml-4"
                  aria-label="Dismiss"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6 sm:space-y-8" style={{ display: 'flex', flexDirection: 'column' }}>
        <BasicInfoSection
          productType={formData.productType}
          brand={formData.brand}
          era={formData.era}
          category={formData.category}
          sizeLabel={formData.sizeLabel}
          onChange={handleInputChange}
          sectionOrder={sectionOrder}
        />

        {/* Product Content (multilingual) */}
        <section id="content" style={{ order: sectionOrder.indexOf('content') }}>
        <UnifiedProductContentEditor
          baseTitle={formData.title}
          baseDescription={formData.description}
          baseConditionNotes={formData.conditionNotes}
          onBaseTitleChange={(value) => setFormData({ ...formData, title: value })}
          onBaseDescriptionChange={(value) => setFormData({ ...formData, description: value })}
          onBaseConditionNotesChange={(value) => setFormData({ ...formData, conditionNotes: value })}
          translations={translations}
          onTranslationsChange={setTranslations}
        />
        </section>

        {/* Specifications */}
        {formData.productType && (
          <SpecificationsSection
            productType={formData.productType}
            specifications={formData.specifications}
            onChange={handleInputChange}
            sectionOrder={sectionOrder}
          />
        )}

        <PricingSection
          condition={formData.condition}
          price={formData.price}
          onChange={handleInputChange}
          sectionOrder={sectionOrder}
        />

        <DiscountSection
          discountPrice={formData.discountPrice}
          discountStartDate={formData.discountStartDate}
          discountEndDate={formData.discountEndDate}
          regularPrice={formData.price}
          onChange={handleInputChange}
          sectionOrder={sectionOrder}
        />

        <ShippingSection
          weightGrams={formData.weightGrams}
          lengthCm={formData.lengthCm}
          widthCm={formData.widthCm}
          heightCm={formData.heightCm}
          onChange={handleInputChange}
          sectionOrder={sectionOrder}
        />

        {/* Images */}
        <section id="images" className="bg-white rounded-lg shadow p-4 sm:p-6" style={{ order: sectionOrder.indexOf('images') }}>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Images <span className="text-red-500">*</span>
          </h2>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Current Images
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                Drag images to reorder. Click to mark for deletion. The first image will be the main product image.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {existingImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative group cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index, 'existing')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index, 'existing')}
                  >
                    <div
                      className={`relative aspect-square border-2 ${
                        img.markedForDeletion
                          ? 'border-red-400'
                          : 'border-transparent hover:border-blue-400'
                      } rounded-md transition-colors`}
                      onClick={() => toggleExistingImage(index)}
                    >
                      <Image
                        src={img.url}
                        alt={`Existing ${index + 1}`}
                        fill
                        className={`object-cover rounded-md transition-opacity ${
                          img.markedForDeletion ? 'opacity-30' : ''
                        }`}
                      />
                      {index === 0 && !img.markedForDeletion && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
                          Main
                        </div>
                      )}
                      {img.markedForDeletion && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Will Remove
                          </div>
                        </div>
                      )}
                      {!img.markedForDeletion && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-md pointer-events-none">
                          <svg
                            className="w-8 h-8 text-white drop-shadow-lg"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-1">#{index + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="images"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Add New Images (Max 5 total)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                JPG/PNG/WebP/HEIC - automatically converted to WebP
              </p>
              <input
                type="file"
                id="images"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                multiple
                onChange={handleNewImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {newImagePreviews.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">New Images</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  Drag to reorder. These will be added after existing images.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {newImagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group cursor-move"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index, 'new')}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index, 'new')}
                    >
                      <div className="relative aspect-square border-2 border-transparent hover:border-blue-400 rounded-md transition-colors">
                        <Image
                          src={preview}
                          alt={`New preview ${index + 1}`}
                          fill
                          className="object-cover rounded-md"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-md pointer-events-none">
                          <svg
                            className="w-8 h-8 text-white drop-shadow-lg"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        aria-label="Remove image"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <p className="text-center text-xs text-gray-500 mt-1">
                        #{existingImages.filter((img) => !img.markedForDeletion).length + index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <TagsSection
          tags={formData.tags}
          featured={formData.featured}
          inStock={formData.inStock}
          onChange={handleInputChange}
          sectionOrder={sectionOrder}
        />

        {/* Form Actions */}
        <section id="actions" className="bg-white rounded-lg shadow p-4 sm:p-6" style={{ order: 9999 }}>
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                type="button"
                onClick={handlePreview}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>

              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back to Products
              </button>
            </div>

            {/* Additional Actions - Only show for existing products */}
            {!isNewProduct && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Additional Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleMarkAsSold}
                    disabled={isSubmitting || !formData.inStock}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Mark as Sold
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDuplicateConfirm(true)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Duplicate Product
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Product?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{product?.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Confirmation Modal */}
      {showDuplicateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Duplicate Product?
            </h3>
            <p className="text-gray-600 mb-6">
              This will create a copy of &quot;{product?.title}&quot; with the title &quot;{product?.title} (Copy)&quot;.
              You can edit the duplicate after creation.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDuplicateConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Duplicate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <ProductPreviewModal
          product={getPreviewProduct()}
          onClose={() => setShowPreview(false)}
        />
      )}
      </div>

      {/* Collapsible Right Sidebar */}
      {(
        <>
          <aside
            className={`fixed right-0 top-0 h-screen bg-amber-50/80 backdrop-blur-sm border-l-4 border-double border-amber-800/30 shadow-sm transition-transform duration-300 ${
              isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            } w-64 z-40`}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="p-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Page Index</h2>
                </div>
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close sidebar"
                >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                </button>
              </div>

              {/* Sidebar Links */}
              <nav className="flex-1 mt-6">
                <DraggableSections
                  sections={sections}
                  onSectionClick={scrollToSection}
                  isSectionComplete={isSectionComplete}
                  hasSectionChanges={hasSectionChanges}
                  onOrderChange={handleSectionOrderChange}
                />
              </nav>

              {/* Sidebar Footer with Save Button */}
              <div className="mt-auto pt-6 px-6 pb-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const form = document.querySelector('form');
                    if (form) {
                      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }}
                  disabled={isSubmitting || (!isNewProduct && !hasAnyChanges())}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {isNewProduct ? 'Creating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d={isNewProduct ? "M12 4v16m8-8H4" : "M5 13l4 4L19 7"} />
                      </svg>
                      {isNewProduct ? 'Create Product' : 'Save Changes'}
                    </>
                  )}
                </button>
                {isNewProduct ? (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Ready to create new product
                  </p>
                ) : hasAnyChanges() ? (
                  <p className="text-xs text-amber-600 mt-2 text-center">
                    You have unsaved changes
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    No unsaved changes
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* Toggle Button (visible when sidebar is closed) */}
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="fixed right-0 top-0 h-screen w-8 bg-amber-50/80 backdrop-blur-sm border-l-4 border-double border-amber-800/30 shadow-sm hover:w-12 transition-all duration-300 flex items-center justify-center z-40"
              aria-label="Open sidebar"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}
