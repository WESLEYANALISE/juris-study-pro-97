
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

/**
 * Routes manager for preloading and code splitting
 * Helps manage which routes to preload based on user navigation patterns
 */
export class RoutePreloader {
  private static preloadedRoutes = new Set<string>();
  
  /**
   * Preload a route's components
   */
  static preloadRoute(routePath: string, importFn: () => Promise<any>) {
    if (!this.preloadedRoutes.has(routePath)) {
      console.log(`Preloading route: ${routePath}`);
      prefetchComponent(importFn);
      this.preloadedRoutes.add(routePath);
    }
  }
  
  /**
   * Check if a route has been preloaded
   */
  static isRoutePreloaded(routePath: string): boolean {
    return this.preloadedRoutes.has(routePath);
  }
}
