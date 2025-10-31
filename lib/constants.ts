/**
 * Shared application constants
 * All values are immutable and type-safe to prevent typos and case-sensitivity bugs
 */

// Product Types
export const PRODUCT_TYPES = [
  'Clothing',
  'Furniture',
  'Jewelry',
  'Vinyl Records',
  'Electronics',
  'Books',
  'Art',
  'Collectibles',
  'Other',
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

// Eras - immutable string literals
export const ERAS = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s'] as const;

export type Era = (typeof ERAS)[number];

// Conditions - immutable string literals
export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'As-Is'] as const;

export type Condition = (typeof CONDITIONS)[number];

// Categories by product type - immutable nested structure
export const CATEGORIES_BY_TYPE = {
  'Clothing': ['Jacket', 'Dress', 'Jeans', 'Shirt', 'Pants', 'Skirt', 'Sweater', 'Coat', 'Accessories'],
  'Furniture': ['Chair', 'Table', 'Sofa', 'Cabinet', 'Desk', 'Bed', 'Shelf', 'Lamp', 'Other'],
  'Jewelry': ['Ring', 'Necklace', 'Bracelet', 'Earrings', 'Brooch', 'Watch', 'Pin', 'Other'],
  'Vinyl Records': ['LP', 'EP', 'Single', '45 RPM', '78 RPM', 'Box Set', 'Compilation'],
  'Electronics': ['Audio', 'Video', 'Camera', 'Gaming', 'Computer', 'Phone', 'Other'],
  'Books': ['Fiction', 'Non-Fiction', 'Poetry', 'Art Book', 'Photography', 'Reference', 'Other'],
  'Art': ['Painting', 'Print', 'Sculpture', 'Photography', 'Drawing', 'Mixed Media', 'Other'],
  'Collectibles': ['Toy', 'Trading Card', 'Comic', 'Pin', 'Poster', 'Memorabilia', 'Other'],
  'Other': ['General', 'Uncategorized'],
} as const satisfies Record<ProductType, readonly string[]>;

// Extract all possible category values as a union type
type CategoriesArray = typeof CATEGORIES_BY_TYPE;
type CategoryValue = CategoriesArray[keyof CategoriesArray][number];
export type Category = CategoryValue;

// Get all unique categories across all product types
export const ALL_CATEGORIES: readonly Category[] = Array.from(
  new Set(Object.values(CATEGORIES_BY_TYPE).flat())
) as readonly Category[];

// Legacy categories constant for backward compatibility (Clothing only)
export const CATEGORIES = CATEGORIES_BY_TYPE['Clothing'];

/**
 * Helper function to check if a value is a valid category
 */
export function isValidCategory(value: string): value is Category {
  return ALL_CATEGORIES.includes(value as Category);
}

/**
 * Helper function to check if a value is a valid era
 */
export function isValidEra(value: string): value is Era {
  return ERAS.includes(value as Era);
}

/**
 * Helper function to check if a value is a valid condition
 */
export function isValidCondition(value: string): value is Condition {
  return CONDITIONS.includes(value as Condition);
}

/**
 * Helper function to check if a value is a valid product type
 */
export function isValidProductType(value: string): value is ProductType {
  return PRODUCT_TYPES.includes(value as ProductType);
}
