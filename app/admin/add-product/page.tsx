'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addProduct } from '@/services/productService';
import { ERAS, CATEGORIES_BY_TYPE, CONDITIONS, PRODUCT_TYPES } from '@/lib/constants';
import { Era, Category, Condition, ProductType, ProductTranslations } from '@/types';
import Image from 'next/image';
import ProductPreviewModal from '@/components/ProductPreviewModal';
import UnifiedProductContentEditor from '@/components/admin/UnifiedProductContentEditor';
import { Timestamp } from 'firebase/firestore';

interface ProductFormData {
  productType: ProductType | '';
  title: string;
  description: string;
  brand: string;
  era: Era | '';
  category: Category | '';
  sizeLabel: string;
  specifications: Record<string, string>;  // Generic key-value pairs
  condition: Condition | '';
  conditionNotes: string;
  price: string;
  tags: string;
  featured: boolean;
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

// Specification fields based on product type
const SPECIFICATION_FIELDS: Record<ProductType, string[]> = {
  'Clothing': ['chest', 'waist', 'hips', 'length', 'shoulders', 'sleeves'],
  'Furniture': ['height', 'width', 'depth'],
  'Jewelry': ['material', 'stone', 'size'],
  'Vinyl Records': ['format', 'rpm', 'label', 'year'],
  'Electronics': ['model', 'year', 'condition', 'working'],
  'Books': ['author', 'publisher', 'year', 'isbn'],
  'Art': ['artist', 'medium', 'dimensions', 'year'],
  'Collectibles': ['manufacturer', 'year', 'edition', 'quantity'],
  'Other': [],
};

const INITIAL_FORM_DATA: ProductFormData = {
  productType: 'Clothing',  // Default to Clothing
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
  weightGrams: '',
  lengthCm: '',
  widthCm: '',
  heightCm: '',
  discountPrice: '',
  discountStartDate: '',
  discountEndDate: '',
};

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);
  const [translations, setTranslations] = useState<ProductTranslations>({});
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Scroll to top when error or success message appears
  useEffect(() => {
    if (error || success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error, success]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'productType') {
      // Reset specifications and category when product type changes
      setFormData((prev) => ({
        ...prev,
        productType: value as ProductType,
        category: '', // Reset category
        specifications: {},
      }));
    } else if (name.startsWith('specifications.')) {
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
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
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

    // Limit to 5 images
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
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

      setImages(convertedFiles);

      // Create preview URLs
      const previews = convertedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
      setError('');
    } catch (error) {
      setError(`Image conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      const [movedPreview] = newPreviews.splice(fromIndex, 1);
      newPreviews.splice(toIndex, 0, movedPreview);
      return newPreviews;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== toIndex) {
      moveImage(fromIndex, toIndex);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.condition) {
      setError('Condition is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (images.length === 0) {
      setError('At least one image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    // Validate required dropdown fields
    if (!formData.productType || !formData.era || !formData.category || !formData.condition) {
      setError('Please select product type, era, category, and condition');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare specifications - filter out empty values and parse numbers
      const specifications: Record<string, string | number> = {};
      Object.entries(formData.specifications).forEach(([key, value]) => {
        if (value && value.trim()) {
          // Strip common unit suffixes (cm, in, inches, ") before parsing
          const cleanedValue = value.trim().replace(/\s*(cm|in|inches|")\s*$/i, '');
          const numValue = parseFloat(cleanedValue);
          specifications[key] = isNaN(numValue) ? value.trim() : numValue;
        }
      });

      // TypeScript now knows these are not empty strings due to the check above
      const productType: ProductType = formData.productType;
      const era: Era = formData.era;
      const category: Category = formData.category;
      const condition: Condition = formData.condition;

      // Prepare product data
      const productData = {
        productType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        brand: formData.brand.trim(),
        era,
        category,
        // Only include size if sizeLabel is provided
        ...(formData.sizeLabel.trim() && {
          size: {
            label: formData.sizeLabel.trim(),
            specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
          },
        }),
        // Include top-level specifications if any
        ...(Object.keys(specifications).length > 0 && { specifications }),
        condition,
        conditionNotes: formData.conditionNotes.trim(),
        price: parseFloat(formData.price),
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        featured: formData.featured,
        inStock: true,
        // Include shipping dimensions if provided
        ...(formData.weightGrams && { weightGrams: parseFloat(formData.weightGrams) }),
        ...(formData.lengthCm && { lengthCm: parseFloat(formData.lengthCm) }),
        ...(formData.widthCm && { widthCm: parseFloat(formData.widthCm) }),
        ...(formData.heightCm && { heightCm: parseFloat(formData.heightCm) }),
        // Include discount if provided
        ...(formData.discountPrice && { discountPrice: parseFloat(formData.discountPrice) }),
        ...(formData.discountStartDate && { discountStartDate: Timestamp.fromDate(new Date(formData.discountStartDate)) }),
        ...(formData.discountEndDate && { discountEndDate: Timestamp.fromDate(new Date(formData.discountEndDate)) }),
        // Include translations if any exist
        ...(Object.keys(translations).length > 0 && { translations }),
      };

      const result = await addProduct(productData, images);

      if (!result.success) {
        setError(result.error || 'Failed to add product');
        return;
      }

      setSuccess(true);
      setFormData(INITIAL_FORM_DATA);
      setTranslations({});
      setImages([]);
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImagePreviews([]);

      // Redirect to products page after 2 seconds
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setImages([]);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setError('');
    setSuccess(false);
  };

  const handlePreview = () => {
    // Don't validate for preview - just show what we have
    setShowPreview(true);
  };

  const getPreviewProduct = () => {
    // Prepare specifications
    const specifications: Record<string, string | number> = {};
    Object.entries(formData.specifications).forEach(([key, value]) => {
      if (value && value.trim()) {
        const cleanedValue = value.trim().replace(/\s*(cm|in|inches|")\s*$/i, '');
        const numValue = parseFloat(cleanedValue);
        specifications[key] = isNaN(numValue) ? value.trim() : numValue;
      }
    });

    return {
      productType: formData.productType as ProductType,
      title: formData.title || 'Product Title',
      description: formData.description || 'No description provided',
      brand: formData.brand || 'Brand Name',
      era: formData.era as Era,
      category: formData.category as Category,
      sizeLabel: formData.sizeLabel,
      specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
      condition: formData.condition as Condition,
      conditionNotes: formData.conditionNotes,
      price: parseFloat(formData.price) || 0,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      featured: formData.featured,
      inStock: true,
      images: imagePreviews,
    };
  };

  return (
    <div className="max-w-4xl px-4 sm:px-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Upload a new vintage item to your inventory
        </p>
      </div>

      {/* Status messages - Sticky Banner */}
      {(error || success) && (
        <div className="sticky top-0 z-40 mb-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-700 hover:text-red-900 ml-4"
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
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Product added successfully! Redirecting to products page...</span>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="productType"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Product Type <span className="text-red-500">*</span>
              </label>
              <select
                id="productType"
                name="productType"
                value={formData.productType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select product type</option>
                {PRODUCT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Select the type of vintage item you&apos;re adding
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="brand"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Brand
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Levi's"
                />
              </div>

              <div>
                <label
                  htmlFor="era"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Era
                </label>
                <select
                  id="era"
                  name="era"
                  value={formData.era}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select era</option>
                  {ERAS.map((era) => (
                    <option key={era} value={era}>
                      {era}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!formData.productType}
                >
                  <option value="">
                    {formData.productType ? 'Select category' : 'Select product type first'}
                  </option>
                  {formData.productType &&
                    CATEGORIES_BY_TYPE[formData.productType].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="sizeLabel"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Size Label
                </label>
                <input
                  type="text"
                  id="sizeLabel"
                  name="sizeLabel"
                  value={formData.sizeLabel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., M, 32x34"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Content (multilingual) */}
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

        {/* Specifications */}
        {formData.productType && SPECIFICATION_FIELDS[formData.productType].length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Specifications (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Add relevant details for this {formData.productType.toLowerCase()} item
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {SPECIFICATION_FIELDS[formData.productType].map((field) => {
                // Determine if this field is a measurement that needs cm indicator
                const isMeasurement = ['chest', 'waist', 'hips', 'length', 'shoulders', 'sleeves', 'height', 'width', 'depth', 'dimensions', 'size'].includes(field);

                return (
                  <div key={field}>
                    <label
                      htmlFor={`specifications.${field}`}
                      className="block text-sm font-medium text-gray-700 mb-2 capitalize"
                    >
                      {field}
                      {isMeasurement && <span className="text-gray-500 text-xs ml-1">(cm)</span>}
                    </label>
                    <input
                      type="text"
                      id={`specifications.${field}`}
                      name={`specifications.${field}`}
                      value={formData.specifications[field] || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={isMeasurement ? `e.g., 91 (cm)` : `Enter ${field}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Condition & Pricing */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Condition & Pricing
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="condition"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select condition</option>
                  {CONDITIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Price (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="99.99"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Discount Pricing */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Discount Pricing (Optional)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Set a discounted price with optional start and end dates for sales or promotions.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="discountPrice"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Discount Price (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="discountPrice"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 79.99"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be lower than regular price (€{formData.price || '0.00'})
                </p>
              </div>

              <div>
                <label
                  htmlFor="discountStartDate"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  id="discountStartDate"
                  name="discountStartDate"
                  value={formData.discountStartDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  When discount becomes active
                </p>
              </div>

              <div>
                <label
                  htmlFor="discountEndDate"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  End Date
                </label>
                <input
                  type="datetime-local"
                  id="discountEndDate"
                  name="discountEndDate"
                  value={formData.discountEndDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  When discount expires
                </p>
              </div>
            </div>

            {/* Discount Preview */}
            {formData.discountPrice && parseFloat(formData.discountPrice) > 0 && parseFloat(formData.discountPrice) < parseFloat(formData.price || '0') && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm font-medium text-green-900">
                  Discount Preview:
                  <span className="ml-2 line-through text-gray-500">€{parseFloat(formData.price || '0').toFixed(2)}</span>
                  <span className="ml-2 text-green-700 font-bold">€{parseFloat(formData.discountPrice).toFixed(2)}</span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    -{Math.round(((parseFloat(formData.price || '0') - parseFloat(formData.discountPrice)) / parseFloat(formData.price || '1')) * 100)}%
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Shipping Information
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Add weight and dimensions for accurate shipping cost calculation. Weight is especially important.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="weightGrams"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Weight (grams) <span className="text-amber-600">*recommended</span>
                </label>
                <input
                  type="number"
                  step="1"
                  id="weightGrams"
                  name="weightGrams"
                  value={formData.weightGrams}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Used for shipping cost calculation. Defaults to 500g if not specified.
                </p>
              </div>

              <div>
                <label
                  htmlFor="lengthCm"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Length (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="lengthCm"
                  name="lengthCm"
                  value={formData.lengthCm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 30"
                />
              </div>

              <div>
                <label
                  htmlFor="widthCm"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Width (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="widthCm"
                  name="widthCm"
                  value={formData.widthCm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 25"
                />
              </div>

              <div>
                <label
                  htmlFor="heightCm"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="heightCm"
                  name="heightCm"
                  value={formData.heightCm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Images <span className="text-red-500">*</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="images"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Upload Images (Max 5)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                JPG/PNG/WebP/HEIC - automatically converted to WebP
              </p>
              <input
                type="file"
                id="images"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {imagePreviews.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  Drag images to reorder them. The first image will be the main product image.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group cursor-move"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="relative aspect-square border-2 border-transparent hover:border-blue-400 rounded-md transition-colors">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-md"
                        />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
                            Main
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-md">
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
                        onClick={() => removeImage(index)}
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
                      <p className="text-center text-xs text-gray-500 mt-1">#{index + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags & Options */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Tags & Options
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="vintage, denim, americana, workwear"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="featured"
                className="ml-2 block text-sm text-gray-700"
              >
                Feature this product on homepage
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
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

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                  Uploading...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <ProductPreviewModal
          product={getPreviewProduct()}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
