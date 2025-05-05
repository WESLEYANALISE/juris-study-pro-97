
import { useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { configurePdfWorker } from '@/lib/pdf-config';

export function PDFTest() {
  useEffect(() => {
    // Check PDF.js configuration on component mount
    console.log('PDFTest component mounted - PDF.js status check');
    
    try {
      console.log('PDF.js version:', pdfjs.version);
      
      if (pdfjs.GlobalWorkerOptions && pdfjs.GlobalWorkerOptions.workerSrc) {
        console.log('✅ PDF.js worker is configured:', pdfjs.GlobalWorkerOptions.workerSrc);
      } else {
        console.warn('⚠️ PDF.js worker not configured, attempting to configure now');
        configurePdfWorker();
      }
      
      // Verify configuration after a short delay
      setTimeout(() => {
        console.log('Follow-up PDF.js configuration check:');
        console.log('PDF.js version:', pdfjs.version);
        
        if (pdfjs.GlobalWorkerOptions && pdfjs.GlobalWorkerOptions.workerSrc) {
          console.log('✅ PDF.js worker is configured:', pdfjs.GlobalWorkerOptions.workerSrc);
        } else {
          console.error('❌ PDF.js worker still not configured after retry');
          // Try one more time with direct approach
          pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
        }
      }, 1000);
    } catch (err) {
      console.error('Error in PDFTest component:', err);
    }
  }, []);

  // This is just a diagnostic component, no visible UI
  return null;
}
