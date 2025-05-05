
import React from 'react';
import ReactDOM from 'react-dom/client';
import { configurePdfWorker } from './lib/pdf-config';
import { registerSW } from './registerSW';
import App from './App';
import './index.css';

// Initialize essential services immediately
configurePdfWorker();

// Register service worker in production
if (import.meta.env.PROD) {
  registerSW();
}

// Set up any missing PDF.js configurations if needed
if (typeof window !== 'undefined' && window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
  const workerSrc = import.meta.env.PROD 
    ? 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
    : '/pdf.worker.min.js';
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}

// Render the app
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found');
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
