import { Timestamp } from 'firebase/firestore';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import type { Locale } from '@/i18n';

// Plain timestamp object structure from Firestore
export interface PlainTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Type for timestamps that can come from either client or admin SDK
export type FirebaseTimestamp = Timestamp | AdminTimestamp | Date | string | PlainTimestamp;

/**
 * Safely converts a FirebaseTimestamp to an ISO string
 */
export function timestampToISO(timestamp: FirebaseTimestamp | null | undefined | any): string | undefined {
  if (!timestamp) {
    return undefined;
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }

  // Handle plain objects with seconds/nanoseconds FIRST (most common from doc.data())
  if (typeof timestamp === 'object' && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
    const nanoseconds = timestamp.nanoseconds || 0;
    const date = new Date(timestamp.seconds * 1000 + nanoseconds / 1000000);
    return date.toISOString();
  }

  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }

  // Handle Timestamp instances with toDate method
  if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }

  console.warn('[timestampToISO] Could not convert timestamp:', timestamp);
  return undefined;
}

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type ProductType =
  | 'Clothing'
  | 'Furniture'
  | 'Jewelry'
  | 'Vinyl Records'
  | 'Electronics'
  | 'Books'
  | 'Art'
  | 'Collectibles'
  | 'Other';

export type Era = '1950s' | '1960s' | '1970s' | '1980s' | '1990s' | '2000s';

export type Category =
  | 'Jacket'
  | 'Dress'
  | 'Jeans'
  | 'Shirt'
  | 'Pants'
  | 'Skirt'
  | 'Sweater'
  | 'Coat'
  | 'Accessories';

export type Condition = 'Excellent' | 'Good' | 'Fair' | 'As-Is';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// ============================================================================
// PRODUCT TYPES
// ============================================================================

/**
 * Flexible specifications for any product type
 * Examples:
 * - Clothing: { chest: 22, waist: 18, sleeves: 24 }
 * - Furniture: { height: 36, width: 48, depth: 24 }
 * - Jewelry: { material: "14k gold", stoneType: "diamond", ringSize: 7 }
 * - Vinyl: { format: "LP", rpm: 33, label: "Columbia" }
 */
export type ProductSpecifications = Record<string, string | number>;

export interface ProductSize {
  label: string;                      // e.g., "M", "32x34", "10"
  specifications?: ProductSpecifications;
}

/**
 * Translations for product content in different locales
 * Base language (English) is stored in the main product fields
 * Additional translations are optional and stored here
 */
export interface ProductTranslation {
  title?: string;
  description?: string;
  conditionNotes?: string;
}

export type ProductTranslations = Partial<Record<Locale, ProductTranslation>>;

export interface Product {
  id: string;
  productType: ProductType;           // Type of vintage item
  title: string;
  description: string;
  brand: string;
  era: Era;
  category: Category;
  size?: ProductSize;                 // Optional - not all items have size
  condition: Condition;
  conditionNotes?: string;
  price: number;
  images: string[];                   // Array of image URLs
  inStock: boolean;
  featured: boolean;
  tags: string[];                     // e.g., ["vintage", "denim", "levi's"]
  specifications?: ProductSpecifications;  // Generic key-value specs
  translations?: ProductTranslations; // Optional translations for title, description, conditionNotes
  // Shipping dimensions and weight
  weightGrams?: number;               // Weight in grams for shipping calculations
  lengthCm?: number;                  // Length in cm (optional for volumetric weight)
  widthCm?: number;                   // Width in cm (optional for volumetric weight)
  heightCm?: number;                  // Height in cm (optional for volumetric weight)
  freeShipping?: boolean;             // If true, shipping is free for this product
  // Discount pricing
  discountPrice?: number;             // Optional discounted price
  discountStartDate?: Timestamp;      // When discount becomes active
  discountEndDate?: Timestamp;        // When discount expires
  createdAt: Timestamp;
  updatedAt: Timestamp;
  soldAt?: Timestamp;
}

