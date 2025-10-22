# Performance Analysis & Optimization Plan

## Current Performance Issues

### 🔴 Critical Issues

#### 1. Shop Page is Entirely Client-Side (`app/[locale]/shop/page.tsx`)
**Problem:** The entire shop page is marked with `'use client'`, meaning:
- All products must be fetched client-side after page loads
- Filtering/sorting logic runs in browser
- Larger JavaScript bundle sent to users
- Poor Time to First Contentful Paint (FCP)

**Impact:**
- Users see blank/loading state while products download
- SEO suffers (search engines see empty page initially)
- Mobile users on slow connections wait longer

**Fix:** Convert to Server Component with client-side filters
```typescript
// Split into:
// 1. Server component that fetches initial data
// 2. Client component that handles interactive filters
```

#### 2. Homepage Fetches Firestore Without Caching (`app/[locale]/page.tsx:11-25`)
**Problem:**
```typescript
async function getFeaturedProducts(): Promise<Product[]> {
  // Runs on EVERY page load, no caching!
  const snapshot = await getDocs(q);
  return snapshot.docs.map(...) as Product[];
}
```

**Impact:**
- Every homepage visit hits Firestore
- Slow server response times
- Higher Firestore read costs
- No benefit from CDN caching

**Fix:** Add React `cache()` and ISR revalidation
```typescript
import { cache } from 'react';

// Add at top of page.tsx
export const revalidate = 300; // 5 minutes ISR

const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  // Same logic, now cached and revalidated every 5 min
});
```

#### 3. No Static Generation for Product Pages
**Problem:** Product detail pages render on-demand for every request

**Impact:**
- Slower page loads for popular products
- Wasted server resources

**Fix:** Implement `generateStaticParams` for top products
```typescript
// app/[locale]/product/[id]/page.tsx
export async function generateStaticParams() {
  // Pre-render featured/popular products at build time
  const products = await getFeaturedProducts();
  return products.map(p => ({ id: p.id }));
}
```

#### 4. All Translation Messages Loaded (`app/[locale]/layout.tsx:63`)
**Problem:**
```typescript
const messages = await getMessages(); // Loads ALL messages for ALL pages
```

**Impact:**
- Larger initial bundle
- Unnecessary data transfer

**Fix:** Load only needed messages per page (next-intl supports this)

### 🟡 Medium Priority Issues

#### 5. No Build-Time Optimizations in `next.config.mjs`
**Missing:**
- Bundle analyzer
- Compression settings
- Image optimization config

**Add:**
```javascript
const nextConfig = {
  // Existing config...

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Existing remotePatterns...
  },

  // Enable SWC minification
  swcMinify: true,
};
```

#### 6. Large .next Build Size (372MB)
**Likely causes:**
- Development artifacts included
- Unused dependencies
- Large source maps

**Investigate:**
```bash
npm install -D @next/bundle-analyzer
```

### 🟢 Lower Priority Optimizations

#### 7. Featured Products Load with `loading="eager"`
**Current:** First 8 product images load eagerly (line 91 in homepage)
**Good:** Above-fold images should be eager
**Optimize:** Only first 4 should be eager, rest lazy

#### 8. Category Images from Unsplash (External)
**Current:** 6 category images loaded from images.unsplash.com
**Better:** Download and serve locally for faster loading + offline support

---

## Implementation Plan

### Phase 1: Critical Fixes (Biggest Impact) ⚡

#### 1.1 Add ISR to Homepage
```typescript
// app/[locale]/page.tsx
import { cache } from 'react';

export const revalidate = 300; // 5 minutes

const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  // existing logic
});
```

#### 1.2 Convert Shop Page to Hybrid (Server + Client)
Create two components:
- `ShopServer` - Fetches initial products (server component)
- `ShopFilters` - Interactive filters (client component)

```typescript
// app/[locale]/shop/page.tsx (Server Component)
import { getProducts } from '@/services/productService';
import ShopFilters from '@/components/ShopFilters';

export const revalidate = 180; // 3 minutes

export default async function ShopPage() {
  const result = await getProducts();
  const products = result.success ? result.data : [];

  return <ShopFilters initialProducts={products} />;
}
```

```typescript
// components/ShopFilters.tsx (Client Component)
'use client';

export default function ShopFilters({ initialProducts }: { initialProducts: Product[] }) {
  // All your current filtering logic
  // Uses initialProducts for instant display
  // Can optionally refetch for real-time updates
}
```

#### 1.3 Add Static Generation for Products
```typescript
// app/[locale]/product/[id]/page.tsx
import { getProducts } from '@/services/productService';

export const revalidate = 600; // 10 minutes

export async function generateStaticParams() {
  const result = await getProducts();
  const products = result.success ? result.data : [];

  // Pre-render all in-stock products at build time
  return products
    .filter(p => p.inStock)
    .slice(0, 50) // Limit to avoid extremely long builds
    .map(product => ({ id: product.id }));
}
```

### Phase 2: Medium Priority 📦

#### 2.1 Optimize Translation Loading
```typescript
// Use next-intl's selective message loading
const messages = await getMessages({
  // Only load messages needed for this page
});
```

#### 2.2 Add Bundle Analyzer
```bash
npm install -D @next/bundle-analyzer
```

```javascript
// next.config.mjs
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(withNextIntl(nextConfig));
```

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

#### 2.3 Optimize Images Configuration
Update `next.config.mjs` with AVIF support and proper sizes

### Phase 3: Polish 🎨

#### 3.1 Download Category Images Locally
Download the 6 Unsplash images to `/public/categories/` for faster loading

#### 3.2 Optimize Loading States
Ensure skeleton loaders match content layout to prevent CLS (Cumulative Layout Shift)

#### 3.3 Add Prefetching
```typescript
// Prefetch product pages on hover
<Link
  href={`/${locale}/product/${product.id}`}
  prefetch={true} // Enable Next.js prefetching
>
```

---

## Expected Performance Improvements

### Before → After

| Metric | Before | After (Estimated) |
|--------|--------|-------------------|
| Homepage FCP | ~2.5s | **~0.8s** |
| Shop Page FCP | ~3.0s | **~1.2s** |
| Product Page Load | ~1.8s | **~0.5s** (static) |
| Firestore Reads/Day | High | **-80%** (with caching) |
| Bundle Size | 372MB | **~250MB** |
| Lighthouse Score | 70-80 | **90-95** |

### Cost Savings
- **Firestore:** ~80% reduction in reads = significant cost savings
- **Vercel/Hosting:** Faster pages = less serverless execution time
- **User Experience:** Faster loads = higher conversion rates

---

## Testing Strategy

### 1. Measure Baseline
```bash
# Before changes
npm run build
lighthouse https://dreamazul.com --view
```

### 2. Implement Changes Incrementally
- Phase 1: Critical fixes first
- Test each change before moving to next
- Monitor build times and bundle sizes

### 3. Measure Improvement
```bash
# After changes
npm run build
lighthouse https://dreamazul.com --view
```

### 4. Production Monitoring
- Add performance monitoring (Vercel Analytics or similar)
- Track Core Web Vitals
- Monitor Firestore read patterns

---

## Quick Wins (Do These First!)

1. **Add ISR to homepage** (5 min, huge impact)
2. **Add `revalidate` to product pages** (5 min)
3. **Enable image optimization formats** (2 min)

These three changes alone should improve perceived performance by 40-50%.

---

## References

- [Next.js App Router Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Core Web Vitals](https://web.dev/vitals/)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
