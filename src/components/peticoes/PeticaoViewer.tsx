
import { ArrowLeft, Download, ZoomIn, ZoomOut, Maximize2, Columns, LayoutGrid, Bookmark, BookmarkPlus, Search, Menu, X, Settings, Plus, Minus, RotateCw, RotateCcw, ArrowRight, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Set up the worker for PDF.js
try {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
} catch (error) {
  console.error("Error initializing PDF.js worker:", error);
}

interface PeticaoViewerProps {
  url: string;
  onBack: () => void;
}

export function PeticaoViewer({ url, onBack }: PeticaoViewerProps) {
  const { toast } = useToast();
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDualPageView, setIsDualPageView] = useState(false);
  const [bookmarks, setBookmarks] = useState<{id: string, page: number, title: string}[]>([]);
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<"fit-width" | "fit-page" | "custom">("fit-width");
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [pageTransitionDirection, setPageTransitionDirection] = useState<"next" | "prev" | "none">("none");
  const [isAnimating, setIsAnimating] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState<Error | null>(null);
  const [pdfLoadRetries, setPdfLoadRetries] = useState(0);
  const [useAlternativeViewer, setUseAlternativeViewer] = useState(false);
  const [isDocx, setIsDocx] = useState(false);

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Detect if the URL is a .docx file
    const isDocxFile = url.toLowerCase().endsWith('.docx') || 
                     url.toLowerCase().includes('doc') || 
                     url.includes('document/d/');
    setIsDocx(isDocxFile);
    
    // For .docx files, immediately use the alternative viewer
    if (isDocxFile) {
      setUseAlternativeViewer(true);
      setLoading(false);
    }
    
    const updateSize = () => {
      if (pdfContainerRef.current) {
        setContainerSize({
          width: pdfContainerRef.current.clientWidth,
          height: pdfContainerRef.current.clientHeight
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, [url]);
  
  useEffect(() => {
    if (viewMode === "custom") return;
    
    const timeout = setTimeout(() => {
      if (containerSize.width > 0 && containerSize.height > 0) {
        if (viewMode === "fit-width") {
          const containerWidth = isDualPageView 
            ? (containerSize.width - 48) / 2
            : containerSize.width - 48;
          
          setScale(containerWidth / 595);
        } else if (viewMode === "fit-page") {
          const containerWidth = isDualPageView 
            ? (containerSize.width - 48) / 2
            : containerSize.width - 48;
          
          const widthScale = containerWidth / 595;
          const heightScale = (containerSize.height - 48) / 842;
          
          setScale(Math.min(widthScale, heightScale));
        }
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [containerSize, viewMode, isDualPageView]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const isMobile = useIsMobile();
  
  const { scale: touchScale } = useTouchGestures({
    onSwipeLeft: () => changePage(1),
    onSwipeRight: () => changePage(-1),
    onZoomChange: (newScale) => setScale(newScale),
  });

  // PDF retry mechanism
  useEffect(() => {
    if (isDocx) return; // Skip for .docx files
    
    if (pdfLoadError && pdfLoadRetries < 3 && !useAlternativeViewer) {
      const retryTimeout = setTimeout(() => {
        setPdfLoadRetries(prev => prev + 1);
        setPdfLoadError(null);
      }, 2000);
      
      return () => clearTimeout(retryTimeout);
    } else if (pdfLoadError && pdfLoadRetries >= 3 && !useAlternativeViewer) {
      setUseAlternativeViewer(true);
      toast({
        title: "Erro ao carregar documento",
        description: "Utilizando visualizador alternativo",
        variant: "destructive",
      });
    }
  }, [pdfLoadError, pdfLoadRetries, toast, useAlternativeViewer, isDocx]);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1);

  // Get Google Docs Viewer URL for both PDF and DOCX
  const getGoogleViewerUrl = () => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  // Get Drive Viewer URL (for Google Drive files)
  const getDriveViewerUrl = () => {
    if (url.includes("drive.google.com")) {
      // Extract the file ID from the Drive URL
      const matches = url.match(/[-\w]{25,}/);
      if (matches && matches[0]) {
        return `https://drive.google.com/file/d/${matches[0]}/preview`;
      }
    }
    return getGoogleViewerUrl();
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  };

  const changePage = (delta: number) => {
    if (!numPages || isAnimating || isDocx) return;
    
    let newPage = pageNumber + delta;
    
    if (isDualPageView && delta !== 0) {
      newPage = pageNumber + (delta * 2);
    }
    
    if (newPage >= 1 && newPage <= numPages) {
      setPageTransitionDirection(delta > 0 ? "next" : "prev");
      setIsAnimating(true);
      setTimeout(() => {
        setPageNumber(newPage);
      }, 50);
      
      if (navigator.vibrate && isMobile) {
        navigator.vibrate(30);
      }
    }
  };
  
  const goToPage = (page: number) => {
    if (!numPages || isAnimating || isDocx) return;
    
    if (page >= 1 && page <= numPages) {
      const direction = page > pageNumber ? "next" : "prev";
      setPageTransitionDirection(direction);
      setIsAnimating(true);
      setTimeout(() => {
        setPageNumber(page);
      }, 50);
    }
  };
  
  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      if (pdfContainerRef.current?.requestFullscreen) {
        await pdfContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };
  
  const addBookmark = () => {
    if (isDocx) return; // Skip for .docx files
    
    const title = bookmarkTitle || `Página ${pageNumber}`;
    const newBookmark = { 
      id: Date.now().toString(), 
      page: pageNumber, 
      title 
    };
    
    setBookmarks(prev => [...prev, newBookmark]);
    setBookmarkTitle("");
    
    toast({
      title: "Marcador adicionado",
      description: `Página ${pageNumber} marcada como "${title}"`,
    });
  };
  
  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };
  
  const currentPageBookmarked = bookmarks.some(bookmark => bookmark.page === pageNumber);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
    setSwipeDirection(null);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const xDiff = touchStart.x - e.touches[0].clientX;
    const yDiff = touchStart.y - e.touches[0].clientY;
    
    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 50) {
      if (xDiff > 0) {
        setSwipeDirection("left");
      } else {
        setSwipeDirection("right");
      }
    }
  };
  
  const handleTouchEnd = () => {
    if (swipeDirection === "left") {
      changePage(1);
    } else if (swipeDirection === "right") {
      changePage(-1);
    }
    
    setTouchStart(null);
    setSwipeDirection(null);
  };
  
  const pageAnimationVariants = {
    initial: (direction: string) => ({
      rotateY: direction === "next" ? -90 : 90,
      opacity: 0,
      scale: 0.9,
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        duration: 0.4,
        onComplete: () => setIsAnimating(false)
      }
    },
    exit: (direction: string) => ({
      rotateY: direction === "next" ? 90 : -90,
      opacity: 0,
      scale: 0.9,
      transition: { 
        duration: 0.3 
      }
    })
  };
  
  const dualPageAnimationVariants = {
    initial: (direction: string) => ({
      x: direction === "next" ? 300 : -300,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        duration: 0.5,
        onComplete: () => setIsAnimating(false)
      }
    },
    exit: (direction: string) => ({
      x: direction === "next" ? -300 : 300,
      opacity: 0,
      transition: { 
        duration: 0.3 
      }
    })
  };
  
  const pageSequence = isDualPageView 
    ? (pageNumber % 2 === 1 
        ? [pageNumber, pageNumber + 1] 
        : [pageNumber - 1, pageNumber]
      ).filter(p => p > 0 && (!numPages || p <= numPages))
    : [pageNumber];

  const renderDocumentViewer = () => {
    // For docx files or when alternative viewer is enabled
    if (isDocx || useAlternativeViewer) {
      return (
        <div className="w-full h-full flex flex-col">
          <div className="bg-card/90 backdrop-blur-sm p-4 text-center mb-4 rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isDocx ? (
                <FileText className="h-5 w-5 text-blue-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <h3 className="font-medium">
                {isDocx ? "Documento Word" : "Visualizador alternativo"}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {isDocx 
                ? "Visualizando documento no formato Microsoft Word (.docx)"
                : "Estamos usando um visualizador alternativo para este documento."
              }
            </p>
          </div>
          
          <iframe
            src={isDocx ? getDriveViewerUrl() : getGoogleViewerUrl()}
            className="flex-1 w-full rounded-lg border shadow-lg bg-white"
            title="Visualizador de documento"
            onLoad={() => setLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
          
          <div className="flex justify-between mt-4">
            {!isDocx && (
              <Button
                variant="outline"
                onClick={() => {
                  setPdfLoadRetries(0);
                  setPdfLoadError(null);
                  setUseAlternativeViewer(false);
                }}
                className="gap-2"
              >
                <RotateCw className="h-4 w-4" />
                Tentar visualizador normal
              </Button>
            )}
            
            <Button
              variant="default"
              asChild
              className={`gap-2 ${isDocx ? 'ml-auto' : ''}`}
            >
              <a href={url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Baixar Documento
              </a>
            </Button>
          </div>
        </div>
      );
    }

    // For PDF files with the default viewer
    return (
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => {
          console.error("Error loading PDF:", error);
          setPdfLoadError(error);
          setError(true);
          setLoading(false);
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        }
        className="w-full h-full flex items-center justify-center"
        options={{ 
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
          isEvalSupported: false,
          worker: pdfLoadRetries > 0 ? null : undefined,
          // Improve rendering quality
          maxImageSize: 10000,
          disableRange: false,
          disableStream: false,
          disableAutoFetch: false
        }}
      >
        <Page
          pageNumber={pageNumber}
          scale={isMobile ? touchScale : scale}
          rotate={rotation}
          renderTextLayer={false}
          renderAnnotationLayer={true}
          className="shadow-lg mx-auto"
          width={isMobile ? window.innerWidth : undefined}
          canvasBackground="white"
          renderMode="canvas"
        />
      </Document>
    );
  };

  return (
    <div 
      ref={pdfContainerRef}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      <style>
        {`
          .react-pdf__Page__canvas {
            margin: 0 auto;
          }
        `}
      </style>
      
      {/* Header toolbar - simplified for mobile */}
      <div className="bg-card border-b shadow-sm p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={18} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {!isDocx && !isMobile && (
            <>
              <span className="text-sm text-muted-foreground">
                {pageNumber} / {numPages || '?'}
              </span>
              
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                  <ZoomOut size={18} />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => setScale(1)}>
                  {Math.round(scale * 100)}%
                </Button>
                
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(3, s + 0.1))}>
                  <ZoomIn size={18} />
                </Button>
              </div>
            </>
          )}
          
          <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
            <Maximize2 size={18} />
          </Button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF or DOCX Document with improved quality settings */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-stone-100 dark:bg-stone-900">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-muted-foreground">Carregando documento...</p>
            </div>
          ) : renderDocumentViewer()}
        </div>
      </div>
      
      {/* Mobile bottom navigation - only shown for PDF files */}
      {isMobile && !isDocx && !useAlternativeViewer && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t p-4">
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
              className="flex-1"
            >
              <ArrowLeft className="mr-2" size={20} />
              Anterior
            </Button>
            
            <div className="text-center">
              <span className="text-sm font-medium">
                {pageNumber} / {numPages || '?'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => changePage(1)}
              disabled={pageNumber >= (numPages || 1)}
              className="flex-1"
            >
              Próxima
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile FAB menu - only shown for PDF files */}
      {isMobile && !isDocx && !useAlternativeViewer && (
        <div className="fixed bottom-24 right-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-xl">
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Opções</h3>
                  <span className="text-sm text-muted-foreground">
                    Página {pageNumber} de {numPages || '?'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center py-4"
                    onClick={() => setRotation(r => (r - 90) % 360)}
                  >
                    <RotateCcw size={24} />
                    <span className="mt-2 text-xs">Girar</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex flex-col items-center py-4"
                    onClick={toggleFullScreen}
                  >
                    <Maximize2 size={24} />
                    <span className="mt-2 text-xs">Tela cheia</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex flex-col items-center py-4"
                    asChild
                  >
                    <a href={url} download target="_blank" rel="noopener noreferrer">
                      <Download size={24} />
                      <span className="mt-2 text-xs">Baixar</span>
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}
