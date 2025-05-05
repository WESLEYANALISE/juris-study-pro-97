
import { pdfjs as reactPdfJs } from 'react-pdf';

// Define the PDF.js version
const pdfjsVersion = '3.11.174'; // Updated to match the version from console.logs
console.log(`PDF.js initialization - Using version ${pdfjsVersion}`);

// Define CDN worker URLs in priority order
const WORKER_URLS = [
  // Direct worker specification
  'pdf.worker.js',
  // CDN fallbacks
  `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`,
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`,
  // Local fallback
  `/pdf.worker.min.js`,
];

/**
 * Creates and configures the PDF.js worker with better error handling
 */
export function configurePdfWorker() {
  try {
    // Wait until react-pdf's pdfjs is available
    if (!reactPdfJs) {
      console.error('PDF.js not available yet');
      return false;
    }

    // Create GlobalWorkerOptions if needed
    if (!reactPdfJs.GlobalWorkerOptions) {
      console.log('Creating GlobalWorkerOptions object...');
      // @ts-ignore - Creating the object since it doesn't exist
      reactPdfJs.GlobalWorkerOptions = {};
    }

    // Only set workerSrc if not already set
    if (!reactPdfJs.GlobalWorkerOptions.workerSrc) {
      // Set to the first worker URL from our list
      reactPdfJs.GlobalWorkerOptions.workerSrc = WORKER_URLS[0];
      console.log(`PDF.js worker configured: ${reactPdfJs.GlobalWorkerOptions.workerSrc}`);
    } else {
      console.log(`Worker already configured: ${reactPdfJs.GlobalWorkerOptions.workerSrc}`);
      return true;
    }

    return true;
  } catch (error) {
    console.error('Error configuring PDF.js worker:', error);
    return false;
  }
}

// Try to perform initial configuration when this module loads
console.log('Attempting initial PDF worker configuration...');
const initialConfig = configurePdfWorker();
console.log('Initial PDF worker configuration result:', initialConfig ? 'success' : 'failed');

// Export the pdfjs object and configuration function
export const pdfjs = reactPdfJs;
