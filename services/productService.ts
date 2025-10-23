import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  WhereFilterOp,
  QueryConstraint,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  Era,
  Category,
} from '@/types';
import {
  FirebaseServiceResponse,
  ImageUploadResult,
  BatchUploadResult,
  UploadProgressCallback,
} from '@/types/firebase';

// ============================================================================
// HELPER FUNCTIONS - IMAGE UPLOAD
// ============================================================================

/**
 * Generate optimized filename for product images
 * Format: product_{timestamp}_{random}_{originalname}.ext
 */
function generateImageFilename(originalFile: File): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalFile.name.split('.').pop() || 'jpg';

  // Remove extension from original name to avoid double extension
  const nameWithoutExt = originalFile.name.replace(/\.[^/.]+$/, '');
  const safeName = nameWithoutExt
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 20);

  return `product_${timestamp}_${randomString}_${safeName}.${extension}`;
}

/**
 * Upload a single image to Firebase Storage
 * @param file - Image file to upload
 * @param productId - Optional product ID for organized storage
 * @returns Image URL and metadata
 */
export async function uploadProductImage(
  file: File,
  productId?: string
): Promise<ImageUploadResult> {
  const filename = generateImageFilename(file);
  const path = productId
    ? `products/${productId}/${filename}`
    : `products/temp/${filename}`;

  try {
    console.log('📤 Uploading image:', {
      filename,
      path,
      size: file.size,
      type: file.type,
    });

    const storageRef = ref(storage, path);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    // Get download URL
    const url = await getDownloadURL(snapshot.ref);

    console.log('✅ Image uploaded successfully:', url);

    return {
      url,
      path: snapshot.ref.fullPath,
      name: filename,
    };
  } catch (error) {
    console.error('❌ Error uploading image:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      path,
    });
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload multiple images to Firebase Storage
 * @param files - Array of image files
 * @param productId - Optional product ID for organized storage
 * @returns Results of all uploads (successful and failed)
 */
export async function uploadProductImages(
  files: File[],
  productId?: string
): Promise<BatchUploadResult> {
  const successful: ImageUploadResult[] = [];
  const failed: Array<{ file: File; error: string }> = [];

  for (const file of files) {
    try {
      const result = await uploadProductImage(file, productId);
      successful.push(result);
    } catch (error) {
      failed.push({
        file,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { successful, failed };
}

/**
 * Delete an image from Firebase Storage
 * @param imagePath - Full path to image in storage
 */
export async function deleteProductImage(imagePath: string): Promise<void> {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - image might already be deleted
  }
}

// ============================================================================
// PRODUCT CRUD OPERATIONS
// ============================================================================

/**
 * Add a new product to Firestore with image uploads
 * @param productData - Product data without images
 * @param imageFiles - Array of image files to upload
 * @returns Created product with ID
 */
export async function addProduct(
  productData: Omit<CreateProductData, 'images'>,
  imageFiles: File[]
): Promise<FirebaseServiceResponse<Product>> {
  try {
    // Validate required fields
    if (!productData.title || !productData.brand || !productData.price) {
      return {
        success: false,
        error: 'Missing required fields: title, brand, and price are required',
      };
    }

    // Upload images first
    const uploadResult = await uploadProductImages(imageFiles);

    if (uploadResult.failed.length > 0) {
      console.warn('Some images failed to upload:', uploadResult.failed);
    }

    // Create product document
    const now = Timestamp.now();
    const productToCreate = {
      ...productData,
      images: uploadResult.successful.map(img => img.url),
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'products'), productToCreate);

    // Return the created product with proper types
    const createdProduct: Product = {
      id: docRef.id,
      ...productToCreate,
    };

    return {
      success: true,
      data: createdProduct,
    };
  } catch (error) {
    console.error('Error adding product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add product',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Get products with optional filtering
 * @param filters - Optional filters for era, category, brand, stock status, etc.
 * @returns Array of products matching filters
 */
export async function getProducts(
  filters?: ProductFilters
): Promise<FirebaseServiceResponse<Product[]>> {
  try {
    const productsRef = collection(db, 'products');
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filters?.era && filters.era.length > 0) {
      constraints.push(where('era', 'in', filters.era));
    }

    if (filters?.category && filters.category.length > 0) {
      constraints.push(where('category', 'in', filters.category));
    }

    if (filters?.brand) {
      constraints.push(where('brand', '==', filters.brand));
    }

    if (filters?.inStock !== undefined) {
      constraints.push(where('inStock', '==', filters.inStock));
    }

    if (filters?.featured !== undefined) {
      constraints.push(where('featured', '==', filters.featured));
    }

    if (filters?.minPrice !== undefined) {
      constraints.push(where('price', '>=', filters.minPrice));
    }

    if (filters?.maxPrice !== undefined) {
      constraints.push(where('price', '<=', filters.maxPrice));
    }

    // Always order by createdAt descending for consistent results
    constraints.push(orderBy('createdAt', 'desc'));

    // Build and execute query
    const q = query(productsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const products: Product[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Product));

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error('Error getting products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get products',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Get a single product by ID
 * @param productId - Product document ID
 * @returns Product data or null if not found
 */
export async function getProduct(
  productId: string
): Promise<FirebaseServiceResponse<Product | null>> {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: true,
        data: null,
      };
    }

    const product: Product = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Product;

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('Error getting product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get product',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Update a product's fields
 * @param productId - Product document ID
 * @param updates - Partial product data to update
 * @returns Updated product
 */
export async function updateProduct(
  productId: string,
  updates: UpdateProductData
): Promise<FirebaseServiceResponse<Product>> {
  try {
    const docRef = doc(db, 'products', productId);

    // Check if product exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);

    // Get updated product
    const updatedSnap = await getDoc(docRef);
    const updatedProduct: Product = {
      id: updatedSnap.id,
      ...updatedSnap.data(),
    } as Product;

    return {
      success: true,
      data: updatedProduct,
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Mark a product as sold
 * @param productId - Product document ID
 * @returns Updated product
 */
export async function markProductSold(
  productId: string
): Promise<FirebaseServiceResponse<Product>> {
  try {
    const docRef = doc(db, 'products', productId);

    // Check if product exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    // Update product as sold
    await updateDoc(docRef, {
      inStock: false,
      soldAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Get updated product
    const updatedSnap = await getDoc(docRef);
    const updatedProduct: Product = {
      id: updatedSnap.id,
      ...updatedSnap.data(),
    } as Product;

    return {
      success: true,
      data: updatedProduct,
    };
  } catch (error) {
    console.error('Error marking product as sold:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark product as sold',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Delete a product and its images
 * @param productId - Product document ID
 * @returns Success status
 */
export async function deleteProduct(
  productId: string
): Promise<FirebaseServiceResponse<void>> {
  try {
    const docRef = doc(db, 'products', productId);

    // Get product to access image paths
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    const product = docSnap.data() as Product;

    // Delete images from storage
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          // Extract path from URL
          const path = `products/${productId}/`;
          // Delete images (best effort - don't fail if images are already gone)
          await deleteProductImage(path);
        } catch (error) {
          console.warn('Failed to delete image:', imageUrl, error);
        }
      }
    }

    // Delete product document
    await deleteDoc(docRef);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product',
      code: (error as { code?: string }).code,
    };
  }
}

/**
 * Search products by title, description, brand, or tags
 * Note: This performs client-side filtering. For production, consider using
 * Algolia or Elasticsearch for better search performance.
 *
 * @param searchTerm - Search term to match against
 * @returns Products matching search term
 */
export async function searchProducts(
  searchTerm: string
): Promise<FirebaseServiceResponse<Product[]>> {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        success: false,
        error: 'Search term must be at least 2 characters',
      };
    }

    // Get all products (in production, implement server-side search)
    const allProductsResponse = await getProducts({ inStock: true });

    if (!allProductsResponse.success) {
      return allProductsResponse;
    }

    const allProducts = allProductsResponse.data;
    const searchLower = searchTerm.toLowerCase();

    // Filter products by search term
    const matchingProducts = allProducts.filter(product => {
      return (
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });

    return {
      success: true,
      data: matchingProducts,
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search products',
      code: (error as { code?: string }).code,
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get featured products (homepage display)
 * @param limitCount - Number of products to return (default: 8)
 * @returns Featured products
 */
export async function getFeaturedProducts(
  limitCount: number = 8
): Promise<FirebaseServiceResponse<Product[]>> {
  return getProducts({ featured: true, inStock: true });
}

/**
 * Get products by era
 * @param era - Era to filter by
 * @returns Products from specified era
 */
export async function getProductsByEra(
  era: Era
): Promise<FirebaseServiceResponse<Product[]>> {
  return getProducts({ era: [era], inStock: true });
}

/**
 * Get products by category
 * @param category - Category to filter by
 * @returns Products in specified category
 */
export async function getProductsByCategory(
  category: Category
): Promise<FirebaseServiceResponse<Product[]>> {
  return getProducts({ category: [category], inStock: true });
}
