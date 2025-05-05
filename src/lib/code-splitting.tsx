
import React, { lazy, Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';

// Preload map to track which modules have been requested for preloading
const preloadMap = new Map<string, Promise<any>>();

/**
 * Enhanced lazy loading utility with named routes for better debugging
 * and preloading capabilities
 */
export function lazyLoad(
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  routeName: string = 'unnamed'
) {
  // Store the import function for potential preloading
  if (!preloadMap.has(routeName)) {
    preloadMap.set(routeName, importFn());
  }
  
  // Create the lazy component
  const LazyComponent = lazy(() => {
    console.log(`Loading route: ${routeName}`);
    // Use the cached promise if available
    return preloadMap.get(routeName) || importFn();
  });
  
  // Return the component with its own suspense boundary
  return function WrappedLazyComponent(props: any) {
    return (
      <Suspense fallback={
        <LoadingState 
          variant="skeleton" 
          count={2} 
          height="h-24" 
          className="max-w-3xl mx-auto mt-4"
        />
      }>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Utility to preload specific routes in the background
 */
export function preloadRoute(routeName: string) {
  const importFn = preloadMap.get(routeName);
  if (importFn) {
    // The import is already being loaded, no need to trigger again
    return importFn;
  }
  return null;
}

/**
 * Preload the most common routes on idle time
 */
export function preloadCommonRoutes() {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      // Preload the most common routes in order of likely usage
      preloadRoute('home');
      preloadRoute('vademecum');
      preloadRoute('biblioteca');
    }, { timeout: 2000 });
  }
}

// Start preloading common routes
preloadCommonRoutes();
