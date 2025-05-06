
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCw, Bookmark, Heart, Download, Share2, AlertCircle, StickyNote, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { usePdfAnnotations } from '@/hooks/use-pdf-annotations';
import { toast } from 'sonner';
import { formatPDFUrl, testPDFAccess } from '@/utils/pdf-url-utils';
import { AnnotationSidebar } from './AnnotationSidebar';
import { cn } from '@/lib/utils';
import './EnhancedPDFViewer.css';

// Set PDF.js worker source - using minified version for consistency
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [processedPdfUrl, setProcessedPdfUrl] = useState('');
  const [isValidatingUrl, setIsValidatingUrl] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);

  const {
    saveReadingProgress,
    isFavorite,
    toggleFavorite
  } = useBibliotecaProgresso();
  
  const bookId = book?.id || '';
  const {
    annotations,
    bookmarks,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    exportAnnotationsToText,
    isPageBookmarked
  } = usePdfAnnotations(bookId);
  
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
  
  // Initialize component state and process PDF URL
  useEffect(() => {
    document.body.classList.add('pdf-viewer-open');
    if (darkMode) {
      document.body.classList.add('dark-pdf-mode');
    } else {
      document.body.classList.remove('dark-pdf-mode');
    }

    // Force reload PDF when URL changes
    setIsLoaded(false);
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");
    setPageNumber(1);
    
    // Process the URL
    const formattedUrl = formatPDFUrl(pdfUrl);
    console.log("PDF URL after formatting:", formattedUrl);
    setProcessedPdfUrl(formattedUrl);
    
    // Validate the URL to make sure it's accessible
    setIsValidatingUrl(true);
    testPDFAccess(formattedUrl).then(isAccessible => {
      if (!isAccessible) {
        console.error("PDF URL is not accessible:", formattedUrl);
        setIsError(true);
        setErrorMessage(`O PDF não está acessível. Por favor, verifique se o arquivo existe no servidor.`);
        setIsLoading(false);
      }
      setIsValidatingUrl(false);
    });
    
    return () => {
      document.body.classList.remove('pdf-viewer-open');
      document.body.classList.remove('dark-pdf-mode');
    };
  }, [pdfUrl, darkMode]);
  
  // Save reading progress when page changes
  useEffect(() => {
    if (book && pageNumber > 0 && isLoaded) {
      saveReadingProgress(book.id, pageNumber);
    }
  }, [pageNumber, book, saveReadingProgress, isLoaded]);

  function onDocumentLoadSuccess({ numPages: totalPages }) {
    console.log("PDF loaded successfully. Total pages:", totalPages);
    setNumPages(totalPages);
    setIsLoading(false);
    setIsLoaded(true);
    setIsError(false);
    toast.success(`PDF carregado: ${totalPages} páginas`);

    // Try to get the document object for better page navigation
    if (documentRef.current) {
      console.log("Document ref available:", documentRef.current);
    }
  }
  
  function onDocumentLoadError(error: any) {
    console.error('Error loading PDF:', error);
    console.error('Attempted PDF URL:', processedPdfUrl);
    setIsLoading(false);
    setIsError(true);
    setErrorMessage(`Erro ao carregar PDF: ${error.message || "Verifique se o arquivo existe"}`);
    toast.error("Houve um problema ao carregar o livro. Por favor, tente novamente.");
  }
  
  function changePage(amount: number) {
    setPageNumber(prevPageNumber => {
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
    setScale(prevScale => Math.min(prevScale + 0.25, 3.0));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
  }

  function rotate() {
    setRotation(prevRotation => (prevRotation + 90) % 360);
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
    if (processedPdfUrl) {
      window.open(processedPdfUrl, '_blank');
      toast.success('Download iniciado');
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle annotations sidebar
  const toggleAnnotations = () => {
    setShowAnnotations(!showAnnotations);
  };

  // Export annotations
  const handleExportAnnotations = () => {
    const content = exportAnnotationsToText();
    if (!content) return;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anotacoes_${bookTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Anotações exportadas com sucesso');
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
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  // Error display
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
            <code className="break-all whitespace-pre-wrap">{processedPdfUrl}</code>
          </div>
          <Button onClick={onClose} className="mt-4">
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  // Show validating spinner
  if (isValidatingUrl) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Verificando disponibilidade do PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("fixed inset-0 z-50", darkMode ? "bg-gray-900" : "bg-gray-100")} ref={containerRef}>
      {/* Top controls - always visible */}
      <div className={cn(
        "px-4 py-2 flex justify-between items-center shadow-md",
        darkMode ? "bg-gray-900 text-white border-b border-gray-800" : "bg-white text-black"
      )}>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className={darkMode ? "text-white" : "text-black"}
          >
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-medium ml-2 max-w-md truncate">{bookTitle}</h2>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className={darkMode ? "text-white" : "text-black"}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size={isPageBookmarked(pageNumber) ? "icon" : "icon"} 
            onClick={() => {
              const bookmark = bookmarks.find(b => b.page === pageNumber);
              if (bookmark) {
                deleteBookmark(bookmark.id || '');
              } else {
                addBookmark({
                  book_id: bookId,
                  page: pageNumber,
                  title: `Página ${pageNumber}`,
                  color: '#4C7BF4'
                });
              }
            }}
            className={cn(
              darkMode ? "text-white" : "text-black", 
              isPageBookmarked(pageNumber) && "text-blue-500"
            )}
          >
            <Bookmark className={cn("h-4 w-4", isPageBookmarked(pageNumber) && "fill-blue-500")} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleAnnotations}
            className={cn(
              darkMode ? "text-white" : "text-black",
              showAnnotations && "bg-primary/20"
            )}
          >
            <StickyNote className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleFavorite}
            className={darkMode ? "text-white" : "text-black"}
          >
            <Heart className={cn(
              "h-4 w-4",
              book && isFavorite(book.id) ? "fill-red-500 text-red-500" : ""
            )} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDownload}
            className={darkMode ? "text-white" : "text-black"}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* PDF content area */}
      <div className={cn(
        "flex-1 overflow-auto h-[calc(100vh-10rem)]",
        darkMode ? "bg-gray-900" : "bg-gray-100"
      )}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={cn("text-lg mb-2", darkMode ? "text-white" : "text-black")}>
              Carregando livro... {progress}%
            </p>
            <Progress value={progress} className="w-64 mb-4" />
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-full py-4">
            <Document
              file={processedPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              onProgress={({loaded, total}) => {
                if (total) {
                  setProgress(Math.round((loaded / total) * 100));
                }
              }}
              inputRef={documentRef}
              className={darkMode ? "pdf-dark-mode" : ""}
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
                className={cn(
                  "pdf-page",
                  darkMode ? "pdf-page-dark" : "pdf-page-light",
                  "shadow-lg"
                )}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        )}
      </div>
      
      {/* Bottom navigation controls */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 py-3 px-4 border-t shadow-lg",
        darkMode ? "bg-gray-900 text-white border-gray-800" : "bg-white text-black"
      )}>
        <div className="container max-w-3xl mx-auto">
          <div className="flex flex-col gap-2">
            {/* Page navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => changePage(-1)} 
                disabled={pageNumber <= 1 || isLoading}
                className={cn(
                  "w-24",
                  darkMode ? "bg-gray-800 hover:bg-gray-700 border-gray-700" : ""
                )}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              
              <div className="flex items-center">
                <span className={cn("text-sm mr-2", darkMode ? "text-white" : "text-black")}>
                  Página {pageNumber} de {numPages || '?'}
                </span>
                <Progress 
                  value={numPages ? (pageNumber / numPages) * 100 : 0} 
                  className="w-24 h-2 hidden sm:block" 
                />
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => changePage(1)} 
                disabled={!numPages || pageNumber >= numPages || isLoading}
                className={cn(
                  "w-24",
                  darkMode ? "bg-gray-800 hover:bg-gray-700 border-gray-700" : ""
                )}
              >
                Próxima <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {/* Tools */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={zoomOut}
                  className={darkMode ? "bg-gray-800 hover:bg-gray-700 border-gray-700" : ""}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className={cn(
                  "px-2 text-xs",
                  darkMode ? "text-white" : "text-black"
                )}>
                  {Math.round(scale * 100)}%
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={zoomIn}
                  className={darkMode ? "bg-gray-800 hover:bg-gray-700 border-gray-700" : ""}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={rotate}
                className={darkMode ? "bg-gray-800 hover:bg-gray-700 border-gray-700" : ""}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Annotations sidebar */}
      {showAnnotations && book && (
        <AnnotationSidebar
          annotations={annotations}
          bookmarks={bookmarks}
          currentPage={pageNumber}
          onAddAnnotation={addAnnotation}
          onUpdateAnnotation={updateAnnotation}
          onDeleteAnnotation={deleteAnnotation}
          onAddBookmark={addBookmark}
          onUpdateBookmark={updateBookmark}
          onDeleteBookmark={deleteBookmark}
          onExport={handleExportAnnotations}
          bookId={book.id}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default EnhancedPDFViewer;
