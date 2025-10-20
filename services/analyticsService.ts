import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AnalyticsEvent {
  event: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase' | 'search';
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
  timestamp?: Timestamp;
}

/**
 * Track analytics event to Firestore
 * Simple analytics tracking - stores events in 'analytics' collection
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    // Don't track in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
      return;
    }

    // Get or create session ID
    const sessionId = getSessionId();

    await addDoc(collection(db, 'analytics'), {
      ...event,
      sessionId,
      timestamp: Timestamp.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  } catch (error) {
    // Fail silently - don't break user experience if analytics fails
    console.error('Analytics tracking error:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  trackEvent({
    event: 'page_view',
    properties: {
      path: pagePath,
      title: pageTitle || document.title,
    },
  });
}

/**
 * Track product view
 */
export function trackProductView(productId: string, productName: string, price: number): void {
  trackEvent({
    event: 'product_view',
    properties: {
      productId,
      productName,
      price,
    },
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(
  productId: string,
  productName: string,
  price: number,
  brand?: string
): void {
  trackEvent({
    event: 'add_to_cart',
    properties: {
      productId,
      productName,
      price,
      brand,
    },
  });
}

/**
 * Track purchase
 */
export function trackPurchase(
  orderId: string,
  orderNumber: string,
  total: number,
  items: Array<{ productId: string; title: string; price: number }>
): void {
  trackEvent({
    event: 'purchase',
    properties: {
      orderId,
      orderNumber,
      total,
      itemCount: items.length,
      items,
    },
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultCount: number): void {
  trackEvent({
    event: 'search',
    properties: {
      query,
      resultCount,
    },
  });
}

/**
 * Get or create session ID
 * Stores in sessionStorage for the browser session
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  const SESSION_KEY = 'vintage-store-session';
  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}
