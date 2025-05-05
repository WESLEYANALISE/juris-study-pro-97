
import { useEffect } from 'react';
import { pdfjs, configurePdfWorker } from '@/lib/pdf-config';

export function PDFTest() {
  useEffect(() => {
    // Log more detailed debugging information
    console.log("PDF.js version:", pdfjs.version);
    
    // Check if PDF.js worker is properly configured
    if (pdfjs.GlobalWorkerOptions && pdfjs.GlobalWorkerOptions.workerSrc) {
      console.log("PDF.js worker source:", pdfjs.GlobalWorkerOptions.workerSrc);
    } else {
      console.warn("PDF.js worker not configured correctly. Attempting to reconfigure...");
      const success = configurePdfWorker();
      console.log("Reconfiguration attempt:", success ? "successful" : "failed");
    }
  }, []);
  
  return (
    <div className="hidden">
      {/* This component is just for testing PDF.js configuration */}
    </div>
  );
}
