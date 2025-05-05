
// Import React first
import React from 'react';
import ReactDOM from 'react-dom/client';

// PDF.js setup must happen before any component imports
console.log('Initializing PDF.js configuration...');
import { pdfjs, configurePdfWorker } from '@/lib/pdf-config';

// Ensure the worker is configured
const workerConfigured = configurePdfWorker();
console.log('Initial PDF.js worker configuration result:', workerConfigured);

// Delay React initialization slightly to ensure PDF.js configuration completes
setTimeout(() => {
  console.log('Starting React application initialization');
  
  // Now import the rest of the app
  import('./App').then(({ default: App }) => {
    import('./index.css').then(() => {
      // Import test component
      import('./components/test/PDFTest').then(({ PDFTest }) => {
        console.log('All modules loaded, starting React render');
        
        // Try configuring PDF.js one more time before render
        configurePdfWorker();
        
        // Render the React application
        ReactDOM.createRoot(document.getElementById('root')!).render(
          <React.StrictMode>
            <PDFTest /> {/* Test component to ensure PDF.js is configured */}
            <App />
          </React.StrictMode>,
        );
      });
    });
  });
}, 100); // Small delay to allow PDF.js initialization to complete
