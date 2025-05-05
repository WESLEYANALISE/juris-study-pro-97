
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
