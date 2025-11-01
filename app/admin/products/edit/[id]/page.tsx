'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { uploadProductImages, deleteProductImage, addProduct } from '@/services/productService';
import { ERAS, CATEGORIES_BY_TYPE, CONDITIONS, PRODUCT_TYPES } from '@/lib/constants';
import { Era, Category, Condition, ProductType, ProductTranslations } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
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
  { id: 'actions', label: 'Form Actions' },
];

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

  // Track initial state for change detection
  const [initialFormData, setInitialFormData] = useState<ProductFormData | null>(null);
  const [initialTranslations, setInitialTranslations] = useState<ProductTranslations>({});
  const [initialImages, setInitialImages] = useState<ExistingImage[]>([]);

  // Populate form when product loads
  useEffect(() => {
    if (product) {
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

  const handleNewImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

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

      // Update initial state to reflect saved changes
      setInitialFormData(formData);
      setInitialTranslations(translations);
      setInitialImages(existingImages.filter(img => !img.markedForDeletion));

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Check if a section is complete
  const isSectionComplete = (sectionId: string): boolean => {
    switch (sectionId) {
      case 'basic-info':
        return !!(formData.productType && formData.brand && formData.era && formData.category);
      case 'content':
        return !!(formData.title.trim() && formData.description.trim());
      case 'specifications':
        // Specifications are optional, so always complete
        return true;
      case 'pricing':
        return !!(formData.condition && formData.price && parseFloat(formData.price) > 0);
      case 'discount':
        // Discount is optional, so always complete
        return true;
      case 'shipping':
        // Shipping is optional but recommended - consider complete if weight is filled
        return !!formData.weightGrams;
      case 'images':
        const hasImages = existingImages.filter(img => !img.markedForDeletion).length + newImages.length > 0;
        return hasImages;
      case 'tags':
        // Tags are optional, so always complete
        return true;
      case 'actions':
        // Actions section is always available
        return true;
      default:
        return false;
    }
  };

  // Check if a section has unsaved changes
  const hasSectionChanges = (sectionId: string): boolean => {
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
  };

  // Check if there are any unsaved changes across all sections
  const hasAnyChanges = (): boolean => {
    return sections.some((section) => hasSectionChanges(section.id));
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
    <div className="flex max-w-full px-4 sm:px-6">
      <div className={`max-w-4xl w-full ${isSidebarOpen ? 'mr-64' : ''}`}>
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
          <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none inline-block align-bottom">Edit {product.title}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Update product information and images</p>
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

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Basic Information */}
        <section id="basic-info" className="bg-white rounded-lg shadow p-4 sm:p-6">
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
        </section>

        {/* Product Content (multilingual) */}
        <section id="content">
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
        {formData.productType && SPECIFICATION_FIELDS[formData.productType].length > 0 && (
          <section id="specifications" className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Specifications (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Add relevant details for this {formData.productType.toLowerCase()} item
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
          </section>
        )}

        {/* Condition & Pricing */}
        <section id="pricing" className="bg-white rounded-lg shadow p-4 sm:p-6">
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
        </section>

        {/* Discount Pricing */}
        <section id="discount" className="bg-white rounded-lg shadow p-4 sm:p-6">
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
        </section>

        {/* Shipping Information */}
        <section id="shipping" className="bg-white rounded-lg shadow p-4 sm:p-6">
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
        </section>

        {/* Images */}
        <section id="images" className="bg-white rounded-lg shadow p-4 sm:p-6">
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

        {/* Tags & Options */}
        <section id="tags" className="bg-white rounded-lg shadow p-4 sm:p-6">
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
        </section>

        {/* Form Actions */}
        <section id="actions" className="bg-white rounded-lg shadow p-4 sm:p-6">
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

            {/* Additional Actions */}
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
              Are you sure you want to delete &quot;{product.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteProductMutation.isPending}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
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
      <aside
        className={`fixed right-0 top-16 h-[calc(100vh-4rem)] bg-white border-l border-gray-200 shadow-lg transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } w-64 z-40`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Page Index</h3>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                aria-label="Close sidebar"
              >
                <svg
                  className="h-5 w-5"
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
          </div>

          {/* Sidebar Links */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {sections.map((section) => {
                const isComplete = isSectionComplete(section.id);
                const hasChanges = hasSectionChanges(section.id);

                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors flex items-center justify-between group"
                    >
                      <span>{section.label}</span>
                      <div className="flex items-center gap-1">
                        {hasChanges && (
                          <svg
                            className="h-4 w-4 text-amber-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            title="Unsaved changes"
                          >
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isComplete && !hasChanges && (
                          <svg
                            className="h-4 w-4 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            title="Complete"
                          >
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer with Save Button */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const form = document.querySelector('form');
                if (form) {
                  form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }}
              disabled={isSubmitting || updateProductMutation.isPending || !hasAnyChanges()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-sm"
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
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
            {hasAnyChanges() ? (
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
          className="fixed right-4 top-20 bg-white border border-gray-200 shadow-lg rounded-lg p-2 hover:bg-gray-50 z-40"
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
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
