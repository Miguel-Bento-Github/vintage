/**
 * Shared application constants
 */

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

export const ERAS = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s'] as const;

// Categories by product type
export const CATEGORIES_BY_TYPE: Record<ProductType, readonly string[]> = {
  'Clothing': ['Jacket', 'Dress', 'Jeans', 'Shirt', 'Pants', 'Skirt', 'Sweater', 'Coat', 'Accessories'],
  'Furniture': ['Chair', 'Table', 'Sofa', 'Cabinet', 'Desk', 'Bed', 'Shelf', 'Lamp', 'Other'],
  'Jewelry': ['Ring', 'Necklace', 'Bracelet', 'Earrings', 'Brooch', 'Watch', 'Pin', 'Other'],
  'Vinyl Records': ['LP', 'EP', 'Single', '45 RPM', '78 RPM', 'Box Set', 'Compilation'],
  'Electronics': ['Audio', 'Video', 'Camera', 'Gaming', 'Computer', 'Phone', 'Other'],
  'Books': ['Fiction', 'Non-Fiction', 'Poetry', 'Art Book', 'Photography', 'Reference', 'Other'],
  'Art': ['Painting', 'Print', 'Sculpture', 'Photography', 'Drawing', 'Mixed Media', 'Other'],
  'Collectibles': ['Toy', 'Trading Card', 'Comic', 'Pin', 'Poster', 'Memorabilia', 'Other'],
  'Other': ['General', 'Uncategorized'],
} as const;

// Legacy categories constant for backward compatibility
export const CATEGORIES = [
  'Jacket',
  'Dress',
  'Jeans',
  'Shirt',
  'Pants',
  'Skirt',
  'Sweater',
  'Coat',
  'Accessories',
] as const;

export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'As-Is'] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];
export type Era = (typeof ERAS)[number];
export type Category = (typeof CATEGORIES)[number] | string; // Allow any string for flexibility
export type Condition = (typeof CONDITIONS)[number];
