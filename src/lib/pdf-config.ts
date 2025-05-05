
import { pdfjs } from 'react-pdf';

// Ensure PDF.js worker is properly configured
export function configurePdfWorker() {
  try {
    // Make sure pdfjs is loaded first
    if (!pdfjs) {
      console.error('PDF.js is not loaded');
      return false;
    }
    
    // PDF.js sometimes doesn't immediately expose GlobalWorkerOptions
    // Try to set it with a small delay to ensure library is fully loaded
    if (!pdfjs.GlobalWorkerOptions) {
      console.warn('PDF.js GlobalWorkerOptions not found initially, creating fallback');
      // @ts-ignore - In some cases we need to manually initialize this object
      pdfjs.GlobalWorkerOptions = {}; 
    }
    
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    console.log('PDF.js worker configured successfully:', workerSrc);
    
    return true;
  } catch (error) {
    console.error('Failed to configure PDF.js worker:', error);
    return false;
  }
}

// Initialize PDF.js worker
const configured = configurePdfWorker();
console.log('PDF.js worker initialization result:', configured);

// Export configured pdfjs for use elsewhere
export { pdfjs };
