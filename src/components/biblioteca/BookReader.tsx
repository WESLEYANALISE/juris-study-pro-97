import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Bookmark, 
  Heart, 
  Download,
  Share2,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { LivroSupa } from '@/utils/biblioteca-service';
import { saveReadingProgress } from '@/utils/biblioteca-service';
import { formatPDFUrl, testPDFAccess } from '@/utils/pdf-url-utils';
import { toast } from 'sonner';
import './BookReader.css';

// Set worker source for PDF.js - using minified version for consistency
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface BookReaderProps {
  book: LivroSupa;
  onClose: () => void;
}

export function BookReader({ book, onClose }: BookReaderProps) {
  // PDF state
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isValidatingUrl, setIsValidatingUrl] = useState<boolean>(true);
  
  // UI state
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Process the URL when component mounts
  useEffect(() => {
    if (!book.pdf_url) {
      setError('URL do PDF não fornecida');
      setIsLoading(false);
      setIsValidatingUrl(false);
      return;
    }

    // Format the URL using our utility
    const formattedUrl = formatPDFUrl(book.pdf_url);
    console.log("Processing PDF URL:", book.pdf_url);
    console.log("Final PDF URL to use:", formattedUrl);
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
  }, [book.pdf_url]);
  
  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      
      // Adjust scale for smaller screens
      if (window.innerWidth < 640) {
        setScale(viewportWidth < 640 ? 0.8 : 1.0);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [numPages]);
  
  // Save reading progress when page changes
  useEffect(() => {
    if (book && pageNumber > 0 && numPages) {
      saveReadingProgress(book.id, pageNumber);
    }
  }, [pageNumber, book, numPages]);
  
  // Handle document load success
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    console.log("PDF loaded successfully. Total pages:", numPages);
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    toast.success(`PDF carregado: ${numPages} páginas`);
  }
  
  // Handle document load error with more detailed logging
  function onDocumentLoadError(error: Error): void {
    console.error('Error loading PDF:', error);
    console.error('Attempted PDF URL:', pdfUrl);
    setError(`Erro ao carregar PDF: ${error.message}`);
    setIsLoading(false);
    toast.error('Não foi possível carregar o PDF. Verifique se o arquivo existe no servidor.');
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
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };
  
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };
  
  // Rotate function
  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  
  // Toggle favorite
  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);
    saveReadingProgress(book.id, pageNumber, !isFavorite);
    toast.success(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
  };
  
  // Handle download
  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
      toast.success('Download iniciado');
    }
  };
  
  // Auto-hide/show controls
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
    
    const element = containerRef.current;
    if (element) {
      element.addEventListener('mousemove', handleActivity);
      element.addEventListener('touchstart', handleActivity);
    }
    
    // Set initial visibility
    handleActivity();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (element) {
        element.removeEventListener('mousemove', handleActivity);
        element.removeEventListener('touchstart', handleActivity);
      }
    };
  }, []);
  
  // Set up touch gestures for mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      
      // Detect horizontal swipe (with a threshold)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe left, go to next page
          goToNextPage();
        } else {
          // Swipe right, go to previous page
          goToPreviousPage();
        }
      }
    };
    
    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [numPages]);
  
  // Add body class to prevent scrolling when reader is open
  useEffect(() => {
    document.body.classList.add('pdf-reader-open');
    
    return () => {
      document.body.classList.remove('pdf-reader-open');
    };
  }, []);
  
  // Show validating spinner
  if (isValidatingUrl) {
    return (
      <div className="fixed inset-0 bg-background/95 z-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg">Verificando disponibilidade do PDF...</p>
        </div>
      </div>
    );
  }
  
  // Error view
  if (error) {
    return (
      <div className="fixed inset-0 bg-background/95 z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 text-destructive rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Erro ao carregar PDF</h2>
          <p className="mb-4">{error}</p>
          <div className="text-xs mb-4 bg-black/10 p-2 rounded overflow-auto max-h-32">
            <code className="break-all whitespace-pre-wrap">{pdfUrl}</code>
          </div>
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-gray-900' : 'bg-background/95'} backdrop-blur-sm flex flex-col`}
    >
      {/* Header controls */}
      <div 
        className={`${showControls ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 bg-card shadow-lg p-4 border-b flex justify-between items-center sticky top-0 z-10`}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-medium max-w-lg truncate hidden sm:block">{book.pdf_name}</h2>
          <h2 className="text-xl font-medium max-w-[200px] truncate sm:hidden">{book.pdf_name}</h2>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleDarkMode}
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleFavorite}
            title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* PDF Viewer Content */}
      <div className="flex-grow overflow-auto relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg mb-2">Carregando livro... {loadProgress}%</p>
            <Progress value={loadProgress} className="w-64 mb-4" />
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              Se o livro não carregar, verifique se o PDF está disponível no servidor.
            </p>
          </div>
        ) : (
          <div className="pdf-content py-4 flex justify-center items-start min-h-full">
            <Document 
              file={pdfUrl} 
              onLoadSuccess={onDocumentLoadSuccess} 
              onLoadError={onDocumentLoadError} 
              onLoadProgress={({ loaded, total }: { loaded: number; total: number }) => {
                if (total) {
                  setLoadProgress(Math.round((loaded / total) * 100));
                }
              }}
              className={isDarkMode ? 'pdf-dark-mode' : ''}
              loading={
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>Carregando PDF...</p>
                </div>
              }
              error={
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <p className="text-red-500">Erro ao carregar o PDF.</p>
                </div>
              }
              options={{
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
                cMapPacked: true,
                standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/',
              }}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                rotate={rotation} 
                className={`pdf-page ${isDarkMode ? 'pdf-page-dark' : ''}`}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={viewportWidth < 640 ? viewportWidth - 32 : undefined}
              />
            </Document>
          </div>
        )}
      </div>
      
      {/* Bottom controls */}
      <div 
        className={`${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-300 sticky bottom-0 border-t bg-card p-3 flex flex-col gap-2 shadow-lg`}
      >
        {/* Page controls */}
        <div className="flex items-center justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousPage} 
            disabled={pageNumber <= 1}
            className="w-24"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          
          <div className="flex-1 flex items-center justify-center gap-2">
            <div className="relative flex items-center bg-muted/50 rounded px-2 py-1">
              <Input 
                type="number"
                min={1}
                max={numPages || 1}
                value={pageNumber}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1 && value <= (numPages || 1)) {
                    setPageNumber(value);
                  }
                }}
                className="w-12 h-8 text-center p-0 border-none bg-transparent text-sm"
              />
              <span className="text-sm ml-1">/ {numPages || '-'}</span>
            </div>
            
            <Progress 
              value={numPages ? (pageNumber / numPages) * 100 : 0} 
              className="w-24 h-2 hidden sm:block" 
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextPage} 
            disabled={!numPages || pageNumber >= numPages}
            className="w-24"
          >
            Próximo <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        {/* Zoom and tools */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={zoomOut} className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs bg-muted/50 px-2 py-1 rounded">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="outline" size="icon" onClick={zoomIn} className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="icon" onClick={rotate} className="h-8 w-8">
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center text-xs text-muted-foreground mt-1">
          Deslize para esquerda ou direita para mudar de página
        </div>
      </div>
    </div>
  );
}
