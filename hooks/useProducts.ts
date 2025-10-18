'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  markProductSold,
  searchProducts,
  getFeaturedProducts,
  getProductsByEra,
  getProductsByCategory,
} from '@/services/productService';
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  Era,
  Category,
} from '@/types';

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (term: string) => [...productKeys.all, 'search', term] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  byEra: (era: Era) => [...productKeys.all, 'era', era] as const,
  byCategory: (category: Category) => [...productKeys.all, 'category', category] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch products with optional filtering
 * Configures: 5min staleTime, 10min gcTime
 */
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const result = await getProducts(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Fetch a single product by ID
 * Configures: 10min staleTime
 * Only enabled when productId is provided
 */
export function useProduct(productId?: string) {
  return useQuery({
    queryKey: productKeys.detail(productId || ''),
    queryFn: async () => {
      if (!productId) return null;

      const result = await getProduct(productId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Search products with debouncing
 * Configures: 2min staleTime
 * Only fetches if searchTerm has 2+ characters
 */
export function useSearchProducts(searchTerm: string) {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  // Debounce search term (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return useQuery({
    queryKey: productKeys.search(debouncedTerm),
    queryFn: async () => {
      const result = await searchProducts(debouncedTerm);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: debouncedTerm.length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch featured products for homepage
 * Configures: 5min staleTime
 */
export function useFeaturedProducts(limit?: number) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: async () => {
      const result = await getFeaturedProducts(limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fetch products by era
 */
export function useProductsByEra(era: Era) {
  return useQuery({
    queryKey: productKeys.byEra(era),
    queryFn: async () => {
      const result = await getProductsByEra(era);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch products by category
 */
export function useProductsByCategory(category: Category) {
  return useQuery({
    queryKey: productKeys.byCategory(category),
    queryFn: async () => {
      const result = await getProductsByCategory(category);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Add a new product
 * Invalidates products list on success
 */
export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productData,
      imageFiles,
    }: {
      productData: Omit<CreateProductData, 'images'>;
      imageFiles: File[];
    }) => {
      const result = await addProduct(productData, imageFiles);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (newProduct) => {
      // Invalidate all product lists to refetch with new product
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.featured() });

      // Optionally set the query data for the new product
      queryClient.setQueryData(productKeys.detail(newProduct.id), newProduct);
    },
    onError: (error) => {
      console.error('Failed to add product:', error);
    },
  });
}

/**
 * Update an existing product
 * Uses optimistic updates for better UX
 * Invalidates both product lists and specific product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      updates,
    }: {
      productId: string;
      updates: UpdateProductData;
    }) => {
      const result = await updateProduct(productId, updates);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    // Optimistic update
    onMutate: async ({ productId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.detail(productId) });

      // Snapshot previous value
      const previousProduct = queryClient.getQueryData<Product>(
        productKeys.detail(productId)
      );

      // Optimistically update to the new value
      if (previousProduct) {
        queryClient.setQueryData<Product>(productKeys.detail(productId), {
          ...previousProduct,
          ...updates,
        });
      }

      // Return context with the snapshotted value
      return { previousProduct };
    },
    // On error, rollback to previous value
    onError: (error, { productId }, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(
          productKeys.detail(productId),
          context.previousProduct
        );
      }
      console.error('Failed to update product:', error);
    },
    // Always refetch after error or success
    onSettled: (data, error, { productId }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.featured() });
    },
  });
}

/**
 * Mark a product as sold
 * Invalidates product queries
 */
export function useMarkProductSold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const result = await markProductSold(productId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (updatedProduct) => {
      // Update the cache with sold product
      queryClient.setQueryData(
        productKeys.detail(updatedProduct.id),
        updatedProduct
      );

      // Invalidate lists to update stock status
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.featured() });
    },
    onError: (error) => {
      console.error('Failed to mark product as sold:', error);
    },
  });
}

/**
 * Delete a product
 * Removes from cache and invalidates lists
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const result = await deleteProduct(productId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return productId;
    },
    onSuccess: (productId) => {
      // Remove product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) });

      // Invalidate all product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.featured() });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Get loading states for multiple products
 * Useful for batch operations
 */
export function useProductsLoadingState(productIds: string[]) {
  const queries = productIds.map(id =>
    useProduct(id)
  );

  return {
    isLoading: queries.some(q => q.isLoading),
    isError: queries.some(q => q.isError),
    products: queries.map(q => q.data).filter(Boolean) as Product[],
  };
}

/**
 * Prefetch a product (for hover effects, etc.)
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (productId: string) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(productId),
      queryFn: async () => {
        const result = await getProduct(productId);
        if (!result.success) {
          throw new Error(result.error);
        }
        return result.data;
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };
}

// ============================================================================
// EXPORT TYPES FOR CONVENIENCE
// ============================================================================

export type UseProductsResult = ReturnType<typeof useProducts>;
export type UseProductResult = ReturnType<typeof useProduct>;
export type UseAddProductResult = ReturnType<typeof useAddProduct>;
export type UseUpdateProductResult = ReturnType<typeof useUpdateProduct>;
export type UseDeleteProductResult = ReturnType<typeof useDeleteProduct>;
export type UseSearchProductsResult = ReturnType<typeof useSearchProducts>;
