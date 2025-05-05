
// Import React first
import React from 'react';
import ReactDOM from 'react-dom/client';

// PDF.js setup must happen before any component imports
console.log('Initializing PDF.js configuration...');
import { configurePdfWorker } from '@/lib/pdf-config';

// Make sure the worker is configured
configurePdfWorker();

// Delay React initialization slightly to ensure PDF.js configuration completes
setTimeout(() => {
  console.log('Starting React application initialization');
  
  // Now import the rest of the app
  import('./App').then(({ default: App }) => {
    import('./index.css').then(() => {
      console.log('All modules loaded, starting React render');
      
      // Try configuring PDF.js one more time before render
      configurePdfWorker();
      
      // Render the React application
      ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
    });
  });
}, 200); // Slightly longer delay to ensure PDF.js initialization completes
