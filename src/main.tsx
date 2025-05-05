
import React from 'react';
import ReactDOM from 'react-dom/client';
import { configurePdfWorker } from './lib/pdf-config';
import { registerSW } from './registerSW';

// Initialize essential services immediately
configurePdfWorker();

// Register service worker in production
if (import.meta.env.PROD) {
  registerSW();
}

// Create a function for rendering the app
const renderApp = async () => {
  // Dynamically import components for code splitting
  const [{ default: App }, { queryClient }] = await Promise.all([
    import('./App'),
    import('./lib/query-client'), // Import the optimized query client
    import('./index.css')
  ]);
  
  // Set up query persistence if needed
  if (typeof window !== 'undefined') {
    try {
      const { persistQueryClient } = await import('@tanstack/react-query-persist-client');
      const { createSyncStoragePersister } = await import('@tanstack/query-sync-storage-persister');
      
      const localStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
        key: 'CACHED_QUERIES',
        serialize: (data) => {
          try {
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
          } catch (err) {
            console.error('Error serializing cache:', err);
            return '{}';
          }
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
    } catch (err) {
      console.error('Failed to setup query persistence:', err);
      // Continue without persistence if it fails
    }
  }
  
  // Set up any missing PDF.js configurations if needed
  const { pdfjs } = await import('react-pdf');
  if (typeof window !== 'undefined' && window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
    const workerSrc = import.meta.env.PROD 
      ? 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
      : '/pdf.worker.min.js';
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }
  
  // Render the app with query client
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Render app immediately without delay
renderApp().catch(error => {
  console.error('Failed to render app:', error);
});
