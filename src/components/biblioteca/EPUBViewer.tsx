
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search } from 'lucide-react';
import ePub, { Book, Rendition } from 'epubjs';
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
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(100);
  
  const viewerRef = useRef<HTMLDivElement>(null);

  // Load the EPUB book
  useEffect(() => {
    if (!livro.link) {
      setError('Link do EPUB não fornecido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Validate URL
      new URL(livro.link);
      
      const epubBook = ePub(livro.link);
      setBook(epubBook);

      // Set up rendition once the book is loaded
      epubBook.ready.then(() => {
        if (!viewerRef.current) return;
        
        const rendition = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: 'auto',
          minSpreadWidth: 900
        });

        rendition.display();
        setRendition(rendition);
        setIsLoading(false);

        // Get total pages
        epubBook.locations.generate(1024).then(() => {
          const totalPages = epubBook.locations.total;
          setTotalPages(totalPages);
        });

        // Track location changes
        rendition.on('locationChanged', (location) => {
          const currentLocation = location.start.cfi;
          setCurrentLocation(currentLocation);
          
          if (book && book.locations.total) {
            const currentPage = book.locations.locationFromCfi(currentLocation);
            setCurrentPage(currentPage);
          }
        });
      }).catch(err => {
        console.error('Error loading EPUB:', err);
        setError('Erro ao carregar o EPUB. O arquivo pode estar corrompido ou inacessível.');
        setIsLoading(false);
      });

      return () => {
        if (epubBook) {
          epubBook.destroy();
        }
      };
    } catch (err) {
      console.error('Error setting up EPUB:', err);
      setError('Erro ao configurar o leitor EPUB.');
      setIsLoading(false);
    }
  }, [livro.link]);

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

  // Zoom functions
  const zoomIn = () => {
    if (rendition && scale < 150) {
      const newScale = scale + 10;
      setScale(newScale);
      rendition.themes.fontSize(`${newScale}%`);
    }
  };

  const zoomOut = () => {
    if (rendition && scale > 70) {
      const newScale = scale - 10;
      setScale(newScale);
      rendition.themes.fontSize(`${newScale}%`);
    }
  };

  // Go to specific page
  const goToPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const pageInput = form.elements.namedItem('page') as HTMLInputElement;
    
    if (pageInput && book && totalPages) {
      const page = parseInt(pageInput.value);
      if (!isNaN(page) && page > 0 && page <= totalPages) {
        const cfi = book.locations.cfiFromLocation(page);
        if (cfi) {
          rendition?.display(cfi);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col">
      <div className="bg-card shadow-lg p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-medium truncate max-w-[70%]">{livro.nome}</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center justify-between p-2 bg-card/50 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPrevious} disabled={isLoading}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-sm flex items-center">
            <form onSubmit={goToPage} className="flex items-center">
              <input 
                type="number" 
                name="page"
                className="w-12 h-7 text-center border rounded-md mr-1"
                defaultValue={currentPage}
                min={1} 
                max={totalPages || 1} 
              />
              <span className="mx-1">de</span>
              <span>{totalPages || '--'}</span>
              <button type="submit" className="sr-only">Ir</button>
            </form>
          </div>
          
          <Button variant="outline" size="sm" onClick={goToNext} disabled={isLoading}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={zoomOut} disabled={isLoading || scale <= 70}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-12 text-center">
            {scale}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn} disabled={isLoading || scale >= 150}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-grow overflow-auto p-4 px-0 bg-gray-50 dark:bg-gray-900">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-lg">
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar EPUB</h3>
              <p>{error}</p>
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
            className="epub-container h-full mx-auto max-w-4xl bg-white dark:bg-gray-800 shadow-lg"
          />
        )}
      </div>
    </div>
  );
}

export default EPUBViewer;
