
import React, { useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { configurePdfWorker } from '@/lib/pdf-config';

export function PDFConfigValidator() {
  useEffect(() => {
    console.log('PDFConfigValidator: Checking PDF.js configuration');
    
    // Check if PDF.js is properly configured
    try {
      // Try to configure again
      configurePdfWorker();
      
      console.log('PDF.js global configuration status:');
      console.log('- window.pdfjsLib exists:', typeof window !== 'undefined' && !!window.pdfjsLib);
      
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        console.log('- window.pdfjsLib.GlobalWorkerOptions exists:', !!window.pdfjsLib.GlobalWorkerOptions);
        if (window.pdfjsLib.GlobalWorkerOptions) {
          console.log('- window.pdfjsLib.GlobalWorkerOptions.workerSrc:', window.pdfjsLib.GlobalWorkerOptions.workerSrc);
        }
      }
      
      console.log('- pdfjs.GlobalWorkerOptions exists:', !!pdfjs.GlobalWorkerOptions);
      if (pdfjs.GlobalWorkerOptions) {
        console.log('- pdfjs.GlobalWorkerOptions.workerSrc:', pdfjs.GlobalWorkerOptions.workerSrc);
      }
      
      // Create test instance to validate configuration
      if (pdfjs.getDocument) {
        console.log('- pdfjs.getDocument exists, PDF.js should be able to load documents');
      } else {
        console.warn('- pdfjs.getDocument is missing, PDF.js may not work correctly');
      }
    } catch (error) {
      console.error('Error during PDF.js validation:', error);
    }
  }, []);
  
  return null; // This component doesn't render anything
}
