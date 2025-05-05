
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ArrowLeft, ChevronLeft, ChevronRight, BookmarkPlus, BookmarkCheck, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import './BibliotecaPDFViewer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface BibliotecaPDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
  bookTitle: string;
  book: LivroJuridico | null;
}

export function BibliotecaPDFViewer({ pdfUrl, onClose, bookTitle, book }: BibliotecaPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [visiblePages, setVisiblePages] = useState<number[]>([1]);
  const [controlsVisible, setControlsVisible] = useState(true);
  
  const { saveReadingProgress, getReadingProgress, isFavorite, toggleFavorite } = useBibliotecaProgresso();
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add body class to prevent scrolling and hide mobile nav
  useEffect(() => {
    document.body.classList.add('pdf-viewer-open');
    
    // Load saved reading progress
    if (book?.id) {
      const savedProgress = getReadingProgress(book.id);
      if (savedProgress?.pagina_atual && savedProgress.pagina_atual > 1) {
        setPageNumber(savedProgress.pagina_atual);
      }
    }
    
    return () => {
      document.body.classList.remove('pdf-viewer-open');
    };
  }, [book, getReadingProgress]);
  
  // Auto-hide controls after period of inactivity
  useEffect(() => {
    const showControls = () => {
      setControlsVisible(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', showControls);
      container.addEventListener('touchstart', showControls);
    }
    
    // Initial show controls
    showControls();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (container) {
        container.removeEventListener('mousemove', showControls);
        container.removeEventListener('touchstart', showControls);
      }
    };
  }, []);
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowRight':
          if (pageNumber < (numPages || 1)) setPageNumber(p => p + 1);
          break;
        case 'ArrowLeft':
          if (pageNumber > 1) setPageNumber(p => p - 1);
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, numPages, onClose]);
  
  // Save reading progress when page changes
  useEffect(() => {
    if (book?.id && pageNumber > 0 && !isLoading && pageNumber <= (numPages || 1)) {
      saveReadingProgress(book.id, pageNumber);
    }
  }, [pageNumber, book, saveReadingProgress, isLoading, numPages]);
  
  // Process URL to get full path
  const processUrl = (url: string): string => {
    if (!url) return '';
    
    if (url.startsWith('http')) {
      return url;
    }
    
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co";
    return `${baseUrl}/storage/v1/object/public/agoravai/${url}`;
  };
  
  // Calculate visible pages for pagination buffer
  useEffect(() => {
    const calculateVisiblePages = () => {
      const buffer = 1; // Number of pages to buffer on each side
      const pages = [];
      
      for (let i = Math.max(1, pageNumber - buffer); i <= Math.min(numPages || 1, pageNumber + buffer); i++) {
        pages.push(i);
      }
      
      setVisiblePages(pages);
    };
    
    calculateVisiblePages();
  }, [pageNumber, numPages]);
  
  // Handle document load success
  function onDocumentLoadSuccess({ numPages: totalPages }: { numPages: number }) {
    setNumPages(totalPages);
    setIsLoading(false);
    setInitialLoad(false);
    
    // If we're on page 1, no need to notify, otherwise show which page we loaded
    if (pageNumber > 1) {
      toast.success(`PDF carregado: página ${pageNumber} de ${totalPages}`);
    }
  }
  
  // Handle document load error
  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setIsError(true);
    setIsLoading(false);
    setErrorMessage(error.message || "Não foi possível carregar o arquivo PDF");
    toast.error("Houve um problema ao carregar o livro. Por favor, tente novamente.");
  }
  
  // Handle page navigation
  function changePage(offset: number) {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setPageNumber(newPage);
    }
  }
  
  // Handle zoom changes
  function zoomIn() {
    setScale(prev => Math.min(prev + 0.2, 3));
  }
  
  function zoomOut() {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }
  
  // Handle rotation
  function rotate() {
    setRotation(prev => (prev + 90) % 360);
  }
  
  // Handle favorite toggle
  function handleToggleFavorite() {
    if (book?.id) {
      toggleFavorite(book.id);
      toast.success(
        isFavorite(book.id) 
          ? "Livro removido dos favoritos" 
          : "Livro adicionado aos favoritos"
      );
    }
  }
  
  // Error display component
  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full bg-card border rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Erro ao carregar PDF</h2>
          <p className="mb-4 text-muted-foreground">{errorMessage}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Tentamos carregar: {processUrl(pdfUrl)}
          </p>
          <Button onClick={onClose} variant="default">
            Voltar
          </Button>
        </div>
      </motion.div>
    );
  }
  
  // Get processed PDF URL
  const processedPdfUrl = processUrl(pdfUrl);
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      ref={containerRef}
    >
      {/* Back button header - always visible */}
      <div className="absolute top-0 left-0 z-20 m-4">
        <Button 
          onClick={onClose} 
          variant="outline" 
          size="icon" 
          className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main PDF content */}
      <div className="flex-1 overflow-auto flex items-center justify-center pdf-content">
        {isLoading && initialLoad ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white/80">Carregando livro... {progress}%</p>
          </div>
        ) : (
          <Document
            file={processedPdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            onProgress={({ loaded, total }) => {
              if (total) {
                setProgress(Math.round((loaded / total) * 100));
              }
            }}
            loading={
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            }
            className="pdf-document max-h-full w-full"
          >
            {/* Only render visible pages to improve performance */}
            {visiblePages.map(pageNum => (
              <Page
                key={`page-${pageNum}`}
                pageNumber={pageNum}
                scale={scale}
                rotate={rotation}
                className={`pdf-page ${pageNum !== pageNumber ? 'hidden' : ''}`}
                loading={
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                }
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        )}
      </div>
      
      {/* Page navigation and controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div 
            className="pdf-controls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-md border-t border-white/10">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => changePage(-1)} 
                  disabled={pageNumber <= 1}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> 
                  Anterior
                </Button>
                
                <span className="text-white/80 text-sm">
                  {pageNumber} / {numPages || '?'}
                </span>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => changePage(1)} 
                  disabled={pageNumber >= (numPages || 0)}
                  className="text-white hover:bg-white/10"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={zoomOut}
                  className="text-white hover:bg-white/10"
                  title="Diminuir zoom"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <span className="text-white/80 text-xs w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={zoomIn}
                  className="text-white hover:bg-white/10"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={rotate}
                  className="text-white hover:bg-white/10"
                  title="Girar página"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                
                {book && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleToggleFavorite}
                    className={cn(
                      "text-white hover:bg-white/10",
                      isFavorite(book.id) ? "text-amber-400" : "text-white"
                    )}
                    title={isFavorite(book.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    {isFavorite(book.id) ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <BookmarkPlus className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Progress bar */}
            {numPages && (
              <div className="w-full bg-gray-900">
                <motion.div 
                  className="h-0.5 bg-primary transition-all duration-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${(pageNumber / numPages) * 100}%` }}
                  transition={{ type: "spring", stiffness: 100 }}
                ></motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
