import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Bookmark,
  PenLine,
  Menu,
  Download,
  Share2,
  AlertCircle
} from 'lucide-react';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPDFUrl, testPDFAccess } from '@/utils/pdf-url-utils';
import './PDFViewer.css';

// Set up the PDF.js worker - using minified version for consistency
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  livro: {
    id: string | number;
    nome: string;
    pdf: string;
    capa_url?: string;
  };
  onClose: () => void;
}

export function PDFViewer({
  livro,
  onClose
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>('');
  const [scale, setScale] = useState<number>(1.0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showMobileTools, setShowMobileTools] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isValidatingUrl, setIsValidatingUrl] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Process and validate the URL
  useEffect(() => {
    if (!livro.pdf) {
      setError('URL do PDF não fornecida');
      setIsLoading(false);
      setIsValidatingUrl(false);
      return;
    }

    // Format the URL
    const formattedUrl = formatPDFUrl(livro.pdf);
    console.log("PDF URL after formatting:", formattedUrl);
    setPdfUrl(formattedUrl);
    
    // Validate if URL is accessible
    setIsValidatingUrl(true);
    testPDFAccess(formattedUrl).then(isAccessible => {
      setIsValidatingUrl(false);
      if (!isAccessible) {
        console.error("PDF URL is not accessible:", formattedUrl);
        setError(`O PDF não está acessível. Por favor, verifique se o arquivo existe no servidor.`);
        setIsLoading(false);
      }
    }).catch(err => {
      setIsValidatingUrl(false);
      setError(`Erro ao verificar acessibilidade do PDF: ${err.message}`);
      setIsLoading(false);
    });
  }, [livro.pdf]);

  // Set up touch gestures for mobile
  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      goToNextPage();
    },
    onSwipeRight: () => {
      goToPreviousPage();
    },
    onZoomChange: (newScale) => {
      setScale(newScale);
    },
    onDoubleTap: () => {
      // Reset zoom on double tap
      setScale(1.0);
    },
    minScale: 0.5,
    maxScale: 3
  });

  // Add class to body to mark PDF viewer as open
  useEffect(() => {
    document.body.classList.add('pdf-viewer-open');
    
    return () => {
      document.body.classList.remove('pdf-viewer-open');
    };
  }, []);

  // Auto-hide controls after inactivity
  useEffect(() => {
    const handleActivity = () => {
      setShowControls(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Init visibility
    handleActivity();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  // Handle document load success
  function onDocumentLoadSuccess({
    numPages
  }: {
    numPages: number;
  }): void {
    console.log("PDF loaded successfully. Total pages:", numPages);
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    
    // Show swipe hint for mobile users
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const hintElement = document.createElement('div');
      hintElement.className = 'swipe-hint';
      hintElement.textContent = 'Deslize para navegar entre as páginas';
      document.body.appendChild(hintElement);
      
      setTimeout(() => {
        if (hintElement.parentElement) {
          hintElement.parentElement.removeChild(hintElement);
        }
      }, 5000);
    }
  }

  function onDocumentLoadError(error: Error): void {
    console.error('Error loading PDF:', error);
    console.error('Attempted PDF URL:', pdfUrl);
    setError(`Erro ao carregar o PDF: ${error.message}. Verifique se o arquivo existe no servidor.`);
    setIsLoading(false);
  }

  // Navigation functions
  const goToPreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };
  
  const goToNextPage = () => {
    if (numPages) {
      setPageNumber(prev => Math.min(prev + 1, numPages));
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };
  
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  // Search function
  const handleSearch = () => {
    // This is a placeholder for PDF search functionality
    console.log('Search for:', searchText);
    alert(`Funcionalidade de busca para "${searchText}" será implementada em breve.`);
  };

  // Toggle mobile tools menu
  const toggleMobileTools = () => {
    setShowMobileTools(prev => !prev);
  };

  // Mock functions for PDF tools
  const handleBookmark = () => {
    toast("Marcador adicionado na página " + pageNumber);
  };
  
  const handleAnnotate = () => {
    toast("Modo de anotação ativado");
  };
  
  const handleDownload = () => {
    toast("Download iniciado");
    window.open(livro.pdf, "_blank");
  };
  
  const handleShare = () => {
    toast("Opções de compartilhamento abertas");
  };
  
  // Simple toast function
  const toast = (message: string) => {
    const toastElement = document.createElement('div');
    toastElement.className = 'pdf-toast';
    toastElement.textContent = message;
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toastElement.classList.remove('show');
      setTimeout(() => {
        if (toastElement.parentElement) {
          toastElement.parentElement.removeChild(toastElement);
        }
      }, 300);
    }, 3000);
  };

  // Show validating spinner
  if (isValidatingUrl) {
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-lg">Verificando disponibilidade do PDF...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col">
      <motion.div 
        className="bg-card shadow-lg p-4 border-b flex justify-between items-center transition-opacity duration-300" 
        style={{ opacity: showControls ? 1 : 0 }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-medium truncate">{livro.nome}</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </motion.div>

      <div ref={containerRef} className="flex-grow overflow-auto p-4 flex justify-center px-0">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div 
              className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar PDF</h3>
              <p className="mb-4">{error}</p>
              <div className="text-xs mb-4 bg-black/10 p-2 rounded overflow-auto max-h-32">
                <code className="break-all whitespace-pre-wrap">{pdfUrl}</code>
              </div>
              <Button className="mt-4" onClick={onClose}>
                Voltar
              </Button>
            </motion.div>
          </div>
        ) : (
          <Document 
            file={pdfUrl} 
            onLoadSuccess={onDocumentLoadSuccess} 
            onLoadError={onDocumentLoadError} 
            loading={
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">Carregando PDF...</p>
              </div>
            } 
            className="pdf-container"
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
              cMapPacked: true,
              standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/',
            }}
          >
            <Page 
              key={`page_${pageNumber}`}
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={true} 
              renderAnnotationLayer={true} 
              className="pdf-page pdf-page-turn"
            />
          </Document>
        )}
      </div>

      {/* Bottom controls that show/hide based on activity */}
      <motion.div 
        className="pdf-mobile-controls"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={pageNumber <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="bg-background/80 backdrop-blur px-2 rounded flex items-center">
          <Input 
            type="number"
            min={1}
            max={numPages || 1}
            value={pageNumber}
            onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
            className="w-12 h-8 text-center p-0 border-none"
          />
          <span className="text-sm mx-1">/ {numPages || '--'}</span>
        </div>
        
        <Button variant="outline" size="sm" onClick={goToNextPage} disabled={!numPages || pageNumber >= numPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="ml-2 flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm bg-background/80 backdrop-blur px-2 rounded">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="ml-2 flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleBookmark}>
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleAnnotate}>
            <PenLine className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
