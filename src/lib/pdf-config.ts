
import { pdfjs as reactPdfJs } from 'react-pdf';

// Define the PDF.js version
const pdfjsVersion = '3.11.174'; // Updated to match the version from console.logs

// Direct import of the worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
console.log('Worker URL from direct import:', pdfWorker);

/**
 * Creates a global pdfjs object with proper worker configuration
 */
export function configurePdfWorker() {
  try {
    console.log('Configuring PDF worker, reactPdfJs available:', !!reactPdfJs);
    
    // Manually set PDF.js on window object to ensure it's globally accessible
    if (typeof window !== 'undefined') {
      if (!window.pdfjsLib) {
        console.log('Setting pdfjsLib on window');
        window.pdfjsLib = reactPdfJs;
      }
      
      // Set worker directly using the imported worker URL
      console.log('Setting worker src to:', pdfWorker);
      reactPdfJs.GlobalWorkerOptions.workerSrc = pdfWorker;
      
      // Also set on window object for redundancy
      if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error configuring PDF worker:', error);
    return false;
  }
}

// Try to configure immediately
configurePdfWorker();

// Export the configured pdfjs object
export const pdfjs = reactPdfJs;
