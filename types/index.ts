import { Timestamp } from 'firebase/firestore';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

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

export interface ProductMeasurements {
  chest?: number;      // in inches
  waist?: number;      // in inches
  hips?: number;       // in inches
  length?: number;     // in inches
  shoulders?: number;  // in inches
  sleeves?: number;    // in inches
}

export interface ProductSize {
  label: string;                    // e.g., "M", "32x34", "10"
  measurements?: ProductMeasurements;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  brand: string;
  era: Era;
  category: Category;
  size: ProductSize;
  condition: Condition;
  conditionNotes?: string;
  price: number;
  images: string[];                 // Array of image URLs
  inStock: boolean;
  featured: boolean;
  tags: string[];                   // e.g., ["vintage", "denim", "levi's"]
  createdAt: Timestamp;
  updatedAt: Timestamp;
  soldAt?: Timestamp;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
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

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALID_ERAS: Era[] = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s'];

export const VALID_CATEGORIES: Category[] = [
  'Jacket',
  'Dress',
  'Jeans',
  'Shirt',
  'Pants',
  'Skirt',
  'Sweater',
  'Coat',
  'Accessories',
];

export const VALID_CONDITIONS: Condition[] = ['Excellent', 'Good', 'Fair', 'As-Is'];

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
];
