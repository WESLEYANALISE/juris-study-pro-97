
import { pdfjs as reactPdfJs } from 'react-pdf';

// Define the PDF.js version
const pdfjsVersion = '3.11.174'; // Updated to match the version from console.logs
console.log(`PDF.js initialization - Using version ${pdfjsVersion}`);

// Define CDN worker URLs in priority order
const WORKER_URLS = [
  // First priority: CDN URLs
  `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`,
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`,
  // Local fallback options
  '/pdf.worker.min.js',
  'pdf.worker.js'
];

/**
 * Creates a global pdfjs object with proper worker configuration
 * This is critical to make sure PDF.js is available globally
 */
export function configurePdfWorker() {
  try {
    // Defensive check - wait until react-pdf's pdfjs is available
    if (!reactPdfJs) {
      console.error('PDF.js not available yet');
      return false;
    }

    // Make sure GlobalWorkerOptions exists before trying to set workerSrc
    if (!reactPdfJs.GlobalWorkerOptions) {
      console.log('Creating GlobalWorkerOptions object...');
      // @ts-ignore - This is a workaround for when GlobalWorkerOptions is undefined
      reactPdfJs.GlobalWorkerOptions = {};
    }

    // Only set workerSrc if not already set
    if (!reactPdfJs.GlobalWorkerOptions.workerSrc) {
      // Try each worker URL in order until one works
      for (const workerUrl of WORKER_URLS) {
        try {
          // Attempt to set the worker source
          reactPdfJs.GlobalWorkerOptions.workerSrc = workerUrl;
          console.log(`PDF.js worker configured with: ${workerUrl}`);
          return true;
        } catch (innerError) {
          console.warn(`Failed to set worker URL ${workerUrl}:`, innerError);
          // Continue to next URL
        }
      }
      console.error('All worker URLs failed');
      return false;
    } else {
      console.log(`Worker already configured: ${reactPdfJs.GlobalWorkerOptions.workerSrc}`);
      return true;
    }
  } catch (error) {
    console.error('Error configuring PDF.js worker:', error);
    return false;
  }
}

// Immediate initialization attempt
console.log('Attempting initial PDF worker configuration...');
configurePdfWorker();

// Export the configured pdfjs object
export const pdfjs = reactPdfJs;
