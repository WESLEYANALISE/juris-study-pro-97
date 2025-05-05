
import * as PDFJS from 'pdfjs-dist';
import { pdfjs } from 'react-pdf';

// Make sure we're using consistent PDF.js instance
const pdfjsVersion = pdfjs.version || '3.4.120';
console.log(`PDF.js version available in react-pdf: ${pdfjsVersion}`);

// Create a function that properly configures the PDF.js worker
export function configurePdfWorker() {
  try {
    console.log('Configuring PDF.js worker...');

    // Try to use the CDN worker version that matches our PDF.js version
    const cdnWorkerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;
    
    // Local fallback if we're running in development
    const localWorkerUrl = `/pdf.worker.min.js`;
    
    // Try different worker sources if the main one fails
    const workerUrls = [
      cdnWorkerUrl,
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`,
      localWorkerUrl
    ];
    
    // Directly check if pdfjs exists and has GlobalWorkerOptions
    if (!pdfjs || !pdfjs.GlobalWorkerOptions) {
      console.error('PDF.js or GlobalWorkerOptions is not available yet');
      
      // Create GlobalWorkerOptions if it doesn't exist
      if (pdfjs && !pdfjs.GlobalWorkerOptions) {
        console.warn('Creating missing GlobalWorkerOptions object');
        // @ts-ignore - We need to create this object if it doesn't exist
        pdfjs.GlobalWorkerOptions = {};
      }
    }

    // Set the worker source if we have access to GlobalWorkerOptions
    if (pdfjs && pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrls[0];
      console.log(`PDF.js worker configured: ${pdfjs.GlobalWorkerOptions.workerSrc}`);
      return true;
    } else {
      console.error('Could not configure PDF.js worker - GlobalWorkerOptions not available');
      return false;
    }
  } catch (error) {
    console.error('Error configuring PDF.js worker:', error);
    return false;
  }
}

// Immediately try to configure the worker when this module loads
configurePdfWorker();

// Export for use elsewhere
export { pdfjs };
