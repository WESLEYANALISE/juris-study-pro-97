
import { ArrowLeft, Download, ZoomIn, ZoomOut, Maximize2, Columns, LayoutGrid, Bookmark, BookmarkPlus, Search, Menu, X, Settings, Plus, Minus, RotateCw, RotateCcw, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

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

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
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
  }, []);
  
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

  const isMobile = useRef(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      isMobile.current = mobile;
      
      if (mobile && isDualPageView) {
        setIsDualPageView(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDualPageView]);

  // PDF retry mechanism
  useEffect(() => {
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
  }, [pdfLoadError, pdfLoadRetries, toast, useAlternativeViewer]);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1);

  const getGoogleViewerUrl = () => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  };

  const changePage = (delta: number) => {
    if (!numPages || isAnimating) return;
    
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
      
      if (navigator.vibrate && isMobile.current) {
        navigator.vibrate(30);
      }
    }
  };
  
  const goToPage = (page: number) => {
    if (!numPages || isAnimating) return;
    
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

  const renderAlternativeViewer = () => {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="bg-card/90 backdrop-blur-sm p-4 text-center mb-4 rounded-lg border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-medium">Visualizador alternativo</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Estamos usando um visualizador alternativo para este documento.
          </p>
        </div>
        
        <iframe
          src={getGoogleViewerUrl()}
          className="flex-1 w-full rounded-lg border shadow-lg bg-white"
          title="Visualizador de PDF alternativo"
          onLoad={() => setLoading(false)}
        />
        
        <div className="flex justify-between mt-4">
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
          
          <Button
            variant="default"
            asChild
            className="gap-2"
          >
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Baixar PDF
            </a>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-background"
    >
      <div className="flex h-full flex-col">
        <div className="bg-card border-b shadow-sm p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              {pageNumber} / {numPages || '?'}
            </span>
            
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => changePage(-1)} disabled={pageNumber <= 1 || isAnimating}>
                <ArrowLeft size={18} />
              </Button>
              
              <Input
                type="number"
                min={1}
                max={numPages || 1}
                value={pageNumber}
                onChange={e => setPageNumber(Number(e.target.value))}
                onBlur={e => goToPage(Number(e.target.value))}
                className="w-16 text-center h-8"
                disabled={isAnimating}
              />
              
              <Button variant="ghost" size="icon" onClick={() => changePage(1)} disabled={numPages !== null && pageNumber >= numPages || isAnimating}>
                <ArrowRight size={18} />
              </Button>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetZoom} 
                className="text-xs px-2"
              >
                {Math.round(scale * 100)}%
              </Button>
              
              <Button variant="ghost" size="icon" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              <Button 
                variant={isDualPageView ? "default" : "ghost"}
                size="icon"
                onClick={() => setIsDualPageView(!isDualPageView)}
                disabled={window.innerWidth < 1024}
                title={isDualPageView ? "Página única" : "Páginas duplas"}
              >
                {isDualPageView ? <LayoutGrid size={18} /> : <Columns size={18} />}
              </Button>
              
              <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
                <Maximize2 size={18} />
              </Button>
            </div>
            
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)} className="md:hidden">
              <Menu size={18} />
            </Button>
          </div>
        </div>
        
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Controles</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Navegação</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
                    <ArrowLeft size={16} className="mr-1" /> Anterior
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => changePage(1)} disabled={numPages !== null && pageNumber >= numPages}>
                    Próxima <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    min={1}
                    max={numPages || 1}
                    value={pageNumber}
                    onChange={e => setPageNumber(Number(e.target.value))}
                    onBlur={e => goToPage(Number(e.target.value))}
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-muted-foreground">
                    de {numPages || '?'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Zoom</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={zoomOut}>
                    <ZoomOut size={16} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetZoom}>
                    {Math.round(scale * 100)}%
                  </Button>
                  <Button variant="outline" size="sm" onClick={zoomIn}>
                    <ZoomIn size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Rotação</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRotation(r => (r - 90) % 360)}>
                    <RotateCcw size={16} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRotation(0)}>
                    0°
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRotation(r => (r + 90) % 360)}>
                    <RotateCw size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Opções</h3>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline"
                    onClick={toggleFullScreen}
                    className="w-full justify-start"
                  >
                    <Maximize2 size={16} className="mr-2" />
                    Tela cheia
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setViewMode("fit-width")}
                    className="w-full justify-start"
                  >
                    <LayoutGrid size={16} className="mr-2" />
                    Ajustar à largura
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setViewMode("fit-page")}
                    className="w-full justify-start"
                  >
                    <LayoutGrid size={16} className="mr-2" />
                    Ajustar à página
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div 
          ref={pdfContainerRef}
          className="flex-1 flex overflow-hidden"
        >
          <div 
            className="flex-1 overflow-auto bg-stone-100 dark:bg-stone-900 flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ perspective: "1000px" }}
          >
            {useAlternativeViewer ? (
              renderAlternativeViewer()
            ) : (
              <div className="relative mx-auto p-4">
                <AnimatePresence initial={false} mode="wait" custom={pageTransitionDirection}>
                  <motion.div
                    key={`pdf-${isDualPageView ? 'dual' : 'single'}-${pageNumber}-${scale}-${rotation}`}
                    custom={pageTransitionDirection}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={isDualPageView ? dualPageAnimationVariants : pageAnimationVariants}
                    className={`${isDualPageView ? 'flex gap-2' : ''}`}
                    onAnimationComplete={() => setIsAnimating(false)}
                  >
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
                        <div className="flex items-center justify-center h-full min-h-[300px]">
                          <div className="text-center">
                            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Carregando documento...</p>
                          </div>
                        </div>
                      }
                      error={
                        <div className="flex items-center justify-center h-full min-h-[300px]">
                          <div className="text-center p-8 max-w-md mx-auto">
                            <div className="bg-destructive/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                              <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <p className="font-semibold mb-2">Erro ao carregar documento</p>
                            <p className="text-sm text-muted-foreground mb-6">
                              Ocorreu um problema ao carregar o documento PDF.
                              {pdfLoadRetries > 0 && ` Tentativa ${pdfLoadRetries} de 3.`}
                            </p>
                            <div className="flex flex-col gap-2">
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setPdfLoadError(null);
                                  setPdfLoadRetries(prev => prev + 1);
                                }}
                                disabled={pdfLoadRetries >= 3}
                                className="w-full"
                              >
                                <RotateCw className="mr-2 h-4 w-4" />
                                Tentar novamente
                              </Button>
                              <Button 
                                variant="default"
                                onClick={() => setUseAlternativeViewer(true)}
                                className="w-full"
                              >
                                Usar visualizador alternativo
                              </Button>
                              <Button
                                variant="ghost"
                                asChild
                                className="w-full"
                              >
                                <a href={url} download target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" />
                                  Baixar PDF
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      }
                      options={{
                        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                        cMapPacked: true,
                        worker: pdfLoadRetries > 0 ? null : undefined
                      }}
                      className="transition-transform duration-300"
                    >
                      {isDualPageView ? (
                        <div className="flex gap-2">
                          {pageSequence.map(pageNum => (
                            <div
                              key={`page-${pageNum}`}
                              className="page-container overflow-hidden bg-white shadow-lg rounded-lg"
                            >
                              <Page
                                key={`page-content-${pageNum}`}
                                pageNumber={pageNum}
                                scale={scale}
                                rotate={rotation}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                width={containerSize.width / 2 - 24}
                                className="transition-all duration-300 shadow-lg rounded"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="page-container overflow-hidden bg-white shadow-lg rounded-lg">
                          <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            rotate={rotation}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="transition-all duration-300 shadow-lg rounded"
                          />
                        </div>
                      )}
                    </Document>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
              
            {loading && !error && !useAlternativeViewer && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p className="text-muted-foreground">Carregando documento...</p>
                </div>
              </div>
            )}
            
            {swipeDirection && (
              <motion.div 
                className={`fixed inset-y-0 ${swipeDirection === 'left' ? 'right-0' : 'left-0'} w-16 bg-primary/10 flex items-center justify-center`}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ArrowLeft 
                  className={`h-8 w-8 text-primary ${swipeDirection === 'left' ? 'rotate-180' : ''}`} 
                />
              </motion.div>
            )}
            
            {numPages && pageNumber === 1 && (
              <motion.div 
                className="fixed bottom-36 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm rounded-lg border shadow-lg p-3 pointer-events-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <p className="text-sm text-center">
                  {isMobile.current ? 
                    "Deslize para mudar de página" : 
                    "Use as setas ou números para navegar"}
                </p>
              </motion.div>
            )}
          </div>
          
          <div className="hidden lg:block w-64 bg-card border-l overflow-y-auto">
            <Tabs defaultValue="bookmarks">
              <TabsList className="w-full">
                <TabsTrigger value="bookmarks" className="flex-1">Marcadores</TabsTrigger>
                <TabsTrigger value="outline" className="flex-1">Índice</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bookmarks" className="p-4">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-sm font-medium">Marcadores</h3>
                  
                  {!currentPageBookmarked && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                          <BookmarkPlus className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only">Adicionar</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm">Adicionar marcador</h4>
                          <Input 
                            placeholder="Título do marcador"
                            value={bookmarkTitle}
                            onChange={(e) => setBookmarkTitle(e.target.value)}
                          />
                          <Button onClick={addBookmark} className="w-full">
                            Adicionar
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                
                {bookmarks.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    Nenhum marcador adicionado
                  </p>
                ) : (
                  <div className="space-y-1">
                    <AnimatePresence>
                      {bookmarks.map(bookmark => (
                        <motion.div 
                          key={bookmark.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex items-center justify-between p-2 rounded-md ${bookmark.page === pageNumber ? 'bg-accent' : 'hover:bg-muted'}`}
                        >
                          <button 
                            className="flex items-center gap-2 text-left flex-1"
                            onClick={() => goToPage(bookmark.page)}
                          >
                            <Bookmark className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm truncate">
                              {bookmark.title}
                            </span>
                          </button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                            onClick={() => removeBookmark(bookmark.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="outline" className="p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium">Índice</h3>
                </div>
                
                <p className="text-center text-muted-foreground text-sm py-4">
                  Índice não disponível para este documento
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="md:hidden flex items-center justify-between border-t p-2 bg-card">
          <Button variant="ghost" size="icon" onClick={() => changePage(-1)} disabled={pageNumber <= 1 || isAnimating}>
            <ArrowLeft size={18} />
          </Button>
          
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={numPages || 1}
              value={pageNumber}
              onChange={e => setPageNumber(Number(e.target.value))}
              onBlur={e => goToPage(Number(e.target.value))}
              className="w-16 text-center h-8"
            />
            <span className="text-sm text-muted-foreground">/ {numPages || '?'}</span>
          </div>
          
          <Button variant="ghost" size="icon" onClick={() => changePage(1)} disabled={(numPages !== null && pageNumber >= numPages) || isAnimating}>
            <ArrowRight size={18} />
          </Button>
        </div>
        
        <div className="fixed bottom-16 md:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full border shadow-lg p-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bookmark size={18} className={currentPageBookmarked ? "text-primary fill-primary" : ""} />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top">
              <div className="space-y-4">
                <h4 className="font-medium">
                  {currentPageBookmarked ? "Página marcada" : "Marcar página"}
                </h4>
                {currentPageBookmarked ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      Esta página já está nos seus marcadores
                    </p>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        const bookmark = bookmarks.find(b => b.page === pageNumber);
                        if (bookmark) removeBookmark(bookmark.id);
                      }}
                    >
                      Remover marcador
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Título do marcador"
                      value={bookmarkTitle}
                      onChange={e => setBookmarkTitle(e.target.value)}
                    />
                    <Button onClick={addBookmark} className="w-full">
                      Adicionar marcador
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleFullScreen}>
            <Maximize2 size={18} />
          </Button>
          
          <Button asChild variant="ghost" className="rounded-full" size="icon">
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Download size={18} />
            </a>
          </Button>
        </div>
        
        <div className="hidden md:block mt-4 pb-4 px-4">
          <Button asChild className="w-full md:w-auto gap-2">
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </div>
      
      <style>
        {`
          @keyframes fadeOut {
            0% { opacity: 0.8; }
            100% { opacity: 0; }
          }
          
          .swipe-hint {
            position: absolute;
            width: 40px;
            height: 40px;
            opacity: 0;
            animation: swipeHint 2s ease-in-out infinite;
          }
          
          @keyframes swipeHint {
            0% { transform: translateX(0); opacity: 0; }
            20% { opacity: 0.7; }
            80% { opacity: 0.7; }
            100% { transform: translateX(100px); opacity: 0; }
          }
        `}
      </style>
    </motion.div>
  );
}
