import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Create a client with optimized cache settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (antigo cacheTime)
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

// Setup persistence to localStorage
if (typeof window !== 'undefined') {
  const localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'CACHED_QUERIES',
    serialize: (data) => {
      const serialized = JSON.stringify(data);
      if (serialized.length > 1_500_000) { // ~1.5MB
        return JSON.stringify({
          timestamp: Date.now(),
          buster: String(Date.now()),
          clientState: {
            mutations: [],
            queries: []
          }
        });
      }
      return serialized;
    }
  });

  // Setup the persistence
  persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    buster: String(Date.now()),
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        const queryKey = query.queryKey[0];
        if (typeof queryKey !== 'string') return false;
        return (
          queryKey.includes('vademecum') || 
          queryKey.includes('biblioteca') || 
          queryKey.includes('law-')
        );
      },
    },
  });
}

export default queryClient;
