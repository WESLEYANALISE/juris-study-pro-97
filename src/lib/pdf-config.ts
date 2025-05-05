
import { pdfjs as reactPdfJs } from 'react-pdf';

// Define the PDF.js version - use only one consistent version
const pdfjsVersion = '3.11.174';

// Use CDN URL for the worker in production, local for development
const workerSrc = import.meta.env.PROD 
  ? `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`
  : '/pdf.worker.min.js';

/**
 * Configures the PDF.js worker globally to ensure consistent behavior
 * across all PDF viewers in the application
 */
export function configurePdfWorker() {
  try {
    console.log('Configuring PDF worker with version:', pdfjsVersion);
    
    // Set worker directly on pdfjs.GlobalWorkerOptions
    if (reactPdfJs.GlobalWorkerOptions) {
      reactPdfJs.GlobalWorkerOptions.workerSrc = workerSrc;
    } else {
      console.warn('GlobalWorkerOptions not available, using alternative configuration');
      // Use the older method of configuring if GlobalWorkerOptions is undefined
      if (typeof window !== 'undefined') {
        window.__pdfjsWorkerSrc = workerSrc;
      }
    }
    
    // Also set on window object for global access
    if (typeof window !== 'undefined') {
      window.pdfjsLib = window.pdfjsLib || reactPdfJs;
      
      if (window.pdfjsLib) {
        // Ensure GlobalWorkerOptions exists
        window.pdfjsLib.GlobalWorkerOptions = window.pdfjsLib.GlobalWorkerOptions || {};
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      }
    }
    
    console.log('PDF.js worker configuration complete. Worker URL:', workerSrc);
    return true;
  } catch (error) {
    console.error('Error configuring PDF worker:', error);
    return false;
  }
}

// Configure immediately
configurePdfWorker();

// Export the configured pdfjs object
export const pdfjs = reactPdfJs;

// Helper function to process PDF URLs from Supabase storage
export function processPdfUrl(url: string): string {
  if (!url) return '';
  
  // If already a full URL, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // Get base URL from environment or use default Supabase URL
  const baseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co";
  const fullUrl = `${baseUrl}/storage/v1/object/public/agoravai/${url}`;
  
  console.log('Processed PDF URL:', fullUrl);
  return fullUrl;
}
