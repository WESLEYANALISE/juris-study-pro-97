
import React, { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

/**
 * Higher order component for lazy loading components with Suspense
 * @param importFn Function that imports the component
 * @returns Lazy loaded component with loading state
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  const LazyComponent = React.lazy(importFn);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense 
      fallback={
        <Card className="p-6 flex items-center justify-center min-h-[200px]">
          <LoadingSpinner />
        </Card>
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Utility for prefetching components before they're needed
 * @param importFn Function that imports the component
 */
export function prefetchComponent(importFn: () => Promise<any>) {
  // This starts loading the component in the background
  importFn();
}
