
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
    onError: (error) => {
      toast.error(`Erro na consulta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(`Erro na operação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    },
  }),
});

// Setup persistence to localStorage
if (typeof window !== 'undefined') {
  const localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'CACHED_QUERIES',
    // Limit storage size to avoid local storage limit issues
    serialize: (data) => {
      const serialized = JSON.stringify(data);
      // If data is too large, only store minimal cache
      if (serialized.length > 1_500_000) { // ~1.5MB
        return JSON.stringify({
          timestamp: data.timestamp,
          buster: data.buster,
          // Store only metadata without actual query results
          queries: data.queries.map((query: any) => ({
            ...query,
            state: { ...query.state, data: null }
          }))
        });
      }
      return serialized;
    }
  });

  // Setup the persistence
  persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    // Only persist after delay to avoid excessive writes
    buster: String(new Date().getTime()),
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // Only persist queries that should be cached
        const queryKey = query.queryKey[0];
        if (typeof queryKey !== 'string') return false;
        
        // Cache law articles, books, and other static content
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