// Serialized product for client components (timestamps as ISO strings)
export interface SerializedProduct extends Omit<Product, 'createdAt' | 'updatedAt' | 'soldAt' | 'discountStartDate' | 'discountEndDate'> {
  createdAt: string;
  updatedAt: string;
  soldAt?: string;
  discountStartDate?: string;
  discountEndDate?: string;
}

// Type for creating a new product (without auto-generated fields)
export type CreateProductData = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'soldAt'>;

// Type for updating a product (all fields optional except id)
export type UpdateProductData = Partial<Omit<Product, 'id' | 'createdAt'>>;

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomerInfo {
  email: string;
  name: string;
  shippingAddress: ShippingAddress;
}

export interface OrderItem {
  productId: string;
  title: string;
  brand: string;
  era: Era;
  size: string;
  price: number;
  imageUrl: string;
  weightGrams?: number;               // Weight for shipping calculation
}

export interface EmailHistoryEntry {
  type: string;                     // e.g., 'order_confirmation', 'shipping_notification'
  sentAt: Timestamp;
  sentTo: string;                   // Email address
  emailId?: string;                 // Resend email ID
  status: 'sent' | 'failed';
  error?: string;
}

export interface Order {
  id: string;
  orderNumber: string;              // e.g., "VTG-20250118-001"
  customerId?: string;              // Optional: for registered users
  customerInfo: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentIntentId: string;          // Stripe payment intent ID
  trackingNumber?: string;
  emailHistory?: EmailHistoryEntry[]; // Track all emails sent for this order
  locale?: string;                  // User's preferred language (e.g., 'en', 'es', 'fr')
  shippingZone?: string;            // Shipping zone: 'domestic', 'europe', 'north-america', etc.
  estimatedDeliveryDays?: string;   // Estimated delivery time (e.g., '5-7 business days')
  destinationCountry?: string;      // Destination country code (ISO 3166-1 alpha-2)
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
}

// Type for creating a new order
export type CreateOrderData = Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>;

// Type for updating order status
export interface UpdateOrderStatusData {
  status: OrderStatus;
  trackingNumber?: string;
}

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export interface SavedAddress extends ShippingAddress {
  label?: string;                   // e.g., "Home", "Work"
  isDefault?: boolean;
}

export interface Customer {
  id: string;                       // Firebase Auth UID
  email: string;
  name: string;
  addresses: SavedAddress[];
  orderHistory: string[];           // Array of order IDs
  wishlist: string[];               // Array of product IDs
  createdAt: Timestamp;
}

// Type for creating a new customer
export type CreateCustomerData = Omit<Customer, 'id' | 'createdAt'>;

// Type for updating customer profile
export type UpdateCustomerData = Partial<Omit<Customer, 'id' | 'createdAt'>>;

// ============================================================================
// CART TYPES
// ============================================================================

export interface CartItem {
  productId: string;
  title: string;
  brand: string;
  era: Era;
  category: Category;
  size: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  isDeleted?: boolean; // Flag for deleted products
  weightGrams?: number;               // Weight for shipping calculation
  freeShipping?: boolean;             // If true, shipping is free for this product
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface ProductFilters {
  era?: Era[];
  category?: Category[];
  condition?: Condition[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  brand?: string;
  size?: string;
  tags?: string[];
}

export interface ProductSearchParams extends ProductFilters {
  searchTerm?: string;
  sortBy?: 'createdAt' | 'price' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface Admin {
  id: string;                       // Firebase Auth UID
  email: string;
}

// ============================================================================
// ANALYTICS TYPES (Future use)
// ============================================================================

export interface AnalyticsEvent {
  id: string;
  eventType: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase';
  productId?: string;
  orderId?: string;
  customerId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Timestamp;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Convert Firestore Timestamp to Date for client-side use
export type WithDates<T> = {
  [K in keyof T]: T[K] extends Timestamp ? Date : T[K];
};

// Helper type for paginated results
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  lastDoc?: unknown;
}

// ============================================================================
// PRICE RANGE CONSTANTS
// ============================================================================

export const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: '$200+', min: 200, max: Infinity },
] as const;

// Note: Era, Category, and Condition constants are defined in /lib/constants.ts
// to avoid duplication. Import from there when needed for validation.

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
];
