
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { PDFTest } from './components/test/PDFTest';

// Initialize PDF.js configuration early
import '@/lib/pdf-config';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PDFTest /> {/* Test component to ensure PDF.js is configured */}
    <App />
  </React.StrictMode>,
)
