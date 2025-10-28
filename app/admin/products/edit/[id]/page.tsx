'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { uploadProductImages, deleteProductImage, addProduct } from '@/services/productService';
import { ERAS, CATEGORIES_BY_TYPE, CONDITIONS, PRODUCT_TYPES } from '@/lib/constants';
import { Era, Category, Condition, ProductType, Product, ProductTranslations } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import ProductPreviewModal from '@/components/ProductPreviewModal';
import RichTextEditor from '@/components/RichTextEditor';
import ProductTranslationEditor from '@/components/admin/ProductTranslationEditor';

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
}

// Specification fields based on product type
const SPECIFICATION_FIELDS: Record<ProductType, string[]> = {
  'Clothing': ['chest', 'waist', 'hips', 'length', 'shoulders', 'sleeves'],
  'Furniture': ['height', 'width', 'depth', 'weight'],
  'Jewelry': ['material', 'stone', 'size', 'weight'],
  'Vinyl Records': ['format', 'rpm', 'label', 'year'],
  'Electronics': ['model', 'year', 'condition', 'working'],
  'Books': ['author', 'publisher', 'year', 'isbn'],
  'Art': ['artist', 'medium', 'dimensions', 'year'],
  'Collectibles': ['manufacturer', 'year', 'edition', 'quantity'],
  'Other': [],
};

interface ExistingImage {
  url: string;
  markedForDeletion: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  // TanStack Query hooks
  const { data: product, isLoading, error: fetchError, refetch } = useProduct(productId);
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

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

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setFormData({
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
      });

      setTranslations(product.translations || {});

      setExistingImages(
        product.images.map((url) => ({ url, markedForDeletion: false }))
      );
    }
  }, [product]);

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
      setFormData((prev) => ({
        ...prev,
        productType: value as ProductType,
        category: '',
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

  const toggleExistingImage = (index: number) => {
    setExistingImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, markedForDeletion: !img.markedForDeletion } : img
      )
    );
  };

  const handleNewImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setError('Please upload only JPG, PNG, or WebP images');
      return;
    }

    const totalImages =
      existingImages.filter((img) => !img.markedForDeletion).length +
      newImages.length +
      files.length;

    if (totalImages > 5) {
      setError('Maximum 5 images allowed in total');
      return;
    }

    setNewImages((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);
    setError('');
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveExistingImage = (fromIndex: number, toIndex: number) => {
    setExistingImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const moveNewImage = (fromIndex: number, toIndex: number) => {
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
  };

  const handleDragStart = (e: React.DragEvent, index: number, type: 'existing' | 'new') => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, type }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number, type: 'existing' | 'new') => {
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

    const remainingImages = existingImages.filter((img) => !img.markedForDeletion).length;
    if (remainingImages + newImages.length === 0) {
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

    if (!formData.productType || !formData.era || !formData.category || !formData.condition) {
      setError('Please select product type, era, category, and condition');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare specifications
      const specifications: Record<string, string | number> = {};
      Object.entries(formData.specifications).forEach(([key, value]) => {
        if (value && value.trim()) {
          const cleanedValue = value.trim().replace(/\s*(cm|in|inches|")\s*$/i, '');
          const numValue = parseFloat(cleanedValue);
          specifications[key] = isNaN(numValue) ? value.trim() : numValue;
        }
      });

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

      // Prepare update data
      const productType: ProductType = formData.productType;
      const era: Era = formData.era;
      const category: Category = formData.category;
      const condition: Condition = formData.condition;

      const updateData = {
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
        images: finalImages,
        // Include translations if any exist
        ...(Object.keys(translations).length > 0 && { translations }),
      };

      // Update product using mutation
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

      // Redirect after success
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      await deleteProductMutation.mutateAsync(productId);
      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      setShowDeleteConfirm(false);
    }
  };

  const handleDuplicate = async () => {
    if (!product) return;

    setIsSubmitting(true);
    try {
      // Create a copy without the id and with modified title
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
        featured: false, // Don't duplicate featured status
        inStock: true,
        images: product.images, // Reuse same images
      };

      const result = await addProduct(duplicateData, []);

      if (!result.success) {
        throw new Error(result.error || 'Failed to duplicate product');
      }

      // Redirect to the new product's edit page
      router.push(`/admin/products/edit/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate product');
      setShowDuplicateConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsSold = async () => {
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

    // Combine existing and new images for preview
    const previewImages = [
      ...existingImages.filter((img) => !img.markedForDeletion).map((img) => img.url),
      ...newImagePreviews,
    ];

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
      inStock: formData.inStock,
      images: previewImages,
    };
  };

  // Loading state
  if (isLoading) {
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

  // Error state
  if (fetchError || !product) {
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
    <div className="max-w-4xl">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="text-sm text-gray-500 mb-2">
          <button
            onClick={() => router.push('/admin/products')}
            className="hover:text-gray-700"
          >
            Products
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Edit {product.title}</span>
        </nav>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600 mt-2">Update product information and images</p>
          </div>

          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Back to Products
          </button>
        </div>
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
                <span>Product updated successfully! Redirecting to products page...</span>
              </div>
            </div>
          )}
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
            </div>

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
              <RichTextEditor
                content={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
              />
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

        {/* Specifications */}
        {formData.productType && SPECIFICATION_FIELDS[formData.productType].length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Specifications (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Add relevant details for this {formData.productType.toLowerCase()} item
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SPECIFICATION_FIELDS[formData.productType].map((field) => {
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

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Current Images
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Drag images to reorder. Click to mark for deletion. The first image will be the main product image.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                Add New Images (Max 5 total, JPG/PNG/WebP)
              </label>
              <input
                type="file"
                id="images"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleNewImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {newImagePreviews.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">New Images</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Drag to reorder. These will be added after existing images.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

            <div className="space-y-3">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="inStock"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Product is in stock
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Translations */}
        <ProductTranslationEditor
          translations={translations}
          baseTitle={formData.title}
          baseDescription={formData.description}
          baseConditionNotes={formData.conditionNotes || undefined}
          onChange={setTranslations}
        />

        {/* Form Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {/* Primary Actions */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePreview}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/admin/products')}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || updateProductMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting || updateProductMutation.isPending ? (
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
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>

            {/* Secondary Actions */}
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
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Product?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{product.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteProductMutation.isPending}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProductMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {deleteProductMutation.isPending ? (
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
              This will create a copy of &quot;{product.title}&quot; with the title &quot;{product.title} (Copy)&quot;.
              You can edit the duplicate after creation.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDuplicateConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
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
  );
}
