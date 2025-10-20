import { loadStripe, Stripe } from '@stripe/stripe-js';
import StripeNode from 'stripe';

// Stripe configuration interface
interface StripeConfig {
  publishableKey: string;
  secretKey: string;
}

// Get Stripe configuration from environment variables
const stripeConfig: StripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
};

// Validate Stripe configuration
const validateStripeConfig = (): void => {
  // Check the actual config values directly (not process.env)
  // because Next.js replaces env vars at build time
  const missingVars: string[] = [];

  // Always validate publishable key (needed on both client and server)
  if (!stripeConfig.publishableKey) missingVars.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');

  // Only validate secret key on server (not available in browser)
  if (typeof window === 'undefined' && !stripeConfig.secretKey) {
    missingVars.push('STRIPE_SECRET_KEY');
  }

  if (missingVars.length > 0) {
    console.warn(
      `Missing Stripe environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file. See README for setup instructions.'
    );
  }
};

// Validate configuration on initialization
validateStripeConfig();

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    if (!stripeConfig.publishableKey) {
      console.error('Cannot initialize Stripe: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing');
      return null;
    }

    stripePromise = loadStripe(stripeConfig.publishableKey);
  }
  return stripePromise;
};

// Server-side Stripe instance
export const stripe = new StripeNode(stripeConfig.secretKey || 'dummy_key', {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});
