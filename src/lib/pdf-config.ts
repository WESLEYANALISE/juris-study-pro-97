
// Import directly from the library
import { pdfjs as pdfjsLib } from 'react-pdf';

// Make a safe copy of pdfjs that we'll export
let pdfjs = pdfjsLib;

// Ensure PDF.js worker is properly configured
export function configurePdfWorker() {
  try {
    // Make sure pdfjs is loaded first
    if (!pdfjs) {
      console.error('PDF.js is not loaded');
      return false;
    }
    
    // Create a global workerSrc that won't fail
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    
    // Handle the case where GlobalWorkerOptions doesn't exist yet
    if (!pdfjs.GlobalWorkerOptions) {
      console.warn('PDF.js GlobalWorkerOptions not found, creating a new object');
      // Create the object if it doesn't exist
      // @ts-ignore - We need to create this object if it doesn't exist
      pdfjs.GlobalWorkerOptions = {};
    }
    
    // Now set the workerSrc
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    
    console.log('PDF.js worker configured successfully:', workerSrc);
    return true;
  } catch (error) {
    console.error('Failed to configure PDF.js worker:', error);
    return false;
  }
}

// Try to initialize immediately
const configured = configurePdfWorker();
console.log('PDF.js worker initialization result:', configured);

// Export configured pdfjs for use elsewhere
export { pdfjs };
