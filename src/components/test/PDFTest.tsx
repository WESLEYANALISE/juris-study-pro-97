
import { useEffect } from 'react';
import { pdfjs, configurePdfWorker } from '@/lib/pdf-config';

export function PDFTest() {
  useEffect(() => {
    // Check if PDF.js is configured correctly
    console.log("PDF.js version:", pdfjs.version);
    console.log("PDF.js worker source:", pdfjs.GlobalWorkerOptions.workerSrc);
    
    // Attempt to reconfigure if needed
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      console.warn("PDF.js worker not configured. Attempting to configure...");
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
