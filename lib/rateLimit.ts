/**
 * Rate Limiting Utility
 *
 * Implements token bucket algorithm for rate limiting API endpoints
 * Uses in-memory storage for simplicity (works in serverless environment per instance)
 *
 * For production with multiple instances, consider:
 * - Vercel KV (Redis) for distributed rate limiting
 * - Upstash Redis
 * - Edge middleware rate limiting
 */

interface RateLimitConfig {
  /**
   * Unique identifier for this rate limiter (e.g., 'api:create-payment')
   */
  id: string;

  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Note: In serverless, this is per-instance. For true distributed rate limiting, use Redis/KV
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if request is rate limited
 * @param identifier - Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Object with success status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const key = `${config.id}:${identifier}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // If no entry exists or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  // Increment request count
  entry.count++;

  const remaining = Math.max(0, config.limit - entry.count);
  const success = entry.count <= config.limit;

  return {
    success,
    limit: config.limit,
    remaining,
    reset: entry.resetTime,
  };
}

/**
 * Get client identifier for rate limiting
 * Uses IP address from various headers (Vercel, Cloudflare, etc.)
 */
export function getClientIdentifier(request: Request): string {
  // Try various headers that might contain the real IP
  const headers = request.headers;

  // Vercel
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Other proxies
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a static identifier (not ideal, but prevents crashes)
  return 'unknown';
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  // Payment intent creation - moderate limit (users might retry failed payments)
  createPaymentIntent: {
    id: 'api:create-payment-intent',
    limit: 10,
    windowMs: 60 * 1000, // 10 requests per minute
  },

  // Order creation - strict limit (should only happen once per successful payment)
  createOrder: {
    id: 'api:create-order',
    limit: 5,
    windowMs: 60 * 1000, // 5 requests per minute
  },

  // Shipping quote - moderate limit
  shippingQuote: {
    id: 'api:shipping-quote',
    limit: 20,
    windowMs: 60 * 1000, // 20 requests per minute
  },

  // Exchange rates - generous limit (public data)
  exchangeRates: {
    id: 'api:exchange-rates',
    limit: 60,
    windowMs: 60 * 1000, // 60 requests per minute
  },

  // Image conversion - higher limit for admins uploading multiple product images
  convertImage: {
    id: 'api:convert-image',
    limit: 50,
    windowMs: 60 * 1000, // 50 requests per minute (admins upload many images)
  },
} as const;
