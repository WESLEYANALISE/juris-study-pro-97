
import React from 'react';
import ReactDOM from 'react-dom/client';

// Load PDF.js worker configuration first
import { configurePdfWorker } from '@/lib/pdf-config';
import { registerSW } from './registerSW';

console.log('Initializing application in main.tsx');

// Configure worker immediately 
configurePdfWorker();

// Add PDF.js to window to ensure it's available globally
import { pdfjs } from 'react-pdf';
if (typeof window !== 'undefined') {
  window.pdfjsLib = pdfjs;
}

// Register service worker in production
if (import.meta.env.PROD) {
  registerSW();
}

// Create a function for rendering the app
const renderApp = async () => {
  // Configure again before rendering
  configurePdfWorker();
  
  const { default: App } = await import('./App');
  await import('./index.css');
  
  console.log('Rendering React application');
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Render app immediately (removed delay to simplify startup)
renderApp().catch(error => {
  console.error('Failed to render app:', error);
});
