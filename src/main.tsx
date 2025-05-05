
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { PDFTest } from './components/test/PDFTest';

// Ensure PDF.js is configured early, before any component tries to use it
import '@/lib/pdf-config';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PDFTest /> {/* Test component to ensure PDF.js is configured */}
    <App />
  </React.StrictMode>,
)
