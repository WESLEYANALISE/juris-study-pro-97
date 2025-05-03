import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCw, Bookmark, Heart, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { toast } from 'sonner';
import './BibliotecaPDFViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface BibliotecaPDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
  bookTitle: string;
  book: LivroJuridico | null;
}

export function BibliotecaPDFViewer({ pdfUrl, onClose, bookTitle, book }: BibliotecaPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const { updateProgress } = useBibliotecaProgresso();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    document.body.classList.add('pdf-viewer-open');
    return () => {
      document.body.classList.remove('pdf-viewer-open');
    };
  }, []);
  
  useEffect(() => {
    if (book && pageNumber > 0) {
      updateProgress(book.id, pageNumber);
    }
  }, [pageNumber, book, updateProgress]);
  
  function onDocumentLoadSuccess({ numPages: totalPages }) {
    setNumPages(totalPages);
    setIsLoading(false);
    setIsLoaded(true);
  }
  
  function onDocumentLoadError(error: any) {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    setIsError(true);
    toast({
      title: "Erro ao carregar PDF",
      description: "Houve um problema ao carregar o livro. Por favor, tente novamente.",
      variant: "destructive"
    });
  }
  
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
  
  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3.0));
  }
  
  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  }
  
  function rotate() {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  }
  
  const toggleFullScreen = () => {
    if (containerRef.current) {
      if (!isFullScreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
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
      setIsFullScreen(!isFullScreen);
    }
  };
  
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
  
  if (isError) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Erro ao carregar o livro</h2>
        <p className="text-muted-foreground">
          Houve um problema ao carregar o arquivo PDF.
          Por favor, tente novamente mais tarde.
        </p>
        <Button onClick={onClose} className="mt-4">
          Fechar
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-background z-50">
      <div className="pdf-container flex flex-col h-full" ref={containerRef}>
        {/* Header with title and close button */}
        <div className="px-4 py-3 border-b bg-secondary/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container max-w-5xl mx-auto flex items-center justify-between">
            <h2 className="text-lg font-semibold truncate">{bookTitle}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar visualizador">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-muted-foreground">Carregando livro... {progress}%</p>
          </div>
        )}
        
        {/* PDF Viewer Content */}
        <div className="pdf-content container max-w-5xl mx-auto flex-grow overflow-auto">
          <div className="flex justify-center">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              onProgress={({ loaded, total }) => {
                if (total) {
                  setProgress(Math.round((loaded / total) * 100));
                }
              }}
              loading=""
            >
              <Page pageNumber={pageNumber} scale={scale} rotate={rotation} />
            </Document>
          </div>
        </div>
        
        {/* Mobile Controls */}
        <div className="pdf-mobile-controls">
          <div className="pdf-mobile-controls-row">
            <Button variant="outline" size="sm" onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pageNumber} de {numPages || '?'}
            </span>
            <Button variant="outline" size="sm" onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 0)}>
              Próximo <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="pdf-mobile-button-grid">
            <Button variant="secondary" size="icon" onClick={zoomIn} aria-label="Aumentar zoom">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={zoomOut} aria-label="Diminuir zoom">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={rotate} aria-label="Rotacionar">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={toggleFullScreen} aria-label="Tela cheia">
              {isFullScreen ? <Share2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
