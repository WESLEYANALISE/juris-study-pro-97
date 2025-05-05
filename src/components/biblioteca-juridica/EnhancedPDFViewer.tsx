
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCw, 
  Bookmark, Download, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { toast } from 'sonner';
import './BibliotecaPDFViewer.css';

// Set PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface EnhancedPDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
  bookTitle: string;
  book: LivroJuridico | null;
}

export function EnhancedPDFViewer({ pdfUrl, onClose, bookTitle, book }: EnhancedPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  
  const { saveReadingProgress, isFavorite, toggleFavorite } = useBibliotecaProgresso();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    document.body.classList.add('pdf-viewer-open');
    
    console.log("Loading PDF from URL:", pdfUrl);
    
    return () => {
      document.body.classList.remove('pdf-viewer-open');
    };
  }, [pdfUrl]);
  
  useEffect(() => {
    if (book && pageNumber > 0) {
      saveReadingProgress(book.id, pageNumber);
    }
  }, [pageNumber, book, saveReadingProgress]);

  // Process the URL to ensure it's a full URL
  const processUrl = (url: string): string => {
    if (!url) return '';
    
    // Already a full URL
    if (url.startsWith('http')) {
      return url;
    }
    
    // Add the Supabase storage URL prefix if it's just a path
    const storageBaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co";
    const fullUrl = `${storageBaseUrl}/storage/v1/object/public/agoravai/${url}`;
    console.log("Converted URL:", fullUrl);
    return fullUrl;
  };
  
  function onDocumentLoadSuccess({ numPages: totalPages }) {
    console.log("PDF loaded successfully. Total pages:", totalPages);
    setNumPages(totalPages);
    setIsLoading(false);
    toast.success(`PDF carregado: ${totalPages} páginas`);
  }
  
  function onDocumentLoadError(error: any) {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    setIsError(true);
    setErrorMessage(`Erro ao carregar PDF: ${error.message || "Verifique se o arquivo existe"}`);
    toast.error("Houve um problema ao carregar o livro. Por favor, tente novamente.");
  }
  
  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return newPageNumber >= 1 && newPageNumber <= (numPages || 1) 
        ? newPageNumber 
        : prevPageNumber;
    });
  }
  
  function handleBookmarkToggle() {
    if (book) {
      toggleFavorite(book.id);
      toast.success(isFavorite(book.id) 
        ? "Livro adicionado aos favoritos" 
        : "Livro removido dos favoritos"
      );
    }
  }
  
  // The processed URL for the PDF
  const processedPdfUrl = processUrl(pdfUrl);
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col" ref={containerRef}>
      {/* Header with title and close button */}
      <div className="px-4 py-3 border-b bg-secondary/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-2" aria-label="Fechar visualizador">
              <X className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold truncate">{bookTitle}</h2>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleBookmarkToggle}
              title={book && isFavorite(book.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Bookmark className={`h-4 w-4 ${book && isFavorite(book.id) ? "fill-primary" : ""}`} />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setScale(s => Math.min(s + 0.25, 3))}
              title="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}
              title="Diminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setRotation(r => (r + 90) % 360)}
              title="Rotacionar"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando livro... {progress}%</p>
        </div>
      )}
      
      {/* Error display */}
      {isError && (
        <div className="flex items-center justify-center h-full p-4">
          <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md text-center">
            <h2 className="text-xl font-bold mb-2">Erro ao carregar o livro</h2>
            <p className="mb-4">{errorMessage}</p>
            <Button onClick={onClose}>Voltar</Button>
          </div>
        </div>
      )}
      
      {/* PDF content */}
      <div className="flex-grow flex justify-center items-center overflow-auto p-4">
        <Document
          file={processedPdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          onProgress={({ loaded, total }) => {
            if (total) {
              setProgress(Math.round((loaded / total) * 100));
            }
          }}
          loading={null}
          className="pdf-document-container"
        >
          {!isLoading && !isError && (
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              rotate={rotation} 
              className="pdf-page"
              width={containerRef.current?.clientWidth ? containerRef.current.clientWidth * 0.9 : undefined}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          )}
        </Document>
      </div>
      
      {/* Page navigation */}
      <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-2 z-40">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => changePage(-1)} 
              disabled={pageNumber <= 1}
              className="w-24"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
            </Button>
            
            <div className="text-center">
              <div className="text-sm mb-1">
                Página {pageNumber} de {numPages || '?'}
              </div>
              <Progress 
                value={numPages ? (pageNumber / numPages) * 100 : 0} 
                className="w-40 h-2" 
              />
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => changePage(1)} 
              disabled={!numPages || pageNumber >= numPages}
              className="w-24"
            >
              Próxima <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
