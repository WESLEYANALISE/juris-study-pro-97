
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCw, 
  Bookmark, Download, Moon, Sun, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { cn } from '@/lib/utils';
import './BibliotecaPDFViewer.css';

// Set worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface EnhancedPDFViewerProps {
  pdfUrl: string;
  bookTitle: string;
  onClose: () => void;
  book: LivroJuridico;
}

export function EnhancedPDFViewer({ 
  pdfUrl, 
  bookTitle, 
  onClose, 
  book 
}: EnhancedPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const { saveReadingProgress, getReadingProgress } = useBibliotecaProgresso();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Format the PDF URL
  const formattedPdfUrl = pdfUrl.startsWith('http') 
    ? pdfUrl 
    : `${import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co"}/storage/v1/object/public/agoravai/${pdfUrl}`;
  
  // Load saved page if available
  useEffect(() => {
    if (book?.id) {
      const savedProgress = getReadingProgress(book.id);
      if (savedProgress && savedProgress.pagina_atual > 1) {
        setPageNumber(savedProgress.pagina_atual);
      }
    }
  }, [book, getReadingProgress]);
  
  // Show/hide controls on mouse movement
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseMove);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);
  
  // Save reading progress when changing pages
  useEffect(() => {
    if (book?.id && pageNumber > 0) {
      saveReadingProgress(book.id, pageNumber);
    }
  }, [pageNumber, book, saveReadingProgress]);
  
  // Set body class for PDF viewer
  useEffect(() => {
    document.body.classList.add('pdf-viewer-open');
    
    return () => {
      document.body.classList.remove('pdf-viewer-open');
    };
  }, []);
  
  // Handle document load success
  function onDocumentLoadSuccess({ numPages: totalPages }: { numPages: number }) {
    setNumPages(totalPages);
    setIsLoading(false);
  }
  
  // Handle document load error
  function onDocumentLoadError(error: any) {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    setIsError(true);
  }
  
  // Navigate to next/previous page
  function changePage(amount: number) {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + amount;
      if (newPageNumber >= 1 && newPageNumber <= (numPages || 1)) {
        return newPageNumber;
      }
      return prevPageNumber;
    });
  }
  
  // Zoom controls
  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3.0));
  }
  
  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  }
  
  // Rotate document
  function rotate() {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  }
  
  // Toggle dark mode
  function toggleDarkMode() {
    setDarkMode(!darkMode);
  }

  return (
    <div 
      className={cn("fixed inset-0 flex flex-col", 
        darkMode ? "bg-black" : "bg-white"
      )}
      ref={containerRef}
    >
      {/* Top controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "flex items-center justify-between p-4 shadow-md z-10",
              darkMode ? "bg-black/90 text-white" : "bg-white text-black"
            )}
          >
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onClose}
                className="text-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-bold truncate max-w-[200px] sm:max-w-md">
                {bookTitle}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={zoomIn}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={zoomOut}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={rotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleDarkMode}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* PDF content */}
      <div className="flex-grow overflow-auto pdf-container">
        <div className="pdf-content">
          {isLoading && (
            <div className="flex items-center justify-center h-full w-full">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <Document
            file={formattedPdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="pdf-document-container"
            loading={
              <div className="flex items-center justify-center h-40 w-full">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            }
          >
            {!isLoading && !isError && (
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                rotate={rotation} 
                className={cn(
                  "pdf-page", 
                  darkMode ? "pdf-page-dark" : "pdf-page-light"
                )}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            )}
          </Document>
          
          {isError && (
            <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
              <X className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-red-700">Erro ao carregar o PDF</h3>
              <p className="text-red-600 mb-4">Não foi possível carregar o documento.</p>
              <Button onClick={onClose} variant="destructive">Voltar</Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom controls */}
      <AnimatePresence>
        {showControls && numPages && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "p-4 shadow-inner z-10",
              darkMode ? "bg-black/90 text-white" : "bg-white text-black"
            )}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-between w-full max-w-md">
                <Button 
                  variant="outline" 
                  onClick={() => changePage(-1)} 
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" /> Anterior
                </Button>
                
                <span className="text-center">
                  Página {pageNumber} de {numPages}
                </span>
                
                <Button 
                  variant="outline" 
                  onClick={() => changePage(1)} 
                  disabled={pageNumber >= numPages}
                >
                  Próxima <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              </div>
              
              <Progress 
                value={(pageNumber / numPages) * 100} 
                className="w-full max-w-md" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
