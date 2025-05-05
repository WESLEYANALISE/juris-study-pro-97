
import React from 'react'
import ReactDOM from 'react-dom/client'

// Import and configure PDF.js FIRST, before anything else
// This ensures PDF.js worker is set up before any components render
console.log('Initializing PDF.js configuration...');
import { configurePdfWorker } from '@/lib/pdf-config';

// Try to configure PDF.js again to be extra safe
configurePdfWorker();

// Now import the rest of the app
import App from './App'
import './index.css'
import { PDFTest } from './components/test/PDFTest';

console.log('PDF.js configuration completed, starting React render');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PDFTest /> {/* Test component to ensure PDF.js is configured */}
    <App />
  </React.StrictMode>,
)
