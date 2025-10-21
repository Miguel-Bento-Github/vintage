'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addProduct } from '@/services/productService';
import { ERAS, CATEGORIES, CONDITIONS } from '@/lib/constants';
import { Era, Category, Condition } from '@/types';
import Image from 'next/image';

interface ProductFormData {
  title: string;
  description: string;
  brand: string;
  era: Era | '';
  category: Category | '';
  sizeLabel: string;
  measurements: {
    chest: string;
    waist: string;
    hips: string;
    length: string;
    shoulders: string;
    sleeves: string;
  };
  condition: Condition | '';
  conditionNotes: string;
  price: string;
  tags: string;
  featured: boolean;
}

const INITIAL_FORM_DATA: ProductFormData = {
  title: '',
  description: '',
  brand: '',
  era: '',
  category: '',
  sizeLabel: '',
  measurements: {
    chest: '',
    waist: '',
    hips: '',
    length: '',
    shoulders: '',
    sleeves: '',
  },
  condition: '',
  conditionNotes: '',
  price: '',
  tags: '',
  featured: false,
};

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    } else if (name.startsWith('measurements.')) {
      const measurementKey = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [measurementKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setError('Please upload only JPG, PNG, or WebP images');
      return;
    }

    // Limit to 5 images
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setImages(files);

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    setError('');
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
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
    if (!formData.brand.trim()) {
      setError('Brand is required');
      return false;
    }
    if (!formData.era) {
      setError('Era is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
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
    if (!formData.era || !formData.category || !formData.condition) {
      setError('Please select era, category, and condition');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare measurements - filter out empty values
      const measurements: Record<string, number> = {};
      if (formData.measurements.chest) {
        measurements.chest = parseFloat(formData.measurements.chest);
      }
      if (formData.measurements.waist) {
        measurements.waist = parseFloat(formData.measurements.waist);
      }
      if (formData.measurements.hips) {
        measurements.hips = parseFloat(formData.measurements.hips);
      }
      if (formData.measurements.length) {
        measurements.length = parseFloat(formData.measurements.length);
      }
      if (formData.measurements.shoulders) {
        measurements.shoulders = parseFloat(formData.measurements.shoulders);
      }
      if (formData.measurements.sleeves) {
        measurements.sleeves = parseFloat(formData.measurements.sleeves);
      }

      // TypeScript now knows these are not empty strings due to the check above
      const era: Era = formData.era;
      const category: Category = formData.category;
      const condition: Condition = formData.condition;

      // Prepare product data
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        brand: formData.brand.trim(),
        era,
        category,
        size: {
          label: formData.sizeLabel.trim(),
          measurements,
        },
        condition,
        conditionNotes: formData.conditionNotes.trim(),
        price: parseFloat(formData.price),
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        featured: formData.featured,
        inStock: true,
      };

      const result = await addProduct(productData, images);

      if (!result.success) {
        setError(result.error || 'Failed to add product');
        return;
      }

      setSuccess(true);
      setFormData(INITIAL_FORM_DATA);
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

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-2">
          Upload a new vintage item to your inventory
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          Product added successfully! Redirecting to products page...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Vintage Levi's 501 Jeans"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the item, its history, unique features..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="brand"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Levi's"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="era"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Era <span className="text-red-500">*</span>
                </label>
                <select
                  id="era"
                  name="era"
                  value={formData.era}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((category) => (
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

        {/* Measurements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Measurements (cm)
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="measurements.chest"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Chest
              </label>
              <input
                type="number"
                step="0.1"
                id="measurements.chest"
                name="measurements.chest"
                value={formData.measurements.chest}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="22"
              />
            </div>

            <div>
              <label
                htmlFor="measurements.waist"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Waist
              </label>
              <input
                type="number"
                step="0.1"
                id="measurements.waist"
                name="measurements.waist"
                value={formData.measurements.waist}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="18"
              />
            </div>

            <div>
              <label
                htmlFor="measurements.hips"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hips
              </label>
              <input
                type="number"
                step="0.1"
                id="measurements.hips"
                name="measurements.hips"
                value={formData.measurements.hips}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="20"
              />
            </div>

            <div>
              <label
                htmlFor="measurements.length"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Length
              </label>
              <input
                type="number"
                step="0.1"
                id="measurements.length"
                name="measurements.length"
                value={formData.measurements.length}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="28"
              />
            </div>

            <div>
              <label
                htmlFor="measurements.shoulders"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Shoulders
              </label>
              <input
                type="number"
                step="0.1"
                id="measurements.shoulders"
                name="measurements.shoulders"
                value={formData.measurements.shoulders}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="17"
              />
            </div>

            <div>
              <label
                htmlFor="measurements.sleeves"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sleeves
              </label>
              <input
                type="number"
                step="0.1"
                id="measurements.sleeves"
                name="measurements.sleeves"
                value={formData.measurements.sleeves}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="24"
              />
            </div>
          </div>
        </div>

        {/* Condition & Pricing */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
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

            <div>
              <label
                htmlFor="conditionNotes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Condition Notes
              </label>
              <textarea
                id="conditionNotes"
                name="conditionNotes"
                value={formData.conditionNotes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any flaws, repairs, or notable details about the condition..."
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Images <span className="text-red-500">*</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="images"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Upload Images (Max 5, JPG/PNG/WebP)
              </label>
              <input
                type="file"
                id="images"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tags & Options */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
      </form>
    </div>
  );
}
