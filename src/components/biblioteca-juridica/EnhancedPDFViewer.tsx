
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCw, Bookmark, Heart, Download, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { toast } from 'sonner';
import './EnhancedPDFViewer.css';

// Set PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface EnhancedPDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
  bookTitle: string;
  book: LivroJuridico | null;
}

export function EnhancedPDFViewer({ pdfUrl, onClose, bookTitle, book }: EnhancedPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  
  const { saveReadingProgress, isFavorite, toggleFavorite } = useBibliotecaProgresso();
  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<any>(null);
  
  // Handle viewport resize for responsive display
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      
      // Adjust scale for small screens
      if (window.innerWidth < 640) {
        setScale(0.8);
      } else {
        setScale(1.0);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEffect(() => {
    document.body.classList.add('pdf-viewer-open');
    document.body.style.backgroundColor = '#121212'; // Dark background
    
    // Force reload PDF when URL changes
    setIsLoaded(false);
    setIsLoading(true);
    setPageNumber(1);
    
    console.log("Loading PDF from URL:", pdfUrl);
    
    return () => {
      document.body.classList.remove('pdf-viewer-open');
      document.body.style.backgroundColor = ''; // Reset background
    };
  }, [pdfUrl]);
  
  useEffect(() => {
    if (book && pageNumber > 0 && isLoaded) {
      saveReadingProgress(book.id, pageNumber);
    }
  }, [pageNumber, book, saveReadingProgress, isLoaded]);

  // Process the URL to ensure it's a full URL
  const processUrl = (url: string): string => {
    if (!url) return '';
    
    // Already a full URL
    if (url.startsWith('http')) {
      console.log("URL is already complete:", url);
      return url;
    }
    
    // Add the Supabase storage URL prefix if it's just a path
    const storageBaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co";
    const fullUrl = `${storageBaseUrl}/storage/v1/object/public/agoravai/${url}`;
    console.log("Converted URL:", fullUrl);
    return fullUrl;
  };

  function onDocumentLoadSuccess({ numPages: totalPages }) {
    console.log("PDF loaded successfully. Total pages:", totalPages);
    setNumPages(totalPages);
    setIsLoading(false);
    setIsLoaded(true);
    toast.success(`PDF carregado: ${totalPages} páginas`);
    
    // Try to get the document object for better page navigation
    if (documentRef.current) {
      console.log("Document ref available:", documentRef.current);
    }
  }
  
  function onDocumentLoadError(error: any) {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    setIsError(true);
    setErrorMessage(`Erro ao carregar PDF: ${error.message || "Verifique se o arquivo existe"}`);
    toast.error("Houve um problema ao carregar o livro. Por favor, tente novamente.");
  }
  
  function changePage(amount: number) {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + amount;
      if (newPageNumber >= 1 && newPageNumber <= (numPages || 1)) {
        return newPageNumber;
      } else {
        return prevPageNumber;
      }
    });
  }
  
  // Manual page input handler
  function handlePageInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= (numPages || 1)) {
      setPageNumber(value);
    }
  }
  
  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3.0));
  }
  
  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  }
  
  function rotate() {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  }
  
  // Handle favorites toggle
  const handleToggleFavorite = () => {
    if (book) {
      toggleFavorite(book.id);
      toast.success(isFavorite(book.id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
    }
  };
  
  // Handle download
  const handleDownload = () => {
    if (pdfUrl) {
      const processedUrl = processUrl(pdfUrl);
      window.open(processedUrl, '_blank');
      toast.success('Download iniciado');
    }
  };
  
  // Add keyboard event listeners for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        changePage(1);
      } else if (e.key === 'ArrowLeft') {
        changePage(-1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [numPages, onClose]);
  
  // Handle touch events for mobile navigation
  useEffect(() => {
    let touchStartX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left, go to next page
          changePage(1);
        } else {
          // Swipe right, go to previous page
          changePage(-1);
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
  }, []);
  
  if (isError) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 text-destructive rounded-lg p-6 max-w-md text-center shadow-lg">
          <AlertCircle className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Erro ao carregar o livro</h2>
          <p className="text-muted-foreground mb-6">
            {errorMessage || "Houve um problema ao carregar o arquivo PDF. Por favor, tente novamente mais tarde."}
          </p>
          <div className="text-xs mb-4 bg-black/10 p-2 rounded overflow-auto max-h-32">
            <code className="break-all whitespace-pre-wrap">{processUrl(pdfUrl)}</code>
          </div>
          <Button onClick={onClose} className="mt-4">
            Fechar
          </Button>
        </div>
      </div>
    );
  }
  
  // Use the processed URL for the PDF
  const processedPdfUrl = processUrl(pdfUrl);
  
  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Large close button in the top-left corner */}
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute top-4 left-4 z-50 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 border-white/20 text-white"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>
      
      <div className="enhanced-pdf-container flex flex-col h-full" ref={containerRef}>
        {/* Header with title */}
        <div className="px-4 py-3 border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container max-w-5xl mx-auto flex items-center justify-between">
            <h2 className="text-lg font-semibold truncate text-white">{bookTitle}</h2>
            
            {/* Favorite and download buttons */}
            <div className="flex items-center gap-2">
              {book && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleToggleFavorite}
                  className="text-white hover:bg-gray-800"
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite(book.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite(book.id) ? 'Favorito' : 'Favoritar'}
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDownload}
                className="text-white hover:bg-gray-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-white">Carregando livro... {progress}%</p>
            <p className="text-xs text-gray-400 mt-2 max-w-md text-center">
              Se o livro não carregar, verifique se o PDF está disponível no servidor.
            </p>
          </div>
        )}
        
        {/* PDF Viewer Content */}
        <div className="enhanced-pdf-content container max-w-4xl mx-auto flex-grow overflow-auto">
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
              <div className="flex flex-col items-center justify-center py-20">
                <Skeleton className="h-[500px] w-full max-w-lg bg-gray-800" />
                <p className="mt-4 text-gray-400">Carregando PDF...</p>
              </div>
            }
            error={
              <div className="text-center text-red-500 py-20">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Erro ao carregar PDF</p>
              </div>
            }
            inputRef={documentRef}
            className="enhanced-pdf-document"
          >
            {isLoaded && (
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                rotate={rotation} 
                width={viewportWidth < 640 ? viewportWidth - 32 : undefined}
                height={viewportWidth < 640 ? undefined : undefined}
                renderMode="canvas"
                className="enhanced-pdf-page mx-auto"
                error={
                  <div className="text-center text-red-500 p-4">
                    <p>Erro ao renderizar página {pageNumber}</p>
                  </div>
                }
              />
            )}
          </Document>
        </div>
        
        {/* Navigation controls */}
        <div className="enhanced-pdf-controls bg-gray-900 border-t border-gray-800">
          <div className="enhanced-pdf-controls-row">
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => changePage(-1)} 
                disabled={pageNumber <= 1}
                className="h-8 px-2 bg-gray-800 text-white hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              
              <div className="flex items-center gap-1 bg-gray-800 backdrop-blur px-2 py-1 rounded text-white">
                <input 
                  type="number" 
                  min={1} 
                  max={numPages || 1} 
                  value={pageNumber} 
                  onChange={handlePageInput}
                  className="w-12 h-6 bg-transparent text-center p-0 border-none text-sm"
                />
                <span className="text-sm text-gray-400">/ {numPages || '-'}</span>
              </div>
              
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => changePage(1)} 
                disabled={pageNumber >= (numPages || 0)}
                className="h-8 px-2 bg-gray-800 text-white hover:bg-gray-700"
              >
                Próximo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={zoomOut} className="h-8 w-8 p-0 border-gray-700 text-white">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded text-white">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={zoomIn} className="h-8 w-8 p-0 border-gray-700 text-white">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={rotate} className="h-8 w-8 p-0 border-gray-700 text-white">
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-2">
            Deslize para esquerda ou direita para mudar de página
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedPDFViewer;
