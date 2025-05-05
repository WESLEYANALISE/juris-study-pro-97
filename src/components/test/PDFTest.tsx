
import { useEffect } from 'react';
import { pdfjs, configurePdfWorker } from '@/lib/pdf-config';

export function PDFTest() {
  useEffect(() => {
    console.log("PDFTest component mounted - PDF.js status check");
    
    // Verify PDF.js configuration
    const checkPdfJsConfiguration = () => {
      console.log("PDF.js version:", pdfjs?.version || 'not loaded');
      
      // Check if worker is configured
      const workerSrc = pdfjs?.GlobalWorkerOptions?.workerSrc;
      if (workerSrc) {
        console.log("✅ PDF.js worker is configured:", workerSrc);
      } else {
        console.warn("❌ PDF.js worker not configured! Attempting to configure now...");
        const success = configurePdfWorker();
        console.log("Configuration attempt result:", success ? "success" : "failed");
        
        // Retry after a delay if still not configured
        if (!success || !pdfjs?.GlobalWorkerOptions?.workerSrc) {
          console.log("Scheduling another configuration attempt in 200ms...");
          setTimeout(checkPdfJsConfiguration, 200);
        }
      }
    };
    
    // First check
    checkPdfJsConfiguration();
    
    // Additional check after a delay
    const timer = setTimeout(() => {
      console.log("Follow-up PDF.js configuration check:");
      checkPdfJsConfiguration();
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      console.log("PDFTest component unmounted");
    };
  }, []);
  
  return (
    <div className="hidden">
      {/* Test component for PDF.js configuration */}
    </div>
  );
}
