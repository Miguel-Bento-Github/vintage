import { useQuery } from '@tanstack/react-query';
import { getRealTimeShippingQuote, getShippingEstimate } from '@/lib/shipping';
import type { ShippingZone } from '@/lib/shipping';

interface ShippingQuote {
  cost: number;
  carrier: string;
  service: string;
  zone: ShippingZone;
  estimatedDays: string;
  source: 'api' | 'static';
  currency: string;
}

/**
 * Hook to fetch real-time shipping quotes with TanStack Query
 *
 * Benefits:
 * - Automatic caching (1 hour stale time)
 * - Request deduplication
 * - Automatic retries
 * - Loading and error states
 * - Background refetching
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param postalCode - Optional postal code for more accurate rates
 * @param weightGrams - Optional weight in grams (defaults to 500g)
 */
export function useShippingQuote(
  countryCode: string,
  postalCode?: string,
  weightGrams?: number
) {
  return useQuery<ShippingQuote>({
    queryKey: ['shipping-quote', countryCode, postalCode, weightGrams || 500],
    queryFn: async () => {
      try {
        return await getRealTimeShippingQuote(countryCode, postalCode, weightGrams);
      } catch (error) {
        // Fallback to static estimate if API fails
        console.warn('Shipping API failed, using static estimate:', error);
        const staticEstimate = getShippingEstimate(countryCode, weightGrams);
        return {
          cost: staticEstimate.cost,
          carrier: 'Standard',
          service: `${staticEstimate.zone} shipping`,
          zone: staticEstimate.zone,
          estimatedDays: staticEstimate.estimatedDays,
          source: 'static' as const,
          currency: 'USD',
        };
      }
    },
    enabled: !!countryCode, // Only fetch when country is selected
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Use cached data if available
  });
}
