
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, 
  RotateCw, Bookmark, BookmarkPlus, Pencil, Download, 
  Share2, Heart, HeartOff, Search, Maximize, Minimize, 
  List, Book, Sidebar, Moon, Sun, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LivroJuridico, Marcador, Anotacao } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso, useBibliotecaAnotacoes } from '@/hooks/use-biblioteca-juridica';
import { useAuth } from '@/hooks/use-auth';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface EnhancedPDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
  bookTitle: string;
  book: LivroJuridico | null;
}

export function EnhancedPDFViewer({ pdfUrl, onClose, bookTitle, book }: EnhancedPDFViewerProps) {
  // Core PDF state
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  
  // UI state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('outline');
  
  // Annotation state
  const [showAnotacaoDialog, setShowAnotacaoDialog] = useState(false);
  const [anotacaoText, setAnotacaoText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#E0F7FA');
  
  // Bookmark state
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { user } = useAuth();
  const { updateProgress, toggleFavorite, isFavorite, getReadingProgress } = useBibliotecaProgresso();
  const { 
    marcadores, anotacoes, 
    addMarcador, addAnotacao, 
    getMarcadores, getAnotacoes 
  } = useBibliotecaAnotacoes();
  
  // Get reading progress and favorites status
  const currentProgress = book ? getReadingProgress(book.id) : null;
  const isBookFavorited = book ? isFavorite(book.id) : false;
  const bookmarksList = book ? getMarcadores(book.id) : [];
  const anotacoesList = book ? getAnotacoes(book.id) : [];
  
  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('pdf-dark-mode');
    } else {
      document.body.classList.remove('pdf-dark-mode');
    }
    return () => {
      document.body.classList.remove('pdf-dark-mode');
    };
  }, [isDarkMode]);
  
  // Handle body class
  useEffect(() => {
    document.body.classList.add('pdf-viewer-open');
    return () => {
      document.body.classList.remove('pdf-viewer-open');
    };
  }, []);
  
  // Update reading progress when page changes
  useEffect(() => {
    if (book && pageNumber > 0) {
      updateProgress(book.id, pageNumber);
    }
  }, [pageNumber, book, updateProgress]);
  
  // Auto-hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showSidebar && !showSearchPanel && !showAnotacaoDialog && !showBookmarkDialog) {
        setShowControls(false);
      }
    }, 3000);
  }, [showSidebar, showSearchPanel, showAnotacaoDialog, showBookmarkDialog]);
  
  useEffect(() => {
    resetControlsTimeout();
    
    // Add event listeners for mouse movement and touches
    const handleActivity = () => resetControlsTimeout();
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('touchstart', handleActivity);
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
    };
  }, [resetControlsTimeout]);
  
  // PDF document handlers
  function onDocumentLoadSuccess({ numPages: totalPages }) {
    setNumPages(totalPages);
    setIsLoading(false);
    
    // If there's saved progress, go to that page
    if (currentProgress && currentProgress.pagina_atual > 1) {
      setPageNumber(currentProgress.pagina_atual);
    }
  }
  
  function onDocumentLoadError(error: any) {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    setIsError(true);
    toast("Erro ao carregar PDF. Tente novamente mais tarde.");
  }
  
  // Page navigation
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
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= (numPages || 1)) {
      setPageNumber(page);
    }
  };
  
  // Zoom functions
  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3.0));
  }
  
  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  }
  
  function resetZoom() {
    setScale(1.0);
  }
  
  // Rotation function
  function rotate() {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  }
  
  // Fullscreen toggle
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any)?.mozRequestFullScreen) {
        (containerRef.current as any).mozRequestFullScreen();
      } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any)?.msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };
  
  // Fullscreen change event listener
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('msfullscreenchange', handleFullScreenChange);
    };
  }, []);
  
  // Handle bookmark creation
  const handleAddBookmark = async () => {
    if (!book) return;
    
    if (!user) {
      toast("Você precisa estar logado para adicionar marcadores");
      return;
    }
    
    await addMarcador(book.id, pageNumber, bookmarkTitle || `Marcador na página ${pageNumber}`, '#FFEB3B');
    setShowBookmarkDialog(false);
    setBookmarkTitle('');
  };
  
  // Handle annotation creation
  const handleAddAnnotation = async () => {
    if (!book || !anotacaoText.trim()) return;
    
    if (!user) {
      toast("Você precisa estar logado para adicionar anotações");
      return;
    }
    
    await addAnotacao(book.id, pageNumber, anotacaoText, undefined, selectedColor);
    setShowAnotacaoDialog(false);
    setAnotacaoText('');
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!book) return;
    await toggleFavorite(book.id);
  };
  
  // Handle download
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${bookTitle || 'documento'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast("Download iniciado");
    }
  };
  
  // Handle share
  const handleShare = () => {
    if (navigator.share && pdfUrl) {
      navigator.share({
        title: bookTitle,
        text: `Leia "${bookTitle}" na biblioteca jurídica`,
        url: window.location.href,
      })
      .then(() => toast("Compartilhado com sucesso"))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast("Link copiado para a área de transferência"))
        .catch(() => toast("Não foi possível compartilhar. Tente copiar o URL manualmente."));
    }
  };

  // Copy text handler
  const handleCopyText = () => {
    // In a real app, this would use PDF.js text layer or a selection API
    toast("Função de cópia de texto em desenvolvimento");
  };
  
  // Error state
  if (isError) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-destructive/10 p-6 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4">Erro ao carregar o livro</h2>
          <p className="text-muted-foreground mb-6">
            Houve um problema ao carregar o arquivo PDF.
            Por favor, tente novamente mais tarde.
          </p>
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "fixed inset-0 bg-background z-50 transition-colors duration-300",
      isDarkMode ? "bg-gray-900" : "bg-background"
    )}>
      <div className="pdf-container flex flex-col h-full" ref={containerRef}>
        {/* Header with title and controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "px-4 py-3 border-b backdrop-blur-md sticky top-0 z-40",
                isDarkMode ? "bg-gray-900/80 border-gray-700" : "bg-secondary/80"
              )}
            >
              <div className="container max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className={cn(showSidebar && "text-primary")}
                  >
                    <Sidebar className="h-5 w-5" />
                  </Button>
                  
                  <div>
                    <h2 className="text-lg font-semibold truncate max-w-[200px] sm:max-w-md">
                      {bookTitle}
                    </h2>
                    {book && (
                      <p className="text-xs text-muted-foreground">
                        {book.autor || "Autor desconhecido"} • {book.categoria || "Categoria não especificada"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowSearchPanel(!showSearchPanel)}
                    className={cn(showSearchPanel && "text-primary")}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleToggleFavorite}
                    className={cn(isBookFavorited && "text-red-500")}
                  >
                    {isBookFavorited ? <Heart className="h-4 w-4 fill-red-500" /> : <Heart className="h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={cn(isDarkMode && "text-yellow-400")}
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  
                  <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar visualizador">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar panel */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div 
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "w-[280px] border-r h-full z-30 flex flex-col",
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-secondary/20"
                )}
              >
                <Tabs defaultValue="outline" value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                  <TabsList className="mx-2 mt-2 grid grid-cols-3">
                    <TabsTrigger value="outline">Índice</TabsTrigger>
                    <TabsTrigger value="bookmarks">Marcadores</TabsTrigger>
                    <TabsTrigger value="notes">Anotações</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="outline" className="flex-1 overflow-y-auto p-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Navegação por páginas</p>
                      
                      {numPages && numPages > 0 ? (
                        <div className="space-y-1 mt-4">
                          {Array.from({ length: Math.min(numPages, 100) }, (_, i) => (
                            <Button 
                              key={i} 
                              variant={pageNumber === i + 1 ? "default" : "ghost"}
                              size="sm" 
                              className="w-full justify-start"
                              onClick={() => goToPage(i + 1)}
                            >
                              <span className="mr-2 w-8 inline-block text-right">
                                {i + 1}
                              </span>
                              {i + 1 === 1 && "Capa"}
                              {i + 1 === 2 && "Índice"}
                              {i + 1 === 3 && "Introdução"}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm italic text-muted-foreground mt-4">
                          Carregando estrutura do documento...
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="bookmarks" className="flex-1 overflow-y-auto p-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Seus marcadores</h3>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowBookmarkDialog(true)}
                      >
                        <BookmarkPlus className="h-4 w-4 mr-1" />
                        Novo
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      {bookmarksList.length > 0 ? (
                        <div className="space-y-2">
                          {bookmarksList.map((bookmark) => (
                            <div 
                              key={bookmark.id} 
                              className={cn(
                                "p-3 rounded-md cursor-pointer transition-colors border",
                                pageNumber === bookmark.pagina ? "bg-primary/10" : "hover:bg-muted"
                              )}
                              onClick={() => goToPage(bookmark.pagina)}
                              style={{ borderLeft: `4px solid ${bookmark.cor}` }}
                            >
                              <div className="flex justify-between">
                                <span className="font-medium text-sm">{bookmark.titulo}</span>
                                <span className="text-xs text-muted-foreground">Pág. {bookmark.pagina}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Bookmark className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Nenhum marcador adicionado
                          </p>
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => setShowBookmarkDialog(true)}
                            className="mt-2"
                          >
                            Adicionar marcador
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="notes" className="flex-1 overflow-y-auto p-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Suas anotações</h3>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowAnotacaoDialog(true)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Nova
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      {anotacoesList.length > 0 ? (
                        <div className="space-y-2">
                          {anotacoesList.map((anotacao) => (
                            <div 
                              key={anotacao.id} 
                              className={cn(
                                "p-3 rounded-md cursor-pointer transition-colors",
                                pageNumber === anotacao.pagina ? "bg-primary/10" : "hover:bg-muted"
                              )}
                              onClick={() => goToPage(anotacao.pagina)}
                              style={{ backgroundColor: `${anotacao.cor}30` }}
                            >
                              <div className="flex justify-between mb-1">
                                <span className="font-medium text-xs">Página {anotacao.pagina}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(anotacao.id).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm line-clamp-3">{anotacao.texto}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Pencil className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Nenhuma anotação adicionada
                          </p>
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => setShowAnotacaoDialog(true)}
                            className="mt-2"
                          >
                            Adicionar anotação
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Search panel */}
          <AnimatePresence>
            {showSearchPanel && (
              <motion.div 
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "w-[280px] border-l h-full z-30 flex flex-col absolute right-0 top-[57px] bottom-0",
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-secondary/20"
                )}
              >
                <div className="p-3">
                  <h3 className="font-medium mb-3">Pesquisar no documento</h3>
                  <div className="flex gap-2 mb-4">
                    <Input 
                      placeholder="Digite para pesquisar..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button variant="default" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    Resultados da pesquisa aparecerão aqui
                  </p>
                  
                  <div className="mt-4">
                    <p className="text-sm italic text-muted-foreground">
                      Esta funcionalidade está em desenvolvimento.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* PDF content area */}
          <div 
            ref={pdfContainerRef}
            className={cn(
              "pdf-content flex-1 overflow-auto flex flex-col justify-center transition-colors",
              isDarkMode ? "bg-gray-900" : "bg-secondary/5",
              isDarkMode ? "pdf-content-dark" : ""
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full flex-col">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg text-muted-foreground">Carregando documento... {loadProgress}%</p>
              </div>
            ) : (
              <div className="flex justify-center h-full items-center py-16">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  onProgress={({ loaded, total }) => {
                    if (total) {
                      setLoadProgress(Math.round((loaded / total) * 100));
                    }
                  }}
                  loading={<span>Carregando...</span>}
                  className="pdf-document"
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale} 
                    rotate={rotation}
                    className="pdf-page"
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "pdf-controls sticky bottom-0 z-40 border-t py-2 px-4 backdrop-blur-md",
                isDarkMode ? "bg-gray-900/80 border-gray-700" : "bg-secondary/80"
              )}
            >
              <div className="container max-w-7xl mx-auto">
                {/* Top section with page navigation */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => changePage(-1)} 
                      disabled={pageNumber <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" /> 
                      Anterior
                    </Button>
                    
                    <div className="flex items-center bg-background rounded-md px-2 border">
                      <Input
                        type="number"
                        min={1}
                        max={numPages || 1}
                        value={pageNumber}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 1 && val <= (numPages || 1)) {
                            setPageNumber(val);
                          }
                        }}
                        className="w-16 h-8 border-none text-center"
                      />
                      <span className="mx-1 text-muted-foreground">de</span>
                      <span>{numPages || '?'}</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => changePage(1)} 
                      disabled={!numPages || pageNumber >= numPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  
                  {/* Progress bar for mobile */}
                  <div className="hidden md:block">
                    {numPages && (
                      <div className="flex items-center gap-2 w-64">
                        <span className="text-xs text-muted-foreground">1</span>
                        <Progress 
                          value={(pageNumber / numPages) * 100} 
                          className="h-2"
                        />
                        <span className="text-xs text-muted-foreground">{numPages}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Right side tools */}
                  <div className="hidden md:flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setShowBookmarkDialog(true)}
                      title="Adicionar marcador"
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setShowAnotacaoDialog(true)}
                      title="Adicionar anotação"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleCopyText}
                      title="Copiar texto"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Bottom section with zoom and tools */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ToggleGroup type="single" value="view-mode">
                      <ToggleGroupItem value="paginated" aria-label="Modo paginado" title="Modo paginado">
                        <Book className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="list" aria-label="Modo lista" title="Modo lista">
                        <List className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={zoomOut} title="Diminuir zoom">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-20">
                          {Math.round(scale * 100)}%
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60">
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm">Zoom</h4>
                          <Slider 
                            min={50} 
                            max={300} 
                            step={10} 
                            value={[scale * 100]} 
                            onValueChange={(val) => setScale(val[0] / 100)} 
                          />
                          <div className="flex justify-between">
                            <Button size="sm" variant="outline" onClick={() => setScale(0.5)}>50%</Button>
                            <Button size="sm" variant="outline" onClick={() => setScale(1)}>100%</Button>
                            <Button size="sm" variant="outline" onClick={() => setScale(2)}>200%</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Button variant="outline" size="icon" onClick={zoomIn} title="Aumentar zoom">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="icon" onClick={rotate} title="Rotacionar">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleDownload}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleShare}
                      title="Compartilhar"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={toggleFullScreen}
                      title={isFullScreen ? "Sair da tela cheia" : "Tela cheia"}
                    >
                      {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Add Bookmark Dialog */}
      <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Marcador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título do marcador</label>
              <Input
                placeholder={`Marcador na página ${pageNumber}`}
                value={bookmarkTitle}
                onChange={(e) => setBookmarkTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Página</label>
              <Input
                type="number"
                value={pageNumber}
                readOnly
                disabled
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookmarkDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddBookmark}>
              Salvar Marcador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Annotation Dialog */}
      <Dialog open={showAnotacaoDialog} onOpenChange={setShowAnotacaoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Anotação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Texto da anotação</label>
              <textarea
                className="w-full border rounded-md p-2 h-32 resize-none"
                placeholder="Digite sua anotação aqui..."
                value={anotacaoText}
                onChange={(e) => setAnotacaoText(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor</label>
              <div className="flex gap-2">
                {['#E0F7FA', '#F3E5F5', '#FFF3E0', '#E8F5E9', '#FFF9C4'].map((cor) => (
                  <button
                    key={cor}
                    className={`w-8 h-8 rounded-full border-2 ${selectedColor === cor ? 'border-black dark:border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: cor }}
                    onClick={() => setSelectedColor(cor)}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Página</label>
              <Input
                type="number"
                value={pageNumber}
                readOnly
                disabled
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnotacaoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddAnnotation} disabled={!anotacaoText.trim()}>
              Salvar Anotação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
