import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      staleTime: 15 * 1000,
    },
    mutations: {
      retry: 1,
      retryDelay: 1200,
    },
  },
});
