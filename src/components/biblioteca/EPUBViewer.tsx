
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Moon, Sun, Bookmark, AlertTriangle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import ePub from 'epubjs';
import './EPUBViewer.css';

interface EPUBViewerProps {
  livro: {
    id: string | number;
    nome: string;
    link: string;
    capa_url?: string;
  };
  onClose: () => void;
}

export function EPUBViewer({ livro, onClose }: EPUBViewerProps) {
  const [book, setBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [currentCfi, setCurrentCfi] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(100);
  const [nightMode, setNightMode] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<{ cfi: string; page: number }[]>([]);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  
  const viewerRef = useRef<HTMLDivElement>(null);

  // Add a debug log function
  const addDebugLog = useCallback((message: string) => {
    console.log(`[EPUBViewer] ${message}`);
    setDebugLog(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`].slice(-20));
  }, []);

  // Load the EPUB book
  useEffect(() => {
    if (!livro.link) {
      setError('Link do EPUB não fornecido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      addDebugLog(`Tentando carregar EPUB de: ${livro.link}`);
      
      // Validate URL
      let url;
      try {
        url = new URL(livro.link);
        addDebugLog(`URL validada: ${url.toString()}`);
      } catch (e) {
        setError('URL inválida para o ebook');
        addDebugLog(`URL inválida: ${e}`);
        setIsLoading(false);
        return;
      }
      
      // Pre-check URL availability
      fetch(livro.link, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erro ao acessar o arquivo: ${response.status}`);
          }
          
          addDebugLog(`Arquivo acessível (status ${response.status}), iniciando carregamento`);
          
          // Initialize EPUB.js with the validated URL
          const epubBook = ePub(livro.link);
          setBook(epubBook);
          
          // Listen for errors during opening
          epubBook.on('openFailed', function(e: any) {
            addDebugLog(`Falha ao abrir EPUB: ${e}`);
            setError(`Falha ao abrir o EPUB: ${e.message || 'Erro desconhecido'}`);
            setIsLoading(false);
          });

          // Set up rendition once the book is loaded
          epubBook.loaded.navigation
            .then(() => {
              if (!viewerRef.current) {
                addDebugLog('Elemento viewerRef não está disponível');
                return;
              }
              
              addDebugLog('Renderizando EPUB no contêiner');
              
              const rendition = epubBook.renderTo(viewerRef.current, {
                width: '100%',
                height: '100%',
                flow: 'paginated',
                spread: 'auto',
                minSpreadWidth: 900
              });

              addDebugLog('Inicializando exibição do EPUB');
              rendition.display().then(() => {
                addDebugLog('Exibição do EPUB inicializada com sucesso');
              });
              
              setRendition(rendition);
              setIsLoading(false);

              // Apply initial theme
              updateTheme(rendition, nightMode);

              // Get locations for pagination - force simplified location creation
              addDebugLog('Gerando localizações para paginação');
              epubBook.locations.generate(1024)
                .then(() => {
                  const totalLoc = epubBook.locations.length();
                  setTotalPages(totalLoc || 0);
                  addDebugLog(`Geradas ${totalLoc} localizações`);
                })
                .catch(err => {
                  addDebugLog(`Erro ao gerar localizações: ${err}`);
                  // Continue with the book even if locations fail
                });

              // Track location changes
              rendition.on('locationChanged', (location: any) => {
                if (!location || !location.start) {
                  addDebugLog('locationChanged: Evento recebido sem dados válidos de localização');
                  return;
                }
                
                const cfi = location.start.cfi;
                setCurrentCfi(cfi);
                addDebugLog(`Localização alterada para: ${cfi}`);
                
                if (epubBook.locations.length()) {
                  try {
                    const pageNumber = epubBook.locations.locationFromCfi(cfi);
                    if (typeof pageNumber === 'number') {
                      setCurrentPage(pageNumber + 1); // Add 1 for human-readable page numbers
                      addDebugLog(`Página atual: ${pageNumber + 1}`);
                    }
                  } catch (e) {
                    addDebugLog(`Erro ao converter CFI para localização: ${e}`);
                  }
                }
              });
              
              // Listen for rendition display errors
              rendition.on('displayError', (error: any) => {
                addDebugLog(`Erro ao renderizar conteúdo: ${error}`);
              });

            })
            .catch(err => {
              addDebugLog(`Erro ao carregar a navegação do EPUB: ${err}`);
              setError('Erro ao carregar a navegação do EPUB. O arquivo pode estar corrompido.');
              setIsLoading(false);
            });
        })
        .catch(err => {
          addDebugLog(`Erro ao verificar acesso ao arquivo: ${err}`);
          setError(`Não foi possível acessar o arquivo EPUB. Erro: ${err.message}`);
          setIsLoading(false);
        });

      return () => {
        if (book) {
          addDebugLog('Limpando recursos do EPUB');
          book.destroy();
        }
      };
    } catch (err) {
      console.error('Error setting up EPUB:', err);
      addDebugLog(`Erro ao configurar o leitor EPUB: ${err}`);
      setError('Erro ao configurar o leitor EPUB.');
      setIsLoading(false);
    }
  }, [livro.link, addDebugLog]);

  // Update theme when night mode changes
  const updateTheme = useCallback((rendition: any, isDarkMode: boolean) => {
    if (!rendition) return;
    
    if (isDarkMode) {
      rendition.themes.register('night', {
        body: {
          color: '#e1e1e1 !important',
          background: '#222 !important'
        },
        'p, li, div, h1, h2, h3, h4, h5, h6, span': {
          color: '#e1e1e1 !important'
        },
        a: {
          color: '#86b7fe !important'
        },
        img: {
          'filter': 'brightness(0.8) contrast(1.2)'
        }
      });
      rendition.themes.select('night');
    } else {
      rendition.themes.register('day', {
        body: {
          color: '#222 !important',
          background: '#fff !important'
        }
      });
      rendition.themes.select('day');
    }
  }, []);

  useEffect(() => {
    if (rendition) {
      updateTheme(rendition, nightMode);
    }
  }, [nightMode, rendition, updateTheme]);

  // Font size change
  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}%`);
    }
  }, [fontSize, rendition]);

  // Navigation functions
  const goToPrevious = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const goToNext = () => {
    if (rendition) {
      rendition.next();
    }
  };

  // Handle key presses for navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'D' && e.altKey) {
        // Alt+D to toggle debug panel
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [rendition]);

  // Go to specific page
  const goToPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const pageInput = form.elements.namedItem('page') as HTMLInputElement;
    
    if (pageInput && book && totalPages) {
      const page = parseInt(pageInput.value);
      if (!isNaN(page) && page > 0 && page <= totalPages) {
        try {
          const cfi = book.locations.cfiFromLocation(page - 1); // Adjust for 0-based index
          if (cfi) {
            rendition?.display(cfi);
          }
        } catch (err) {
          console.error('Error navigating to page:', err);
          toast.error('Não foi possível navegar para esta página');
        }
      }
    }
  };

  // Add current page as bookmark
  const addBookmark = () => {
    if (currentCfi) {
      const bookmark = { cfi: currentCfi, page: currentPage };
      setBookmarks(prev => {
        // Check if bookmark already exists
        if (prev.some(b => b.cfi === currentCfi)) {
          toast.info('Esta página já está marcada');
          return prev;
        }
        
        toast.success('Marcador adicionado');
        return [...prev, bookmark];
      });
    }
  };

  // Go to bookmark
  const goToBookmark = (cfi: string) => {
    if (rendition && cfi) {
      rendition.display(cfi);
    }
  };

  // Handle touch gestures for mobile
  useEffect(() => {
    if (!viewerRef.current || !rendition) return;

    let touchStartX = 0;
    
    const touchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const touchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      // Minimum swipe distance to trigger page change
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
    };

    const container = viewerRef.current;
    container.addEventListener('touchstart', touchStart, { passive: true });
    container.addEventListener('touchend', touchEnd);
    
    return () => {
      container.removeEventListener('touchstart', touchStart);
      container.removeEventListener('touchend', touchEnd);
    };
  }, [rendition]);

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col">
      {/* Header with title and close button */}
      <div className="bg-card shadow-lg p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-medium truncate max-w-[70%]">{livro.nome}</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between flex-wrap p-2 bg-card/50 border-b">
        {/* Page navigation */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPrevious} disabled={isLoading}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <form onSubmit={goToPage} className="flex items-center">
            <input 
              type="number" 
              name="page"
              className="w-12 h-7 text-center border rounded-md"
              defaultValue={currentPage}
              min={1} 
              max={totalPages || 1} 
            />
            <span className="mx-1">de</span>
            <span>{totalPages || '--'}</span>
            <button type="submit" className="sr-only">Ir</button>
          </form>
          
          <Button variant="outline" size="sm" onClick={goToNext} disabled={isLoading}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Zoom controls */}
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFontSize(prev => Math.max(prev - 10, 70))} 
            disabled={isLoading || fontSize <= 70}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm w-12 text-center">
            {fontSize}%
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFontSize(prev => Math.min(prev + 10, 150))} 
            disabled={isLoading || fontSize >= 150}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setNightMode(prev => !prev)}
            disabled={isLoading}
            title={nightMode ? "Modo dia" : "Modo noite"}
          >
            {nightMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={addBookmark}
            disabled={isLoading || !currentCfi}
            title="Adicionar marcador"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          
          {/* Debug button - only for development */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(prev => !prev)}
            className="opacity-50 hover:opacity-100"
            title="Debug"
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Book content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Main content area with EPUB viewer */}
        <div className="flex-grow h-full overflow-hidden relative">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-lg">
                <h3 className="text-lg font-semibold mb-2">Erro ao carregar EPUB</h3>
                <p>{error}</p>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Informações técnicas para debug:
                  </p>
                  <pre className="text-xs bg-black/10 p-2 rounded overflow-auto max-h-24">
                    URL: {livro.link}
                  </pre>
                </div>
                <Button className="mt-4" onClick={onClose}>
                  Voltar
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">Carregando EPUB...</p>
            </div>
          ) : (
            <div 
              ref={viewerRef} 
              className={`epub-container h-full ${nightMode ? 'night-mode' : ''}`}
            />
          )}
        </div>

        {/* Bookmarks sidebar (can be toggled by user) */}
        {bookmarks.length > 0 && (
          <div className="hidden md:block w-64 h-full border-l bg-background overflow-y-auto p-2">
            <h3 className="font-medium text-sm mb-2 px-2">Marcadores</h3>
            <div className="space-y-1">
              {bookmarks.map((bookmark, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  className="w-full justify-start text-sm h-8 px-2" 
                  onClick={() => goToBookmark(bookmark.cfi)}
                >
                  Página {bookmark.page}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile navigation (for touch devices) */}
      <div className="md:hidden flex justify-between p-2 border-t bg-card/50">
        <Button variant="ghost" className="w-1/2" onClick={goToPrevious}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <Button variant="ghost" className="w-1/2" onClick={goToNext}>
          Próxima <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {/* Debug panel - normally hidden */}
      {showDebug && (
        <div className="epub-debug">
          <p>Debug Log:</p>
          {debugLog.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EPUBViewer;
