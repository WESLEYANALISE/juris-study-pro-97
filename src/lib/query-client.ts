
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

// Create a client with optimized cache settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      const errorMessage = query.meta?.errorMessage as string;
      toast.error(errorMessage || `Erro na consulta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const errorMessage = mutation.meta?.errorMessage as string;
      toast.error(errorMessage || `Erro na operação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    },
  }),
});

// Setup persistence
if (typeof window !== 'undefined') {
  const localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
  });

  persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export default queryClient;
