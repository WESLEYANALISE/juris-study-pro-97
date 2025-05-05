
import React from 'react';
import ReactDOM from 'react-dom/client';

// CRITICAL: Import and configure PDF.js before importing any components that might use it
import { configurePdfWorker } from '@/lib/pdf-config';
console.log('Initializing PDF.js in main.tsx...');

// Try to configure the worker immediately
configurePdfWorker();

// Use dynamic imports to ensure PDF.js is configured before React components render
const renderApp = () => {
  // Configure PDF.js again just to be safe
  configurePdfWorker();
  
  import('./App').then(({ default: App }) => {
    import('./index.css').then(() => {
      console.log('All modules loaded, starting React render');
      
      // Configure one last time right before render
      configurePdfWorker();
      
      // Render the React application
      ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    });
  });
};

// Small delay to ensure PDF.js has time to initialize
setTimeout(renderApp, 100);
