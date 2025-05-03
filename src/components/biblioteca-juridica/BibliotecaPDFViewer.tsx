
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Bookmark, 
  BookmarkPlus, 
  BookmarkMinus, 
  Download, 
  MessageSquare, 
  Edit,
  MoreVertical,
  PenLine,
  List 
} from 'lucide-react';
import './BibliotecaPDFViewer.css';
import { useIsMobile } from '@/hooks/use-mobile';

// Set worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface BibliotecaPDFViewerProps {
  livro: {
    id: string;
    nome: string;
    pdf: string;
    capa_url?: string;
  };
  onClose: () => void;
}

export function BibliotecaPDFViewer({
  livro,
  onClose
}: BibliotecaPDFViewerProps) {
  // State
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [newAnnotation, setNewAnnotation] = useState<string>('');
  const [isAddingAnnotation, setIsAddingAnnotation] = useState<boolean>(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState<string>('');
  const [isAddingBookmark, setIsAddingBookmark] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSwipeHint, setShowSwipeHint] = useState<boolean>(true);
  const [isFullPage, setIsFullPage] = useState<boolean>(true);
  const [pageTransition, setPageTransition] = useState<'none' | 'left' | 'right'>('none');

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Hooks
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Setup touch gestures with enhanced sensitivity
  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      setPageTransition('left');
      goToNextPage();
    },
    onSwipeRight: () => {
      setPageTransition('right');
      goToPreviousPage();
    },
    onZoomChange: (newScale) => {
      setScale(newScale);
    },
    onDoubleTap: () => {
      // Toggle zoom on double tap
      setScale(scale === 1.0 ? 1.5 : 1.0);
    },
    minScale: 0.5,
    maxScale: 3,
    swipeThreshold: 30 // More sensitive swipe detection
  });

  // Hide the mobile navigation
  useEffect(() => {
    // Add a class to the body to hide the mobile navigation
    document.body.classList.add('pdf-viewer-open');
    
    // Clean up when component unmounts
    return () => {
      document.body.classList.remove('pdf-viewer-open');
    };
  }, []);

  // Show swipe hint on mobile only once
  useEffect(() => {
    if (isMobile && showSwipeHint) {
      // Hide hint after 5 seconds
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, showSwipeHint]);

  // Reset page transition after animation completes
  useEffect(() => {
    if (pageTransition !== 'none') {
      const timer = setTimeout(() => {
        setPageTransition('none');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pageTransition]);

  // Load user's reading progress when component mounts
  useEffect(() => {
    async function loadUserProgress() {
      if (!user) return;
      try {
        // Load reading progress
        const { data: progressData } = await supabase
          .from('biblioteca_leitura_progresso')
          .select('*')
          .eq('user_id', user.id)
          .eq('livro_id', livro.id)
          .single();
          
        if (progressData && progressData.pagina_atual) {
          setPageNumber(progressData.pagina_atual);
        }

        // Load bookmarks
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from('biblioteca_marcadores')
          .select('*')
          .eq('user_id', user.id)
          .eq('livro_id', livro.id)
          .order('pagina', { ascending: true });
          
        if (bookmarksError) {
          console.error('Error loading bookmarks:', bookmarksError);
          return;
        }
        
        if (bookmarksData) {
          setBookmarks(bookmarksData);
        }

        // Load annotations
        const { data: annotationsData, error: annotationsError } = await supabase
          .from('biblioteca_anotacoes')
          .select('*')
          .eq('user_id', user.id)
          .eq('livro_id', livro.id)
          .order('pagina', { ascending: true });
          
        if (annotationsError) {
          console.error('Error loading annotations:', annotationsError);
          return;
        }
        
        if (annotationsData) {
          setAnnotations(annotationsData);
        }
      } catch (err) {
        console.error('Error loading user progress:', err);
      }
    }
    loadUserProgress();
  }, [user, livro.id]);

  // Save reading progress when page changes
  useEffect(() => {
    if (!user || !pageNumber) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      try {
        await supabase.from('biblioteca_leitura_progresso').upsert({
          user_id: user.id,
          livro_id: livro.id,
          pagina_atual: pageNumber,
          ultima_leitura: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error saving reading progress:', err);
      }
    }, 1000); // Debounce saving progress

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pageNumber, user, livro.id]);

  // Document load handlers
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }
  
  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setError('Erro ao carregar o PDF. Por favor, tente novamente mais tarde.');
    setIsLoading(false);
  }

  // Navigation functions with enhanced page transition effects
  const goToPreviousPage = useCallback(() => {
    if (pageNumber > 1) {
      setPageTransition('right');
      setPageNumber(prev => prev - 1);
    }
  }, [pageNumber]);
  
  const goToNextPage = useCallback(() => {
    if (numPages && pageNumber < numPages) {
      setPageTransition('left');
      setPageNumber(prev => prev + 1);
    }
  }, [pageNumber, numPages]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 3));
  }, []);
  
  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }, []);
  
  // Reset zoom
  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  // Search function
  const handleSearch = () => {
    // This is a placeholder for PDF search functionality
    toast({
      title: "Busca em desenvolvimento",
      description: `Funcionalidade de busca para "${searchText}" será implementada em breve.`
    });
  };

  // Bookmark functions
  const toggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para adicionar marcadores."
      });
      return;
    }
    const existingBookmark = bookmarks.find(b => b.pagina === pageNumber);
    if (existingBookmark) {
      // Remove bookmark
      await handleDeleteBookmark(existingBookmark.id);
    } else {
      // Add new bookmark
      setNewBookmarkTitle(`Página ${pageNumber}`);
      setIsAddingBookmark(true);
    }
  };

  // Function to handle bookmark deletion with proper error handling
  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from('biblioteca_marcadores')
        .delete()
        .eq('id', bookmarkId);
      
      if (error) throw error;
      
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
      toast({
        title: "Marcador removido",
        description: "O marcador foi removido com sucesso."
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o marcador.",
        variant: "destructive"
      });
    }
  };
  
  const saveBookmark = async () => {
    try {
      const { data, error } = await supabase
        .from('biblioteca_marcadores')
        .insert({
          user_id: user?.id,
          livro_id: livro.id,
          pagina: pageNumber,
          titulo: newBookmarkTitle || `Página ${pageNumber}`
        })
        .select();
        
      if (error) {
        throw error;
      }
      
      setBookmarks([...bookmarks, data[0]]);
      setIsAddingBookmark(false);
      setNewBookmarkTitle('');
      toast({
        title: "Marcador adicionado",
        description: "O marcador foi adicionado com sucesso."
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o marcador.",
        variant: "destructive"
      });
    }
  };

  // Annotation functions
  const addAnnotation = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para adicionar anotações."
      });
      return;
    }
    setIsAddingAnnotation(true);
  };
  
  const saveAnnotation = async () => {
    try {
      const { data, error } = await supabase
        .from('biblioteca_anotacoes')
        .insert({
          user_id: user?.id,
          livro_id: livro.id,
          pagina: pageNumber,
          texto: newAnnotation,
          posicao: { x: 0, y: 0 } // Default position
        })
        .select();
        
      if (error) {
        throw error;
      }
      
      setAnnotations([...annotations, data[0]]);
      setIsAddingAnnotation(false);
      setNewAnnotation('');
      toast({
        title: "Anotação adicionada",
        description: "A anotação foi adicionada com sucesso."
      });
    } catch (error) {
      console.error('Error adding annotation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a anotação.",
        variant: "destructive"
      });
    }
  };

  // Function to handle annotation deletion with proper error handling
  const handleDeleteAnnotation = async (annotationId: string) => {
    try {
      const { error } = await supabase
        .from('biblioteca_anotacoes')
        .delete()
        .eq('id', annotationId);
      
      if (error) throw error;
      
      setAnnotations(annotations.filter(a => a.id !== annotationId));
      toast({
        title: "Anotação removida",
        description: "A anotação foi removida com sucesso."
      });
    } catch (error) {
      console.error('Error removing annotation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a anotação.",
        variant: "destructive"
      });
    }
  };

  // Favorite toggle
  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para favoritar livros."
      });
      return;
    }
    try {
      // Check if user has a progress record for this book
      const { data: progressData } = await supabase
        .from('biblioteca_leitura_progresso')
        .select('*')
        .eq('user_id', user.id)
        .eq('livro_id', livro.id)
        .single();
        
      if (progressData) {
        // Toggle favorite status
        const { error } = await supabase
          .from('biblioteca_leitura_progresso')
          .update({ favorito: !progressData.favorito })
          .eq('id', progressData.id);
          
        if (error) {
          console.error('Error updating favorite status:', error);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar os favoritos.",
            variant: "destructive"
          });
          return;
        }
        toast({
          title: progressData.favorito ? "Removido dos favoritos" : "Adicionado aos favoritos",
          description: progressData.favorito ? "O livro foi removido dos seus favoritos." : "O livro foi adicionado aos seus favoritos."
        });
      } else {
        // Create new progress record with favorite=true
        const { error } = await supabase
          .from('biblioteca_leitura_progresso')
          .insert({
            user_id: user.id,
            livro_id: livro.id,
            favorito: true,
            pagina_atual: pageNumber
          });
          
        if (error) {
          console.error('Error adding to favorites:', error);
          toast({
            title: "Erro",
            description: "Não foi possível adicionar aos favoritos.",
            variant: "destructive"
          });
          return;
        }
        toast({
          title: "Adicionado aos favoritos",
          description: "O livro foi adicionado aos seus favoritos."
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive"
      });
    }
  };

  // Download function
  const handleDownload = () => {
    if (!livro.pdf) {
      toast({
        title: "Download indisponível",
        description: "O PDF não está disponível para download."
      });
      return;
    }
    window.open(livro.pdf, '_blank');
  };

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    const events = ['mousemove', 'click', 'touchstart', 'keydown'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timeout
    handleActivity();
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimeout(timeout);
    };
  }, []);

  // Toggle fullpage mode
  const toggleFullPage = () => {
    setIsFullPage(!isFullPage);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousPage();
      } else if (e.key === '+') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === '0') {
        resetZoom();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextPage, goToPreviousPage, zoomIn, zoomOut, resetZoom, onClose]);

  // Main render
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex flex-col">
      <div className="bg-card shadow-lg p-4 border-b flex justify-between items-center transition-opacity duration-300" style={{
      opacity: showControls ? 1 : 0
    }}>
        <h2 className="text-xl font-medium truncate max-w-[60%]">{livro.nome}</h2>
        <div className="flex items-center gap-2">
          {isMobile ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => setShowMenu(true)}>
                <MoreVertical className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
              
              <Sheet open={showMenu} onOpenChange={setShowMenu}>
                <SheetContent side="bottom" className="h-auto max-h-[70vh]">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Opções de Leitura</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-3 py-2">
                    <Button variant="ghost" className="justify-start" onClick={toggleBookmark}>
                      {bookmarks.some(b => b.pagina === pageNumber) ? <BookmarkMinus className="mr-2 h-5 w-5" /> : <BookmarkPlus className="mr-2 h-5 w-5" />}
                      {bookmarks.some(b => b.pagina === pageNumber) ? "Remover marcador" : "Adicionar marcador"}
                    </Button>
                    
                    <Button variant="ghost" className="justify-start" onClick={() => setShowBookmarks(true)}>
                      <Bookmark className="mr-2 h-5 w-5" />
                      Ver marcadores
                    </Button>
                    
                    <Button variant="ghost" className="justify-start" onClick={addAnnotation}>
                      <PenLine className="mr-2 h-5 w-5" />
                      Adicionar anotação
                    </Button>
                    
                    <Button variant="ghost" className="justify-start" onClick={() => setShowAnnotations(true)}>
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Ver anotações
                    </Button>
                    
                    <Button variant="ghost" className="justify-start" onClick={handleDownload}>
                      <Download className="mr-2 h-5 w-5" />
                      Download
                    </Button>
                    
                    <Button variant="ghost" className="justify-start" onClick={toggleFavorite}>
                      <Bookmark className="mr-2 h-5 w-5" />
                      Favoritar
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={zoomOut}>
                        <ZoomOut className="h-4 w-4 mr-1" />
                        Diminuir
                      </Button>
                      <Button size="sm" variant="outline" onClick={zoomIn}>
                        <ZoomIn className="h-4 w-4 mr-1" />
                        Aumentar
                      </Button>
                    </div>
                    
                    <Button variant="default" className="w-full" onClick={resetZoom}>
                      Redefinir Zoom ({Math.round(scale * 100)}%)
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={toggleBookmark} title={bookmarks.some(b => b.pagina === pageNumber) ? "Remover marcador" : "Adicionar marcador"}>
                {bookmarks.some(b => b.pagina === pageNumber) ? <BookmarkMinus className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowBookmarks(true)} title="Marcadores">
                <List className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowAnnotations(true)} title="Anotações">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div 
        ref={containerRef} 
        className={`flex-grow overflow-auto p-4 flex justify-center px-0 ${isFullPage ? 'pdf-fullpage' : ''}`}
      >
        {error ? <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-lg">
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar PDF</h3>
              <p>{error}</p>
              <Button className="mt-4" onClick={onClose}>
                Voltar
              </Button>
            </div>
          </div> : <Document file={livro.pdf} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} loading={<div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">Carregando PDF...</p>
              </div>} className="pdf-container">
            <div 
              className={`pdf-page-turn ${pageTransition === 'left' ? 'pdf-page-turn-enter' : pageTransition === 'right' ? 'pdf-page-turn-exit' : ''}`}
              ref={(el) => {
                pageRefs.current[pageNumber] = el;
              }}
            >
              <Page 
                key={pageNumber}
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={false} 
                renderAnnotationLayer={false} 
                className="pdf-page"
                loading={
                  <div className="flex items-center justify-center h-[calc(100vh-150px)] w-full">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }
              />
            </div>
          </Document>}
        
        {/* Page annotations for current page */}
        <div className="absolute top-[20%] right-4 space-y-2 transition-opacity duration-300" style={{
        opacity: showControls ? 1 : 0
      }}>
          {annotations
            .filter(anno => anno.pagina === pageNumber)
            .map(anno => (
              <div 
                key={anno.id} 
                className="bg-yellow-100 p-3 rounded shadow-md border border-yellow-200 max-w-xs"
              >
                <p className="text-sm text-gray-800">{anno.texto}</p>
              </div>
            ))
          }
        </div>
        
        {/* Mobile annotation tools */}
        {isMobile && showControls && (
          <div className="pdf-mobile-tools">
            <Button variant="outline" size="icon" className="rounded-full bg-background/70 backdrop-blur-sm" onClick={addAnnotation}>
              <PenLine className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full bg-background/70 backdrop-blur-sm" onClick={toggleBookmark}>
              {bookmarks.some(b => b.pagina === pageNumber) ? <BookmarkMinus className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
            </Button>
          </div>
        )}
        
        {/* Mobile swipe hint */}
        {isMobile && showSwipeHint && (
          <div className="swipe-hint">
            Deslize para navegar entre páginas
          </div>
        )}
      </div>

      {/* Bottom controls - hidden on mobile if not in showControls state */}
      {(!isMobile || showControls) && (
        <div className="pdf-controls transition-opacity duration-300" style={{
          opacity: showControls ? 1 : 0
        }}>
          <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="bg-background/80 backdrop-blur px-2 rounded flex items-center">
            <Input 
              type="number" 
              min={1} 
              max={numPages || 1} 
              value={pageNumber} 
              onChange={e => setPageNumber(Number(e.target.value))} 
              className="w-12 h-8 text-center p-0 border-none"
            />
            <span className="text-sm mx-1">/ {numPages || '--'}</span>
          </div>
          
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={!numPages || pageNumber >= numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {!isMobile && (
            <>
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
              
              <div className="ml-2">
                <Button variant="outline" size="sm" onClick={addAnnotation} title="Adicionar anotação">
                  <PenLine className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Anotar</span>
                </Button>
              </div>
              
              <div className="ml-2">
                <Button variant="outline" size="sm" onClick={toggleBookmark} title="Adicionar/remover marcador">
                  {bookmarks.some(b => b.pagina === pageNumber) ? <BookmarkMinus className="h-4 w-4 mr-1" /> : <BookmarkPlus className="h-4 w-4 mr-1" />}
                  <span className="hidden sm:inline">Marcar</span>
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buscar no Documento</DialogTitle>
            <DialogDescription>
              Digite o texto que deseja encontrar neste PDF
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input placeholder="Digite o texto para buscar..." value={searchText} onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </div>
            <Button onClick={handleSearch} type="submit">Buscar</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Funcionalidade em desenvolvimento. Em breve você poderá buscar no texto completo do documento.
          </p>
        </DialogContent>
      </Dialog>

      {/* Bookmarks Sidebar */}
      <Sheet open={showBookmarks} onOpenChange={setShowBookmarks}>
        <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[70vh]" : "w-[300px] sm:w-[400px]"}>
          <SheetHeader>
            <SheetTitle>Marcadores</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {bookmarks.length === 0 ? <div className="text-center py-6 text-muted-foreground">
                <BookmarkPlus className="mx-auto h-10 w-10 opacity-30 mb-2" />
                <p>Você não tem marcadores neste livro</p>
                <Button variant="outline" className="mt-4" onClick={() => {
              setIsAddingBookmark(true);
              setShowBookmarks(false);
            }}>
                  Adicionar marcador
                </Button>
              </div> : <div className="space-y-2">
                {bookmarks.map(bookmark => <div key={bookmark.id} className="flex items-center justify-between p-3 rounded hover:bg-accent cursor-pointer" onClick={() => {
              setPageNumber(bookmark.pagina);
              setShowBookmarks(false);
            }}>
                    <div>
                      <h4 className="font-medium">{bookmark.titulo || `Página ${bookmark.pagina}`}</h4>
                      <p className="text-xs text-muted-foreground">Página {bookmark.pagina}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => {
                e.stopPropagation();
                handleDeleteBookmark(bookmark.id);
              }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>)}
                <Button variant="outline" className="w-full mt-4" onClick={() => {
              setIsAddingBookmark(true);
              setShowBookmarks(false);
            }}>
                  Adicionar marcador
                </Button>
              </div>}
          </div>
        </SheetContent>
      </Sheet>

      {/* Annotations Sidebar */}
      <Sheet open={showAnnotations} onOpenChange={setShowAnnotations}>
        <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[70vh]" : "w-[300px] sm:w-[400px]"}>
          <SheetHeader>
            <SheetTitle>Anotações</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {annotations.length === 0 ? <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="mx-auto h-10 w-10 opacity-30 mb-2" />
                <p>Você não tem anotações neste livro</p>
                <Button variant="outline" className="mt-4" onClick={() => {
              setIsAddingAnnotation(true);
              setShowAnnotations(false);
            }}>
                  Adicionar anotação
                </Button>
              </div> : <div className="space-y-4">
                <Tabs defaultValue="all">
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">Todas</TabsTrigger>
                    <TabsTrigger value="current" className="flex-1">Página atual</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-4 space-y-3">
                    {annotations.map(annotation => <div key={annotation.id} className="bg-yellow-50 border border-yellow-100 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <span className="text-xs bg-yellow-100 px-2 py-1 rounded">
                            Página {annotation.pagina}
                          </span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => 
                      handleDeleteAnnotation(annotation.id)
                    }>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="mt-2 text-sm">{annotation.texto}</p>
                        <Button variant="link" size="sm" className="p-0 h-auto mt-1" onClick={() => {
                    setPageNumber(annotation.pagina);
                    setShowAnnotations(false);
                  }}>
                          Ir para página
                        </Button>
                      </div>)}
                  </TabsContent>
                  <TabsContent value="current" className="mt-4 space-y-3">
                    {annotations.filter(a => a.pagina === pageNumber).length === 0 ? <p className="text-center text-muted-foreground py-4">
                        Nenhuma anotação na página atual
                      </p> : annotations.filter(a => a.pagina === pageNumber).map(annotation => <div key={annotation.id} className="bg-yellow-50 border border-yellow-100 p-3 rounded">
                            <div className="flex justify-between items-start">
                              <span className="text-xs bg-yellow-100 px-2 py-1 rounded">
                                Página {annotation.pagina}
                              </span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => 
                      handleDeleteAnnotation(annotation.id)
                    }>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="mt-2 text-sm">{annotation.texto}</p>
                          </div>)}
                  </TabsContent>
                </Tabs>
                <Button variant="outline" className="w-full mt-4" onClick={() => {
              setIsAddingAnnotation(true);
              setShowAnnotations(false);
            }}>
                  Adicionar anotação
                </Button>
              </div>}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Bookmark Dialog */}
      <Dialog open={isAddingBookmark} onOpenChange={setIsAddingBookmark}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Marcador</DialogTitle>
            <DialogDescription>
              Adicionar um marcador à página {pageNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Título do Marcador</label>
              <Input id="title" placeholder="Ex: Capítulo 1 - Introdução" value={newBookmarkTitle} onChange={e => setNewBookmarkTitle(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddingBookmark(false)}>Cancelar</Button>
            <Button onClick={saveBookmark}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Annotation Dialog */}
      <Dialog open={isAddingAnnotation} onOpenChange={setIsAddingAnnotation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Anotação</DialogTitle>
            <DialogDescription>
              Adicionar uma anotação à página {pageNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="annotation" className="text-sm font-medium">Texto da Anotação</label>
              <Textarea id="annotation" placeholder="Digite sua anotação aqui..." value={newAnnotation} onChange={e => setNewAnnotation(e.target.value)} rows={5} />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddingAnnotation(false)}>Cancelar</Button>
            <Button onClick={saveAnnotation}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
