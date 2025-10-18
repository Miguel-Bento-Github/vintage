# Types Organization

This directory contains all TypeScript type definitions for the vintage store application.

## File Structure

```
types/
├── index.ts          # Main database schema & domain types
├── firebase.ts       # Firebase-specific utility types
└── README.md         # This file
```

## What Goes Where?

### `types/index.ts` - Domain Types
**Purpose:** Database schema and business logic types

**Contains:**
- ✅ Database entities: `Product`, `Order`, `Customer`
- ✅ Business enums: `Era`, `Category`, `Condition`, `OrderStatus`
- ✅ Domain objects: `ProductSize`, `ShippingAddress`, `OrderItem`
- ✅ Cart types: `Cart`, `CartItem`
- ✅ Filter types: `ProductFilters`, `ProductSearchParams`
- ✅ Helper types: `CreateProductData`, `UpdateProductData`
- ✅ Domain utilities: `WithDates<T>`, `PaginatedResult<T>`
- ✅ Constants: `VALID_ERAS`, `VALID_CATEGORIES`, `PRICE_RANGES`

**Import from here when:**
```typescript
// Working with products, orders, customers
import { Product, Order, Customer } from '@/types';

// Creating/updating data
import { CreateProductData, UpdateOrderStatusData } from '@/types';

// Filtering and searching
import { ProductFilters, ProductSearchParams } from '@/types';
```

### `types/firebase.ts` - Firebase Utilities
**Purpose:** Firebase SDK integration and service layer types

**Contains:**
- ✅ Firebase type re-exports: `Timestamp`, `FirestoreError`, `StorageError`
- ✅ Service responses: `FirebaseServiceResponse<T>`, `FirebaseServiceSuccess<T>`
- ✅ Image uploads: `ImageUploadResult`, `BatchUploadResult`, `UploadProgressCallback`

**Import from here when:**
```typescript
// In service files (productService.ts, orderService.ts)
import {
  FirebaseServiceResponse,
  ImageUploadResult,
  Timestamp
} from '@/types/firebase';

// For upload progress tracking
import { UploadProgressCallback } from '@/types/firebase';
```

## Usage Examples

### Creating a Product

```typescript
import { CreateProductData, Era, Category } from '@/types';

const newProduct: CreateProductData = {
  title: "Vintage Levi's 501",
  brand: "Levi's",
  era: "1980s",        // Type-safe enum
  category: "Jeans",   // Type-safe enum
  size: {
    label: "32x34",
    measurements: {
      waist: 32,
      length: 34
    }
  },
  condition: "Excellent",
  price: 89.99,
  images: [],
  inStock: true,
  featured: false,
  tags: ["vintage", "denim", "levis"]
};
```

### Service Layer Response

```typescript
import { Product } from '@/types';
import { FirebaseServiceResponse } from '@/types/firebase';

async function getProduct(id: string): Promise<FirebaseServiceResponse<Product>> {
  try {
    const product = await fetchProductFromFirebase(id);
    return {
      success: true,
      data: product
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}
```

### Filtering Products

```typescript
import { ProductFilters, ProductSearchParams } from '@/types';

const filters: ProductFilters = {
  era: ['1980s', '1990s'],
  category: ['Jeans'],
  minPrice: 50,
  maxPrice: 150,
  inStock: true
};

const searchParams: ProductSearchParams = {
  ...filters,
  searchTerm: "levi's",
  sortBy: 'price',
  sortOrder: 'asc',
  limit: 20
};
```

## Type Safety Benefits

### Strict Enums
All enum values are type-safe:
```typescript
const era: Era = "1980s";        // ✅ Valid
const era: Era = "2010s";        // ❌ TypeScript error
```

### Required vs Optional Fields
TypeScript enforces required fields:
```typescript
const product: Product = {
  id: "123",
  title: "Vintage Jacket",
  // ... all required fields must be present
  conditionNotes: undefined,     // ✅ Optional, can be undefined
  soldAt: undefined              // ✅ Optional
};
```

### Auto-completion
Your IDE will provide autocomplete for all fields, methods, and values.

## Best Practices

1. **Import from the right file:**
   - Domain logic → `@/types`
   - Firebase/services → `@/types/firebase`

2. **Use helper types:**
   - Creating data → `CreateProductData`, `CreateOrderData`
   - Updating data → `UpdateProductData`, `UpdateCustomerData`

3. **Leverage TypeScript:**
   - Let TypeScript guide you with autocomplete
   - Pay attention to required vs optional fields
   - Use type inference where possible

4. **Don't duplicate types:**
   - These files are the single source of truth
   - Import and reuse, don't recreate

## Adding New Types

### Adding a new domain type (e.g., Review):
→ Add to `types/index.ts`

### Adding a new Firebase utility (e.g., VideoUploadResult):
→ Add to `types/firebase.ts`

### Adding a new enum value (e.g., "2010s" to Era):
→ Update the type and constant array in `types/index.ts`

## Migration Notes

**Before cleanup:**
- Had duplicate `FirestoreDocument` in both files
- Had overlapping helper types (`WithDates` vs `WithTimestamps`)

**After cleanup:**
- `types/index.ts` → Domain types only
- `types/firebase.ts` → Firebase SDK utilities only
- No duplicates, clear separation of concerns
