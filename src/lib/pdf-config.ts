
import { pdfjs } from 'react-pdf';

// Ensure PDF.js worker is properly configured
export function configurePdfWorker() {
  try {
    // Check if GlobalWorkerOptions is defined before setting workerSrc
    if (pdfjs && pdfjs.GlobalWorkerOptions) {
      const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      console.log('PDF.js worker configured successfully:', workerSrc);
      return true;
    } else {
      console.error('PDF.js GlobalWorkerOptions is not available');
      return false;
    }
  } catch (error) {
    console.error('Failed to configure PDF.js worker:', error);
    return false;
  }
}

// Initialize PDF.js worker
configurePdfWorker();

// Export configured pdfjs for use elsewhere
export { pdfjs };
