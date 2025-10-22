/**
 * Email Configuration
 * Central configuration for all email-related settings
 */

export const EMAIL_CONFIG = {
  /**
   * From addresses for different email types
   */
  from: {
    orders: process.env.RESEND_FROM_EMAIL || 'orders@dreamazul.com',
    marketing: process.env.RESEND_FROM_EMAIL || 'hello@dreamazul.com',
    support: process.env.RESEND_FROM_EMAIL || 'support@dreamazul.com',
    noreply: process.env.RESEND_FROM_EMAIL || 'noreply@dreamazul.com',
  },

  /**
   * From names for different email types
   */
  fromName: {
    orders: process.env.RESEND_FROM_NAME || 'Dream Azul',
    marketing: process.env.RESEND_FROM_NAME || 'Dream Azul',
    support: 'Dream Azul Support',
    noreply: 'Dream Azul',
  },

  /**
   * Reply-to addresses
   */
  replyTo: {
    orders: 'orders@dreamazul.com',
    support: 'support@dreamazul.com',
    default: 'hello@dreamazul.com',
  },

  /**
   * Email footer content
   */
  footer: {
    companyName: 'Dream Azul',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
    socialMedia: {
      instagram: 'https://instagram.com/dreamazul',
      facebook: 'https://facebook.com/dreamazul',
      twitter: 'https://twitter.com/dreamazul',
    },
    links: {
      about: '/about',
      contact: '/contact',
      privacy: '/privacy',
      terms: '/terms',
      shipping: '/shipping',
      returns: '/returns',
    },
  },

  /**
   * Unsubscribe link structure
   */
  unsubscribe: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    path: '/unsubscribe',
  },

  /**
   * Email sending limits and throttling
   */
  limits: {
    maxRecipientsPerEmail: 50, // Batch email sending limit
    dailyMarketingEmailsPerUser: 2,
    retryAttempts: 3,
    retryDelay: 1000, // milliseconds
  },

  /**
   * Email template defaults
   */
  templates: {
    maxWidth: 600, // Max width for email container
    primaryColor: '#d4c5b0', // Vintage tan
    accentColor: '#92400e', // Brown
    textColor: '#1a1a1a',
    backgroundColor: '#faf9f7',
    buttonColor: '#92400e',
    buttonTextColor: '#ffffff',
  },
} as const;

/**
 * Get formatted from address for email type
 */
export function getFromAddress(type: keyof typeof EMAIL_CONFIG.from = 'orders'): string {
  const email = EMAIL_CONFIG.from[type];
  const name = EMAIL_CONFIG.fromName[type];
  return `${name} <${email}>`;
}

/**
 * Get unsubscribe URL for a user
 */
export function getUnsubscribeUrl(userEmail: string, token?: string): string {
  const { baseUrl, path } = EMAIL_CONFIG.unsubscribe;
  const params = new URLSearchParams({
    email: userEmail,
    ...(token && { token }),
  });
  return `${baseUrl}${path}?${params.toString()}`;
}

/**
 * Email types for analytics and logging
 */
export enum EmailType {
  ORDER_CONFIRMATION = 'order_confirmation',
  SHIPPING_NOTIFICATION = 'shipping_notification',
  DELIVERY_CONFIRMATION = 'delivery_confirmation',
  ABANDONED_CART = 'abandoned_cart',
  ABANDONED_CART_REMINDER = 'abandoned_cart_reminder',
  ABANDONED_CART_FINAL = 'abandoned_cart_final',
  WELCOME = 'welcome',
  WELCOME_SERIES_2 = 'welcome_series_2',
  WELCOME_SERIES_3 = 'welcome_series_3',
  NEW_ARRIVALS = 'new_arrivals',
  BACK_IN_STOCK = 'back_in_stock',
  PRICE_DROP = 'price_drop',
  REVIEW_REQUEST = 'review_request',
  REENGAGEMENT = 'reengagement',
  PROMOTIONAL = 'promotional',
}
