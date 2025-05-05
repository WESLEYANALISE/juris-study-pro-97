
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { PDFTest } from './components/test/PDFTest';

// Force immediate PDF.js configuration before ANY component renders
// The import must happen before ReactDOM.createRoot
import '@/lib/pdf-config';
console.log('PDF.js configuration loaded in main.tsx');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PDFTest /> {/* Test component to ensure PDF.js is configured */}
    <App />
  </React.StrictMode>,
)
