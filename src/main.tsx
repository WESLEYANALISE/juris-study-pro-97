
import React from 'react';
import ReactDOM from 'react-dom/client';

// Load PDF.js worker configuration first
import { configurePdfWorker } from '@/lib/pdf-config';

console.log('Initializing application in main.tsx');

// Configure worker immediately and repeatedly to ensure it's set
configurePdfWorker();

// Add PDF.js to window to ensure it's available globally
import { pdfjs } from 'react-pdf';
if (typeof window !== 'undefined') {
  window.pdfjsLib = pdfjs;
}

// Create a function for rendering the app
const renderApp = async () => {
  // Configure again before rendering
  configurePdfWorker();
  
  const { default: App } = await import('./App');
  await import('./index.css');
  
  // One final configuration before render
  configurePdfWorker();
  
  console.log('Rendering React application');
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Delay rendering slightly to ensure PDF.js is fully loaded
setTimeout(() => {
  renderApp().catch(error => {
    console.error('Failed to render app:', error);
  });
}, 100);
