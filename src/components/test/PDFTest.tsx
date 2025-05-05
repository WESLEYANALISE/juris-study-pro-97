
import { useEffect } from 'react';
import { pdfjs, configurePdfWorker } from '@/lib/pdf-config';

export function PDFTest() {
  useEffect(() => {
    // Initial check
    console.log("PDFTest mounted, checking PDF.js configuration");
    
    // Setup multiple retries to ensure PDF.js is properly initialized
    const checkAndConfigurePdfJs = () => {
      console.log("Check #1: PDF.js version:", pdfjs?.version || 'not loaded');
      
      // Check if worker is configured
      if (pdfjs?.GlobalWorkerOptions?.workerSrc) {
        console.log("PDF.js worker is configured:", pdfjs.GlobalWorkerOptions.workerSrc);
      } else {
        console.warn("PDF.js worker not detected, attempting to configure...");
        const success = configurePdfWorker();
        console.log("Reconfiguration attempt:", success ? "successful" : "failed");
        
        // If still not successful, try again with a delay
        if (!success || !pdfjs?.GlobalWorkerOptions?.workerSrc) {
          console.log("Scheduling another configuration attempt...");
          setTimeout(checkAndConfigurePdfJs, 200);
        }
      }
    };
    
    // Start checking with a small delay to allow other scripts to load
    setTimeout(checkAndConfigurePdfJs, 100);
    
    return () => {
      console.log("PDFTest unmounted");
    };
  }, []);
  
  return (
    <div className="hidden">
      {/* This component is just for testing PDF.js configuration */}
    </div>
  );
}
