import React, { useState, useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { 
  ChevronLeft, ChevronRight, X, Sun, Moon, Search, 
  BookmarkPlus, BookmarkMinus, Download, Share2,
  ZoomIn, ZoomOut, RotateCw, Bookmark, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { pdfjs } from '@/lib/pdf-config'; // Import the configured pdfjs
import './EnhancedPDFViewer.css';

// Worker source configured in pdf-config.ts

interface Annotation {
  id: string;
  pageNumber: number;
  content: string;
  position: { x: number; y: number };
  color?: string;
}

interface Bookmark {
  id: string;
  pageNumber: number;
  title: string;
  createdAt: Date;
}

interface EnhancedPDFViewerProps {
  pdfUrl: string;
  bookTitle: string;
  onClose: () => void;
  book: LivroJuridico;
}

export const EnhancedPDFViewer: React.FC<EnhancedPDFViewerProps> = ({
  pdfUrl,
  bookTitle,
  onClose,
  book
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState<boolean>(false);
  const [showBookmarksPanel, setShowBookmarksPanel] = useState<boolean>(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [currentCursor, setCurrentCursor] = useState<string>('default');
  const [fullscreenMode, setFullscreenMode] = useState<boolean>(false);

  const documentRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Use our custom hook for saving reading progress
  const { saveReadingProgress, getReadingProgress, toggleFavorite, isFavorite } = useBibliotecaProgresso();

  // Format the PDF URL correctly 
  const formattedPdfUrl = pdfUrl.startsWith('http') 
    ? pdfUrl 
    : `https://yovocuutiwwmbempxcyo.supabase.co/storage/v1/object/public/agoravai/${pdfUrl}`;

  // Load bookmarks and reading progress on initial render
  useEffect(() => {
    if (book.id) {
      // Load the user's saved reading progress
      const progress = getReadingProgress(book.id);
      if (progress && progress.pagina_atual) {
        setPageNumber(progress.pagina_atual);
      }

      // Here we'd load user's bookmarks from storage or API
      // This is a placeholder for the actual implementation
      const savedBookmarks = localStorage.getItem(`bookmarks-${book.id}`);
      if (savedBookmarks) {
        try {
          setBookmarks(JSON.parse(savedBookmarks));
        } catch (e) {
          console.error("Error loading bookmarks:", e);
        }
      }
    }

    // Check user's preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, [book.id, getReadingProgress]);

  // Save page progress when page changes
  useEffect(() => {
    if (book.id && pageNumber > 0) {
      saveReadingProgress(book.id, pageNumber);
    }
  }, [pageNumber, book.id, saveReadingProgress]);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    console.log(`Document loaded successfully. Total pages: ${numPages}`);
  };

  // Handle document load error
  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    toast({
      title: "Erro ao carregar PDF",
      description: `Não foi possível carregar o documento: ${error.message}`,
      variant: "destructive",
    });
    setIsLoading(false);
  };

  // Handle page load success
  const onPageLoadSuccess = () => {
    setPageLoaded(true);
  };

  // Navigate to the next page
  const nextPage = () => {
    if (numPages !== null && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
      setPageLoaded(false);
    }
  };

  // Navigate to the previous page
  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
      setPageLoaded(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Add bookmark for current page
  const addBookmark = () => {
    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      pageNumber: pageNumber,
      title: `${bookTitle} - Página ${pageNumber}`,
      createdAt: new Date()
    };

    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    
    // Save to local storage
    if (book.id) {
      localStorage.setItem(`bookmarks-${book.id}`, JSON.stringify(updatedBookmarks));
    }

    toast({
      title: "Marcador adicionado",
      description: `Página ${pageNumber} marcada com sucesso.`,
    });
  };
  
  // Remove a bookmark
  const removeBookmark = (id: string) => {
    const updatedBookmarks = bookmarks.filter(b => b.id !== id);
    setBookmarks(updatedBookmarks);
    
    // Save to local storage
    if (book.id) {
      localStorage.setItem(`bookmarks-${book.id}`, JSON.stringify(updatedBookmarks));
    }

    toast({
      title: "Marcador removido",
      description: "O marcador foi removido com sucesso.",
    });
  };
  
  // Check if current page is bookmarked
  const isPageBookmarked = bookmarks.some(b => b.pageNumber === pageNumber);
  
  // Toggle bookmark for current page
  const toggleBookmark = () => {
    if (isPageBookmarked) {
      const bookmarkToRemove = bookmarks.find(b => b.pageNumber === pageNumber);
      if (bookmarkToRemove) removeBookmark(bookmarkToRemove.id);
    } else {
      addBookmark();
    }
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = () => {
    if (book.id) {
      toggleFavorite(book.id);
      toast({
        title: isFavorite(book.id) ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: isFavorite(book.id) 
          ? `"${book.titulo}" foi removido dos seus favoritos.` 
          : `"${book.titulo}" foi adicionado aos seus favoritos.`
      });
    }
  };
  
  // Navigate to a specific bookmark
  const goToBookmark = (pageNum: number) => {
    setPageNumber(pageNum);
    setShowBookmarksPanel(false);
  };

  // Handle zoom changes
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(1.0);

  // Handle rotation
  const rotateClockwise = () => setRotation(prev => (prev + 90) % 360);
  
  // Share functionality
  const sharePDF = () => {
    const shareTitle = `${bookTitle} - Biblioteca Jurídica`;
    const shareText = `Estou lendo "${bookTitle}" na Biblioteca Jurídica. Página atual: ${pageNumber}`;
    
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: window.location.href
      }).catch(err => {
        console.error("Error sharing:", err);
        toast({
          title: "Erro ao compartilhar",
          description: "Não foi possível compartilhar este documento.",
          variant: "destructive",
        });
      });
    } else {
      // Fallback - copy link to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link copiado",
          description: "O link foi copiado para a área de transferência."
        });
      });
    }
  };
  
  // Download functionality
  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = formattedPdfUrl;
    link.download = `${bookTitle.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: "O download do PDF começou."
    });
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          nextPage();
          break;
        case 'ArrowLeft':
          prevPage();
          break;
        case '+':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case 'b':
          toggleBookmark();
          break;
        case 'f':
          // Toggle fullscreen if F is pressed
          document.fullscreenElement
            ? document.exitFullscreen()
            : documentRef.current?.requestFullscreen();
          break;
        case 'd':
          toggleDarkMode();
          break;
        case 'Escape':
          if (showAnnotationPanel) setShowAnnotationPanel(false);
          if (showBookmarksPanel) setShowBookmarksPanel(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextPage, prevPage, pageNumber, numPages, showAnnotationPanel, showBookmarksPanel]);
  
  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreenMode(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col"
      ref={documentRef}
    >
      {/* Header with title and controls */}
      <header className="flex items-center justify-between px-4 py-2 bg-card shadow-sm border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-medium line-clamp-1">{bookTitle}</h1>
          {book.id && isFavorite(book.id) && (
            <Badge variant="outline" className="bg-primary/20 text-primary">
              Favorito
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleDarkMode}
                  className="hidden sm:flex"
                >
                  {darkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{darkMode ? 'Modo claro' : 'Modo escuro'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  className="hidden sm:flex"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Buscar no documento</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={isPageBookmarked ? "default" : "ghost"} 
                  size="icon"
                  onClick={toggleBookmark}
                  className="hidden sm:flex"
                >
                  {isPageBookmarked ? (
                    <BookmarkMinus className="h-4 w-4" />
                  ) : (
                    <BookmarkPlus className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPageBookmarked ? 'Remover marcador' : 'Adicionar marcador'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowBookmarksPanel(!showBookmarksPanel)}
                  className="hidden sm:flex"
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver marcadores</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAnnotationPanel(!showAnnotationPanel)}
                  className="hidden sm:flex"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Anotações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={downloadPDF}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={sharePDF}
                  className="hidden sm:flex"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compartilhar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="ghost" size="icon" onClick={onClose} className="sm:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content with pdf document */}
      <div className="flex-1 overflow-hidden flex relative">
        {/* Side panel for bookmarks and annotations */}
        <AnimatePresence>
          {showBookmarksPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full bg-card border-r overflow-hidden"
            >
              <div className="p-4">
                <h2 className="font-semibold mb-2 flex items-center gap-2">
                  <Bookmark className="h-4 w-4" /> Marcadores
                </h2>
                <ScrollArea className="h-[calc(100vh-160px)]">
                  {bookmarks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum marcador adicionado ainda.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {bookmarks
                        .sort((a, b) => a.pageNumber - b.pageNumber)
                        .map(bookmark => (
                          <div
                            key={bookmark.id}
                            className={cn(
                              "p-2 border rounded-md flex justify-between items-center cursor-pointer hover:bg-accent/50",
                              pageNumber === bookmark.pageNumber && "bg-accent"
                            )}
                            onClick={() => goToBookmark(bookmark.pageNumber)}
                          >
                            <div>
                              <p className="text-sm font-medium">Página {bookmark.pageNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(bookmark.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBookmark(bookmark.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </motion.div>
          )}
          
          {showAnnotationPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full bg-card border-r overflow-hidden"
            >
              <div className="p-4">
                <h2 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Anotações
                </h2>
                <p className="text-sm text-muted-foreground">
                  Recurso em desenvolvimento. Em breve você poderá adicionar anotações ao seu documento.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Search panel */}
        <AnimatePresence>
          {isSearchVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-card border rounded-b-lg shadow-lg z-10 w-full max-w-md"
            >
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Buscar no texto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recurso em desenvolvimento. Em breve você poderá buscar termos no documento.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* The PDF Document */}
        <div 
          className={cn(
            "flex-1 overflow-y-auto px-4",
            darkMode && "pdf-content-dark"
          )}
        >
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="h-16 w-16 border-4 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-muted-foreground">Carregando documento...</p>
            </div>
          )}
          
          <Document
            file={formattedPdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-[500px] w-full">
                <div className="h-10 w-10 border-4 border-t-primary rounded-full animate-spin" />
              </div>
            }
            className="pdf-document"
          >
            {!isLoading && (
              <motion.div 
                className="pdf-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: pageLoaded ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Page
                  pageNumber={pageNumber}
                  width={window.innerWidth > 768 ? undefined : window.innerWidth - 40}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  onLoadSuccess={onPageLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center h-[500px] w-full">
                      <div className="h-10 w-10 border-4 border-t-primary rounded-full animate-spin" />
                    </div>
                  }
                  className="mx-auto shadow-lg"
                />
              </motion.div>
            )}
          </Document>
        </div>
      </div>
      
      {/* Bottom controls */}
      <div className="bg-card shadow-[0_-2px_5px_rgba(0,0,0,0.1)] border-t pdf-controls">
        <div className="flex flex-wrap items-center justify-between px-4 py-2 gap-2">
          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{pageNumber}</span>
              <span className="text-sm text-muted-foreground">de</span>
              <span className="text-sm font-medium">{numPages || '--'}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextPage}
              disabled={numPages === null || pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress bar (mobile only) */}
          <div className="w-full sm:hidden px-4">
            <Slider
              value={[pageNumber]}
              min={1}
              max={numPages || 100}
              step={1}
              onValueChange={(value) => setPageNumber(value[0])}
              className={cn(
                "w-full h-1",
                isLoading && "opacity-50 pointer-events-none"
              )}
            />
          </div>
          
          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={zoomOut}
                disabled={scale <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium w-16 text-center">
                {Math.round(scale * 100)}%
              </span>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={zoomIn}
                disabled={scale >= 2.0}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={rotateClockwise}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Mobile controls */}
            <div className="sm:hidden flex gap-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="h-3 w-3 mr-1" /> : <Moon className="h-3 w-3 mr-1" />}
                <span className="text-xs">{darkMode ? 'Claro' : 'Escuro'}</span>
              </Button>
              
              <Button 
                variant={isPageBookmarked ? "default" : "outline"}
                size="sm"
                onClick={toggleBookmark}
              >
                <BookmarkPlus className="h-3 w-3 mr-1" />
                <span className="text-xs">Marcar</span>
              </Button>
            </div>
            
            {/* Favorite button */}
            <Button 
              variant={isFavorite(book.id) ? "default" : "outline"}
              size="sm"
              onClick={handleToggleFavorite}
              className="hidden sm:flex"
            >
              <BookmarkPlus className="h-4 w-4 mr-1" />
              {isFavorite(book.id) ? 'Favoritado' : 'Favoritar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
