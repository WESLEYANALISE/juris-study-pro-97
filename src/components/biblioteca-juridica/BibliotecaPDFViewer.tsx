
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCw, Bookmark, Download, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import './BibliotecaPDFViewer.css';

// Set PDF.js worker source
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
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const { saveReadingProgress } = useBibliotecaProgresso();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    document.body.classList.add('pdf-viewer-open');
    
    // Force reload PDF when URL changes
    setIsLoaded(false);
    setIsLoading(true);
    setPageNumber(1);
    
    console.log("Loading PDF from URL:", pdfUrl);
    
    return () => {
      document.body.classList.remove('pdf-viewer-open');
    };
  }, [pdfUrl]);
  
  useEffect(() => {
    if (book && pageNumber > 0 && isLoaded) {
      saveReadingProgress(book.id, pageNumber);
    }
  }, [pageNumber, book, saveReadingProgress, isLoaded]);

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
    return fullUrl;
  };

  // Verify the URL is valid
  const verifyPdfUrl = (url: string): boolean => {
    // Empty URL
    if (!url) {
      setErrorMessage("URL do PDF não fornecida");
      setIsError(true);
      setIsLoading(false);
      return false;
    }
    
    // Check if URL is valid
    try {
      const processedUrl = processUrl(url);
      new URL(processedUrl);
      return true;
    } catch (e) {
      console.error("Invalid PDF URL:", e);
      setErrorMessage("URL do PDF inválida ou mal formatada");
      setIsError(true);
      setIsLoading(false);
      return false;
    }
  };
  
  useEffect(() => {
    verifyPdfUrl(pdfUrl);
  }, [pdfUrl]);
  
  function onDocumentLoadSuccess({ numPages: totalPages }) {
    console.log("PDF loaded successfully. Total pages:", totalPages);
    setNumPages(totalPages);
    setIsLoading(false);
    setIsLoaded(true);
    toast.success(`PDF carregado: ${totalPages} páginas`);
  }
  
  function onDocumentLoadError(error: any) {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    setIsError(true);
    setErrorMessage(`Erro ao carregar PDF: ${error.message || "Verifique se o arquivo existe"}`);
    toast.error("Houve um problema ao carregar o livro. Por favor, tente novamente.");
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
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 text-destructive rounded-lg p-6 max-w-md text-center shadow-lg">
          <AlertCircle className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Erro ao carregar o livro</h2>
          <p className="text-muted-foreground mb-6">
            {errorMessage || "Houve um problema ao carregar o arquivo PDF. Por favor, tente novamente mais tarde."}
          </p>
          <div className="text-xs mb-4 bg-black/10 p-2 rounded overflow-auto max-h-32">
            <code className="break-all whitespace-pre-wrap">{processUrl(pdfUrl)}</code>
          </div>
          <Button onClick={onClose} className="mt-4">
            Fechar
          </Button>
        </div>
      </div>
    );
  }
  
  // Use the processed URL for the PDF
  const processedPdfUrl = processUrl(pdfUrl);
  
  return (
    <motion.div 
      className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="pdf-container" ref={containerRef}>
        {/* Simplified header with back button */}
        <div className="pdf-header">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2" 
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h2 className="text-lg font-medium flex-1 truncate">{bookTitle}</h2>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-muted-foreground">Carregando livro... {progress}%</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-md text-center">
              Se o livro não carregar, verifique se o PDF está disponível no servidor.
            </p>
          </div>
        )}
        
        {/* PDF Viewer Content */}
        <div className="pdf-content">
          <Document
            file={processedPdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            onProgress={({ loaded, total }) => {
              if (total) {
                setProgress(Math.round((loaded / total) * 100));
              }
            }}
            loading={
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="mt-2 text-sm">Carregando...</span>
              </div>
            }
            error={
              <div className="text-center text-red-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Erro ao carregar PDF</p>
              </div>
            }
          >
            {isLoaded && (
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                rotate={rotation}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                error={
                  <div className="text-center text-red-500 p-4">
                    <p>Erro ao renderizar página {pageNumber}</p>
                  </div>
                }
              />
            )}
          </Document>
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
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default BibliotecaPDFViewer;
