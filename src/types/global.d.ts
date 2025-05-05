
import { PDFDocumentProxy } from 'pdfjs-dist';

declare global {
  interface Window {
    pdfjsLib: typeof import('react-pdf').pdfjs & {
      GlobalWorkerOptions?: {
        workerSrc?: string;
      }
    }
  }
}
