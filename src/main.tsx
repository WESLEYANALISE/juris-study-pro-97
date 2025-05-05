
import React from 'react';
import ReactDOM from 'react-dom/client';

// Load PDF.js worker script directly to ensure it's available
document.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = import.meta.env.PROD 
    ? 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
    : '/pdf.worker.min.js';
  script.async = false;
  script.defer = false;
  document.head.appendChild(script);
});

// Configure PDF.js worker
import { configurePdfWorker } from '@/lib/pdf-config';
import { registerSW } from './registerSW';

console.log('Initializing application in main.tsx');

// Configure worker immediately 
configurePdfWorker();

// Add PDF.js to window to ensure it's available globally
import { pdfjs } from 'react-pdf';
if (typeof window !== 'undefined') {
  window.pdfjsLib = pdfjs;
  
  // Set workerSrc property directly, not trying to assign to GlobalWorkerOptions
  if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = import.meta.env.PROD 
      ? 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
      : '/pdf.worker.min.js';
  }
}

// Register service worker in production
if (import.meta.env.PROD) {
  registerSW();
}

// Create a function for rendering the app
const renderApp = async () => {
  // Configure again before rendering to ensure it's done
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

// Render app with a small delay to ensure PDF.js worker is loaded
setTimeout(() => {
  renderApp().catch(error => {
    console.error('Failed to render app:', error);
  });
}, 100);
