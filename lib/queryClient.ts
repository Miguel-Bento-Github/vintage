import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data is considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Cache time: Unused data stays in cache for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests once
      retry: 1,
      // Refetch on window focus for real-time data
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});
