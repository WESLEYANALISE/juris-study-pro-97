
import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, X, Search, ZoomIn, ZoomOut } from 'lucide-react';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import './PDFViewer.css';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
interface PDFViewerProps {
  livro: {
    id: string | number;
    nome: string;
    pdf: string;
    capa_url?: string;
  };
  onClose: () => void;
}
export function PDFViewer({
  livro,
  onClose
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>('');
  const [scale, setScale] = useState<number>(1.0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up touch gestures for mobile
  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      goToNextPage();
    },
    onSwipeRight: () => {
      goToPreviousPage();
    },
    onZoomChange: (newScale) => {
      setScale(newScale);
    },
    onDoubleTap: () => {
      // Reset zoom on double tap
      setScale(1.0);
    },
    minScale: 0.5,
    maxScale: 3
  });

  // Validate if the PDF URL is valid
  useEffect(() => {
    const validateURL = async () => {
      if (!livro.pdf || typeof livro.pdf !== 'string') {
        setError('PDF URL inválida ou não disponível');
        setIsLoading(false);
        return;
      }
      try {
        // Basic URL validation
        new URL(livro.pdf);
        setError(null);
      } catch (err) {
        console.error("Invalid PDF URL:", err);
        setError('URL do PDF inválida');
      }
    };
    validateURL();
  }, [livro.pdf]);

  // Auto-hide controls after inactivity
  useEffect(() => {
    const handleActivity = () => {
      setShowControls(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Init visibility
    handleActivity();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  // Handle document load success
  function onDocumentLoadSuccess({
    numPages
  }: {
    numPages: number;
  }): void {
    setNumPages(numPages);
    setIsLoading(false);
  }
  function onDocumentLoadError(error: Error): void {
    console.error('Error loading PDF:', error);
    setError('Erro ao carregar o PDF. Por favor, tente novamente mais tarde.');
    setIsLoading(false);
  }

  // Navigation functions
  const goToPreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };
  const goToNextPage = () => {
    if (numPages) {
      setPageNumber(prev => Math.min(prev + 1, numPages));
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  // Search function
  const handleSearch = () => {
    // This is a placeholder for PDF search functionality
    // Implementing actual text search within PDFs requires more complex logic
    console.log('Search for:', searchText);
    alert(`Funcionalidade de busca para "${searchText}" será implementada em breve.`);
  };
  return <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col">
      <div 
        className="bg-card shadow-lg p-4 border-b flex justify-between items-center transition-opacity duration-300" 
        style={{ opacity: showControls ? 1 : 0 }}
      >
        <h2 className="text-xl font-medium truncate">{livro.nome}</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div ref={containerRef} className="flex-grow overflow-auto p-4 flex justify-center px-0">
        {error ? <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-lg">
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar PDF</h3>
              <p>{error}</p>
              <Button className="mt-4" onClick={onClose}>
                Voltar
              </Button>
            </div>
          </div> : <Document 
                file={livro.pdf} 
                onLoadSuccess={onDocumentLoadSuccess} 
                onLoadError={onDocumentLoadError} 
                loading={<div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Carregando PDF...</p>
                </div>} 
                className="pdf-container"
              >
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={false} 
              renderAnnotationLayer={false} 
              className="pdf-page"
            />
          </Document>}
      </div>

      {/* Bottom controls that show/hide based on activity */}
      <div 
        className="pdf-controls transition-opacity duration-300" 
        style={{ opacity: showControls ? 1 : 0 }}
      >
        <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={pageNumber <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="bg-background/80 backdrop-blur px-2 rounded flex items-center">
          <Input 
            type="number"
            min={1}
            max={numPages || 1}
            value={pageNumber}
            onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
            className="w-12 h-8 text-center p-0 border-none"
          />
          <span className="text-sm mx-1">/ {numPages || '--'}</span>
        </div>
        
        <Button variant="outline" size="sm" onClick={goToNextPage} disabled={!numPages || pageNumber >= numPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        
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
      </div>
    </div>;
}
