
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
      
      // Attempt to set the workerSrc safely
      if (pdfjs.GlobalWorkerOptions) {
        const workerSrc = import.meta.env.PROD 
          ? 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
          : '/pdf.worker.min.js';
          
        // Direct assignment to workerSrc property
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        console.log('- Set pdfjs.GlobalWorkerOptions.workerSrc:', workerSrc);
      }
    } catch (error) {
      console.error('Error during PDF.js validation:', error);
    }
  }, []);
  
  return null; // This component doesn't render anything
}
