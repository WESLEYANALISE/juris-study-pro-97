
import { GlobalWorkerOptionsType } from 'pdfjs-dist';

declare global {
  interface Window {
    pdfjsLib: typeof import('react-pdf').pdfjs & {
      GlobalWorkerOptions: GlobalWorkerOptionsType;
    };
    __pdfjsWorkerSrc?: string;
  }
}
