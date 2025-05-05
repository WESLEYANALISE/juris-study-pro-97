
import { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  RotateCw, Bookmark, Download, ArrowLeft,
  Maximize, Minimize
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { toast } from 'sonner';
import './BibliotecaPDFViewer.css';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface BibliotecaPDFViewerProps {
  pdfUrl: string;
  bookTitle: string;
  onClose: () => void;
  book: LivroJuridico;
}

export function BibliotecaPDFViewer({
  pdfUrl,
  bookTitle,
  onClose,
  book
}: BibliotecaPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isFittingWidth, setIsFittingWidth] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfViewerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get the progress tracking hook
  const { saveReadingProgress, getReadingProgress, isFavorite, toggleFavorite } = useBibliotecaProgresso();

  // Format the PDF URL correctly 
  const formattedPdfUrl = pdfUrl.startsWith('http') 
    ? pdfUrl 
    : `https://yovocuutiwwmbempxcyo.supabase.co/storage/v1/object/public/agoravai/${pdfUrl}`;

  // Load saved page number on mount
  useEffect(() => {
    if (book && book.id) {
      const savedProgress = getReadingProgress(book.id);
      if (savedProgress && savedProgress.pagina_atual > 0) {
        setPageNumber(savedProgress.pagina_atual);
      }
    }

    // Prevent body scrolling when PDF viewer is open
    document.body.style.overflow = 'hidden';
    
    // Restore scroll on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [book, getReadingProgress]);

  // Auto-hide controls after inactivity
  useEffect(() => {
    const handleActivity = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('touchstart', handleActivity);
    
    // Initial trigger
    handleActivity();
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  // Save reading progress when page changes
  useEffect(() => {
    if (book && book.id && pageNumber > 0) {
      saveReadingProgress(book.id, pageNumber);
    }
  }, [pageNumber, book, saveReadingProgress]);

  // Handle document loading success
  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
    setIsLoading(false);
    
    // Calculate best scale for fitting the page width
    if (pdfViewerRef.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const pageWidth = pdfViewerRef.current.clientWidth;
      
      if (pageWidth > 0 && containerWidth > 0) {
        // Leave some margin
        const idealScale = (containerWidth - 40) / pageWidth;
        setScale(idealScale);
      }
    }
  };
  
  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };
  
  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          if (pageNumber < (numPages || 1)) {
            setPageNumber(pageNumber + 1);
          }
          break;
        case 'ArrowLeft':
          if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
          }
          break;
        case 'Escape':
          if (!document.fullscreenElement) {
            onClose();
          }
          break;
        case 'f':
          toggleFullScreen();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pageNumber, numPages, onClose]);
  
  // Navigation functions
  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };
  
  const goToNextPage = () => {
    if (pageNumber < (numPages || 1)) {
      setPageNumber(pageNumber + 1);
    }
  };
  
  // Zoom functions
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
    setIsFittingWidth(false);
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
    setIsFittingWidth(false);
  };
  
  // Fit to width
  const fitToWidth = () => {
    if (pdfViewerRef.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const pageWidth = pdfViewerRef.current.clientWidth / scale;
      
      if (pageWidth > 0 && containerWidth > 0) {
        // Leave some margin
        const idealScale = (containerWidth - 40) / pageWidth;
        setScale(idealScale);
        setIsFittingWidth(true);
      }
    }
  };
  
  // Toggle favorite status
  const handleToggleFavorite = () => {
    if (book && book.id) {
      toggleFavorite(book.id);
      toast.success(isFavorite(book.id) 
        ? "Livro adicionado aos favoritos" 
        : "Livro removido dos favoritos"
      );
    }
  };
  
  // Download the PDF
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = formattedPdfUrl;
    link.download = `${bookTitle.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Download iniciado");
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col"
      ref={containerRef}
    >
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 left-4 z-50 flex items-center gap-3"
          >
            <Button 
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
        
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-xl"
          >
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white h-8 w-8 hover:bg-white/20"
              onClick={goToPreviousPage} 
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <span className="text-white text-sm px-2">
              {pageNumber} / {numPages || '--'}
            </span>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white h-8 w-8 hover:bg-white/20"
              onClick={goToNextPage} 
              disabled={pageNumber >= (numPages || 1)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            <div className="w-px h-5 bg-white/30 mx-1" />
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white h-8 w-8 hover:bg-white/20"
              onClick={zoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white h-8 w-8 hover:bg-white/20"
              onClick={zoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-5 bg-white/30 mx-1" />
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white h-8 w-8 hover:bg-white/20"
              onClick={handleToggleFavorite}
            >
              <Bookmark className={`h-4 w-4 ${book && isFavorite(book.id) ? 'fill-primary' : ''}`} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white h-8 w-8 hover:bg-white/20"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white h-8 w-8 hover:bg-white/20"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 overflow-auto flex justify-center items-center p-0 md:p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-opacity-80">Carregando PDF...</p>
          </div>
        ) : (
          <div 
            className="pdf-document-container"
            ref={pdfViewerRef}
            onClick={() => setShowControls(true)}
          >
            <Document
              file={formattedPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error('Error loading PDF:', error);
                toast.error("Erro ao carregar o PDF. Por favor, tente novamente.");
              }}
              className="pdf-document"
              loading={
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-white text-opacity-80">Carregando PDF...</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                className="pdf-page"
                loading={
                  <div className="flex items-center justify-center w-full h-[80vh]">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}
