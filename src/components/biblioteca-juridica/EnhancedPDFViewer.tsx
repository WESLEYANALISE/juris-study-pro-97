
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, BookmarkPlus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { configurePdfWorker } from '@/lib/pdf-config';
import './BibliotecaPDFViewer.css';

// Ensure PDF.js worker is configured
configurePdfWorker();

interface EnhancedPDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
  bookTitle: string;
  book: LivroJuridico | null;
}

export function EnhancedPDFViewer({
  pdfUrl,
  onClose,
  bookTitle,
  book
}: EnhancedPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  
  // Initialize PDF worker on component mount
  useEffect(() => {
    console.log('EnhancedPDFViewer mounting, configuring PDF worker');
    configurePdfWorker();
  }, []);

  // Process URL to get full path
  const processUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co";
    return `${baseUrl}/storage/v1/object/public/agoravai/${url}`;
  };
  
  function onDocumentLoadSuccess({ numPages: totalPages }: { numPages: number }) {
    console.log('PDF loaded successfully with', totalPages, 'pages');
    setNumPages(totalPages);
    setIsLoading(false);
  }
  
  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setIsError(true);
    setIsLoading(false);
  }
  
  function changePage(offset: number) {
    setPageNumber(prev => Math.max(1, Math.min((numPages || 1), prev + offset)));
  }

  const processedPdfUrl = processUrl(pdfUrl);
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Back button header */}
      <div className="absolute top-0 left-0 z-20 m-4">
        <Button 
          onClick={onClose} 
          variant="outline" 
          size="icon"
          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main PDF content */}
      <div className="flex-1 overflow-auto flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-amber-500 border-r-amber-500 border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">Carregando PDF... {loadProgress}%</p>
              <p className="text-sm text-white/60 mt-2">{bookTitle}</p>
            </div>
          </div>
        ) : (
          <Document
            file={processedPdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            onProgress={({ loaded, total }) => {
              if (total) {
                setLoadProgress(Math.round((loaded / total) * 100));
              }
            }}
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
              cMapPacked: true,
              standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
            }}
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              className="shadow-xl mx-auto"
            />
          </Document>
        )}
      </div>
      
      {/* Navigation controls */}
      <div className="bg-black/80 p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => changePage(-1)} 
          disabled={pageNumber <= 1}
          className="text-white"
        >
          <ChevronLeft className="mr-2" /> Anterior
        </Button>
        
        <div className="text-white">
          Página {pageNumber} de {numPages || '?'}
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => changePage(1)} 
          disabled={pageNumber >= (numPages || 1)}
          className="text-white"
        >
          Próxima <ChevronRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
