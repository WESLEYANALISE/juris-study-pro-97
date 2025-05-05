import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, BookmarkPlus, BookmarkCheck, ZoomIn, ZoomOut, RotateCw, Download, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { pdfjs } from '@/lib/pdf-config';
import './BibliotecaPDFViewer.css';

// pdfjs worker is now configured in pdf-config.ts

interface BibliotecaPDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
  bookTitle: string;
  book: LivroJuridico | null;
}

export function BibliotecaPDFViewer({
  pdfUrl,
  onClose,
  bookTitle,
  book
}: BibliotecaPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadProgress, setLoadProgress] = useState(0);
  const [visiblePages, setVisiblePages] = useState<number[]>([1]);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [showOutline, setShowOutline] = useState(false);
  const [outline, setOutline] = useState<any[]>([]);
  const {
    saveReadingProgress,
    getReadingProgress,
    isFavorite,
    toggleFavorite
  } = useBibliotecaProgresso();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add body class to prevent scrolling and hide mobile nav
  useEffect(() => {
    document.body.classList.add('pdf-viewer-open');

    // Load saved reading progress
    if (book?.id) {
      const savedProgress = getReadingProgress(book.id);
      if (savedProgress?.pagina_atual && savedProgress.pagina_atual > 1) {
        setPageNumber(savedProgress.pagina_atual);
        setPageInputValue(savedProgress.pagina_atual.toString());
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
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          if (pageNumber < (numPages || 1)) setPageNumber(p => p + 1);
          break;
        case 'ArrowLeft':
          if (pageNumber > 1) setPageNumber(p => p - 1);
          break;
        case 'Home':
          setPageNumber(1);
          break;
        case 'End':
          setPageNumber(numPages || 1);
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

  // Debounced save reading progress
  const debouncedPageNumber = useDebounce(pageNumber, 1000);
  useEffect(() => {
    if (book?.id && debouncedPageNumber > 0 && !isLoading && debouncedPageNumber <= (numPages || 1)) {
      saveReadingProgress(book.id, debouncedPageNumber);
    }
  }, [debouncedPageNumber, book, saveReadingProgress, isLoading, numPages]);

  // Process URL to get full path
  const processUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co";
    return `${baseUrl}/storage/v1/object/public/agoravai/${url}`;
  };

  // Calculate buffer of pages to render
  useEffect(() => {
    const calculateVisiblePages = () => {
      const pagesToBuffer = 2; // Number of pages to buffer on each side
      const pages = [];
      for (let i = Math.max(1, pageNumber - pagesToBuffer); i <= Math.min(numPages || 1, pageNumber + pagesToBuffer); i++) {
        pages.push(i);
      }
      setVisiblePages(pages);
    };
    calculateVisiblePages();
  }, [pageNumber, numPages]);

  // Scroll to current page
  useEffect(() => {
    const scrollToCurrentPage = () => {
      const currentPageElement = document.getElementById(`page-${pageNumber}`);
      if (currentPageElement && contentRef.current) {
        const containerRect = contentRef.current.getBoundingClientRect();
        const elementRect = currentPageElement.getBoundingClientRect();

        // Calculate scroll position to center the page
        const scrollTop = elementRect.top - containerRect.top - (containerRect.height - elementRect.height) / 2 + contentRef.current.scrollTop;
        contentRef.current.scrollTo({
          top: scrollTop,
          behavior: isInitialLoad ? 'auto' : 'smooth'
        });
      }
    };
    if (!isLoading) {
      scrollToCurrentPage();

      // After initial load, set to false
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [pageNumber, isLoading, isInitialLoad]);

  // Handle document load success
  const onDocumentLoadSuccess = useCallback(({
    numPages: totalPages,
    outline: pdfOutline
  }: any) => {
    setNumPages(totalPages);
    setIsLoading(false);
    if (pdfOutline) {
      setOutline(pdfOutline);
    }

    // If we're on page 1, no need to notify, otherwise show which page we loaded
    if (pageNumber > 1) {
      toast.success(`PDF carregado: página ${pageNumber} de ${totalPages}`);
    }
  }, [pageNumber]);

  // Handle document load error
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error);
    setIsError(true);
    setIsLoading(false);
    setErrorMessage(error.message || "Não foi possível carregar o arquivo PDF");
    toast.error("Houve um problema ao carregar o livro. Por favor, tente novamente.");
  }, []);

  // Handle page navigation
  const changePage = useCallback((offset: number) => {
    setPageNumber(prevPage => {
      const newPage = prevPage + offset;
      if (newPage >= 1 && newPage <= (numPages || 1)) {
        setPageInputValue(newPage.toString());
        return newPage;
      }
      return prevPage;
    });
  }, [numPages]);

  // Handle zoom changes
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 3));
  }, []);
  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  // Handle page input change
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };
  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(pageInputValue);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= (numPages || 1)) {
        setPageNumber(pageNum);
      } else {
        setPageInputValue(pageNumber.toString());
      }
    }
  };
  const handlePageInputBlur = () => {
    const pageNum = parseInt(pageInputValue);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= (numPages || 1)) {
      setPageNumber(pageNum);
    } else {
      setPageInputValue(pageNumber.toString());
    }
  };

  // Handle rotation
  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(() => {
    if (book?.id) {
      toggleFavorite(book.id);
      toast.success(isFavorite(book.id) ? "Livro removido dos favoritos" : "Livro adicionado aos favoritos");
    }
  }, [book, toggleFavorite, isFavorite]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = processUrl(pdfUrl);
      link.download = bookTitle.replace(/\s+/g, '_') + '.pdf';
      link.click();
    }
  }, [pdfUrl, bookTitle]);

  // Calculate progress percentage
  const progressPercentage = numPages ? pageNumber / numPages * 100 : 0;

  // Handle slider change
  const handleSliderChange = useCallback((value: number[]) => {
    const newPage = Math.round(value[0] * (numPages || 1) / 100);
    if (newPage >= 1) {
      setPageNumber(newPage);
      setPageInputValue(newPage.toString());
    }
  }, [numPages]);

  // Error display component
  if (isError) {
    return <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
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
      </motion.div>;
  }

  // Get processed PDF URL
  const processedPdfUrl = processUrl(pdfUrl);
  return <motion.div className="fixed inset-0 bg-black z-50 flex flex-col" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} transition={{
    duration: 0.3
  }} ref={containerRef}>
      {/* Back button header - always visible */}
      <div className="absolute top-0 left-0 z-20 m-4">
        <Button onClick={onClose} variant="outline" size="icon" className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main PDF content */}
      <div className="flex-1 overflow-auto flex items-center justify-center pdf-content" ref={contentRef}>
        {isLoading ? <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 border-4 border-primary/40 border-t-primary rounded-full animate-spin" />
                {loadProgress > 0 && <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-xs font-mono text-white/70">{loadProgress}%</p>
                  </div>}
              </div>
              <div className="text-center">
                <h3 className="text-lg text-white/80 font-medium">{bookTitle}</h3>
                <p className="text-sm text-white/60 mt-1">Carregando PDF...</p>
              </div>
            </div>
          </div> : <Document file={processedPdfUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} onProgress={({
        loaded,
        total
      }) => {
        if (total) {
          const progress = Math.round(loaded / total * 100);
          setLoadProgress(progress);
        }
      }} loading={<div className="flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>} className="pdf-document max-h-full w-full">
            {numPages && visiblePages.map(pageNum => <div id={`page-${pageNum}`} key={`page-${pageNum}`} className={`pdf-page ${pageNum !== pageNumber ? 'opacity-50' : ''}`}>
                <Page pageNumber={pageNum} scale={scale} rotate={rotation} loading={<div className="flex justify-center py-10">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>} renderTextLayer={false} renderAnnotationLayer={false} className={cn("shadow-2xl mx-auto", pageNum === pageNumber ? "shadow-xl" : "shadow-md")} />
                
                {/* Page number indicator */}
                <div className="w-full flex justify-center mt-2 mb-8">
                  <div className="bg-black/70 px-3 py-1 rounded-full">
                    <span className="text-xs text-white/80">
                      Página {pageNum} de {numPages}
                    </span>
                  </div>
                </div>
              </div>)}
          </Document>}
      </div>
      
      {/* Page navigation and controls */}
      <AnimatePresence>
        {controlsVisible && <>
            {/* Top bar with title and controls */}
            <motion.div className="pdf-top-controls" initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} transition={{
          duration: 0.2
        }}>
              <div className="flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm font-medium truncate">{bookTitle}</h3>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className={cn("text-white hover:bg-white/10", book && isFavorite(book.id) ? "text-amber-400" : "text-white")}>
                        {book && isFavorite(book.id) ? <BookmarkCheck className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {book && isFavorite(book.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white hover:bg-white/10">
                        <Download className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Baixar PDF</TooltipContent>
                  </Tooltip>
                  
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="p-4 max-h-[80vh] overflow-auto">
                        <h3 className="text-lg font-bold mb-4">{bookTitle}</h3>
                        {outline && outline.length > 0 ? <div className="space-y-2">
                            {outline.map((item: any, index: number) => <div key={`outline-${index}`} className="cursor-pointer hover:bg-accent p-2 rounded" onClick={() => {
                        if (item.dest) {
                          setPageNumber(item.dest[0].num);
                          setPageInputValue(item.dest[0].num.toString());
                        }
                      }}>
                                <p className="font-medium">{item.title}</p>
                                {item.items && item.items.length > 0 && <div className="pl-4 mt-1 space-y-1">
                                    {item.items.map((subitem: any, subindex: number) => <div key={`subitem-${subindex}`} className="cursor-pointer hover:bg-accent p-1 rounded text-sm" onClick={e => {
                            e.stopPropagation();
                            if (subitem.dest) {
                              setPageNumber(subitem.dest[0].num);
                              setPageInputValue(subitem.dest[0].num.toString());
                            }
                          }}>
                                        {subitem.title}
                                      </div>)}
                                  </div>}
                              </div>)}
                          </div> : <p className="text-muted-foreground">Este documento não possui um índice.</p>}
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              </div>
            </motion.div>
            
            {/* Bottom controls */}
            
          </>}
      </AnimatePresence>
    </motion.div>;
}
