/**
 * Shared application constants
 */

export const ERAS = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s'] as const;

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

export type Era = (typeof ERAS)[number];
export type Category = (typeof CATEGORIES)[number];
export type Condition = (typeof CONDITIONS)[number];
