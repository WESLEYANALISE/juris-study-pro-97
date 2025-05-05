
import { pdfjs as reactPdfJs } from 'react-pdf';

// Define the PDF.js version - use only one consistent version
const pdfjsVersion = '3.11.174';

// Use CDN URL for the worker in production, local for development
const workerSrc = import.meta.env.PROD 
  ? `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`
  : '/pdf.worker.min.js';

// Cache for loaded PDFs to avoid redownloading
const pdfCache = new Map<string, ArrayBuffer>();

/**
 * Configures the PDF.js worker globally - simplified and more robust
 */
export function configurePdfWorker() {
  try {
    // Only set the workerSrc property, not GlobalWorkerOptions itself
    if (reactPdfJs.GlobalWorkerOptions) {
      reactPdfJs.GlobalWorkerOptions.workerSrc = workerSrc;
      
      // Also set on window object for global access if needed
      if (typeof window !== 'undefined') {
        window.pdfjsLib = window.pdfjsLib || reactPdfJs;
        
        if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        }
      }
      
      console.log('PDF.js worker configuration complete. Worker URL:', workerSrc);
      return true;
    } else {
      console.warn('GlobalWorkerOptions not available');
      return false;
    }
  } catch (error) {
    console.error('Error configuring PDF worker:', error);
    return false;
  }
}

// Run the configuration immediately
configurePdfWorker();

// Export the configured pdfjs object
export const pdfjs = reactPdfJs;

// Helper function to process PDF URLs with caching
export function processPdfUrl(url: string): string {
  if (!url) return '';
  
  // If already a full URL, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // Get base URL from environment or use default Supabase URL
  const baseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co";
  return `${baseUrl}/storage/v1/object/public/agoravai/${url}`;
}

// Function to preload a PDF file and cache it
export async function preloadPdf(url: string): Promise<ArrayBuffer | null> {
  try {
    // Skip if already in cache
    if (pdfCache.has(url)) {
      return pdfCache.get(url) || null;
    }
    
    // Process URL if needed
    const fullUrl = url.startsWith('http') ? url : processPdfUrl(url);
    
    // Fetch and cache the PDF
    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`Failed to load PDF: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    pdfCache.set(url, arrayBuffer);
    return arrayBuffer;
  } catch (error) {
    console.error('Error preloading PDF:', error);
    return null;
  }
}

// Function to get a PDF from cache
export function getCachedPdf(url: string): ArrayBuffer | null {
  return pdfCache.get(url) || null;
}

// Function to clear PDF cache for memory management
export function clearPdfCache(specificUrl?: string) {
  if (specificUrl) {
    pdfCache.delete(specificUrl);
  } else {
    pdfCache.clear();
  }
}
