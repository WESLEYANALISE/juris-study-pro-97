
import { pdfjs as reactPdfJs } from 'react-pdf';

// Get PDF.js version from react-pdf
const pdfjsVersion = reactPdfJs.version || '3.4.120';
console.log(`PDF.js initialization - Using version ${pdfjsVersion}`);

// Define worker sources with fallbacks
const WORKER_SOURCES = [
  // CDN workers
  `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`,
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`,
  // Local fallback
  `/pdf.worker.min.js`
];

/**
 * Ensures GlobalWorkerOptions exists and sets the worker source
 * This is the key fix for the "Cannot set properties of undefined (setting 'workerSrc')" error
 */
function ensureGlobalWorkerOptions() {
  try {
    // Check if pdfjs exists
    if (!reactPdfJs) {
      console.error('PDF.js is not loaded yet');
      return false;
    }
    
    // If GlobalWorkerOptions doesn't exist on pdfjs, create it
    if (!reactPdfJs.GlobalWorkerOptions) {
      console.log('Creating missing GlobalWorkerOptions object');
      // @ts-ignore - Creating the object if it doesn't exist
      reactPdfJs.GlobalWorkerOptions = {};
    }
    
    return true;
  } catch (e) {
    console.error('Failed to ensure GlobalWorkerOptions exists:', e);
    return false;
  }
}

/**
 * Configures the PDF.js worker with fallback options
 */
export function configurePdfWorker() {
  try {
    console.log('Configuring PDF.js worker...');
    
    // Make sure GlobalWorkerOptions exists
    const optionsExist = ensureGlobalWorkerOptions();
    if (!optionsExist) {
      console.log('GlobalWorkerOptions unavailable. Will retry later.');
      return false;
    }
    
    // If worker source is already set, don't override it
    if (reactPdfJs.GlobalWorkerOptions.workerSrc) {
      console.log(`Worker already configured: ${reactPdfJs.GlobalWorkerOptions.workerSrc}`);
      return true;
    }
    
    // Set the worker source to the first option
    reactPdfJs.GlobalWorkerOptions.workerSrc = WORKER_SOURCES[0];
    console.log(`PDF.js worker configured: ${reactPdfJs.GlobalWorkerOptions.workerSrc}`);
    
    return true;
  } catch (error) {
    console.error('Error configuring PDF.js worker:', error);
    return false;
  }
}

// Try to perform initial configuration when this module loads
const initialConfig = configurePdfWorker();
console.log('Initial PDF worker configuration:', initialConfig ? 'success' : 'failed');

// Export for use elsewhere in the app
export const pdfjs = reactPdfJs;
