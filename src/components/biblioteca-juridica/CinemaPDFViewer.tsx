import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page } from 'react-pdf';
import { 
  ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCw, 
  Bookmark, Heart, Download, Share2, StickyNote, Lightbulb, 
  AlertCircle, Check, Pen, Moon, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { pdfjs } from '@/lib/pdf-config';
import './BibliotecaPDFViewer.css';

// pdfjs worker is now configured in pdf-config.ts

interface CinemaPDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
  bookTitle: string;
  book: LivroJuridico | null;
}

export function CinemaPDFViewer({ pdfUrl, onClose, bookTitle, book }: CinemaPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<{page: number, text: string}[]>([]);
  
  const { saveReadingProgress, isFavorite, toggleFavorite } = useBibliotecaProgresso();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle mouse movement to show/hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    document.body.classList.add('pdf-viewer-open');
    if (darkMode) {
      document.body.classList.add('dark-pdf-mode');
    } else {
      document.body.classList.remove('dark-pdf-mode');
    }
    
    return () => {
      document.body.classList.remove('pdf-viewer-open');
      document.body.classList.remove('dark-pdf-mode');
    };
  }, [darkMode]);
  
  useEffect(() => {
    if (book && pageNumber > 0) {
      saveReadingProgress(book.id, pageNumber);
    }
  }, [pageNumber, book, saveReadingProgress]);
  
  function onDocumentLoadSuccess({ numPages: totalPages }) {
    setNumPages(totalPages);
    setIsLoading(false);
    setIsLoaded(true);
  }
  
  function onDocumentLoadError(error: any) {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    setIsError(true);
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
  
  function toggleNotes() {
    setShowNotes(!showNotes);
  }
  
  function addNote() {
    if (noteText.trim()) {
      setNotes([...notes, { page: pageNumber, text: noteText }]);
      setNoteText('');
      toast.success("Anotação adicionada");
    }
  }
  
  function handleFavoriteToggle() {
    if (book) {
      toggleFavorite(book.id);
      toast.success(isFavorite(book.id) ? "Livro adicionado aos favoritos" : "Livro removido dos favoritos");
    }
  }
  
  function toggleDarkMode() {
    setDarkMode(!darkMode);
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
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center"
      >
        <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30 max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar o livro</h2>
          <p className="text-muted-foreground mb-6">
            Houve um problema ao carregar o arquivo PDF.
            Por favor, tente novamente mais tarde.
          </p>
          <Button onClick={onClose} className="bg-red-600 hover:bg-red-500">
            Fechar
          </Button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <div className={cn("fixed inset-0 z-50", darkMode ? "bg-black" : "bg-neutral-100")} ref={containerRef}>
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "px-4 py-3 fixed top-0 left-0 right-0 z-50 backdrop-blur-md",
              darkMode ? "bg-black/70" : "bg-white/70"
            )}
          >
            <div className="container max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose} 
                  aria-label="Fechar visualizador"
                  className={darkMode ? "text-white" : "text-black"}
                >
                  <X className="h-5 w-5" />
                </Button>
                <h2 className={cn("text-lg font-semibold truncate", darkMode ? "text-white" : "text-black")}>
                  {bookTitle}
                </h2>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleDarkMode} 
                  className={darkMode ? "text-white" : "text-black"}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleNotes} 
                  className={cn(
                    darkMode ? "text-white" : "text-black",
                    showNotes && "bg-amber-500/20"
                  )}
                >
                  <StickyNote className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleFavoriteToggle} 
                  className={cn(
                    darkMode ? "text-white" : "text-black",
                    book && isFavorite(book.id) && "text-amber-500"
                  )}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleFullScreen}
                  className={darkMode ? "text-white" : "text-black"}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "px-4 py-3 fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md",
              darkMode ? "bg-black/70" : "bg-white/70"
            )}
          >
            <div className="container max-w-6xl mx-auto">
              <div className="flex items-center justify-center mb-2">
                <Button 
                  variant="ghost" 
                  onClick={() => changePage(-1)} 
                  disabled={pageNumber <= 1}
                  className={darkMode ? "text-white" : "text-black"}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" /> Anterior
                </Button>
                <div className="w-40 text-center">
                  <span className={cn("text-sm", darkMode ? "text-white" : "text-black")}>
                    Página {pageNumber} de {numPages || '?'}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => changePage(1)} 
                  disabled={!numPages || pageNumber >= numPages}
                  className={darkMode ? "text-white" : "text-black"}
                >
                  Próxima <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              </div>
              
              <div className="flex justify-center gap-2">
                <Progress 
                  value={numPages ? (pageNumber / numPages) * 100 : 0} 
                  className={cn(
                    "w-full max-w-md h-1", 
                    darkMode ? "bg-white/20" : "bg-black/20"
                  )}
                />
              </div>
              
              <div className="flex justify-center gap-2 mt-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={zoomIn}
                  className={darkMode ? "text-white" : "text-black"}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={zoomOut}
                  className={darkMode ? "text-white" : "text-black"}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={rotate}
                  className={darkMode ? "text-white" : "text-black"}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Notes sidebar */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={cn(
              "fixed right-0 top-0 bottom-0 w-80 p-4 shadow-xl z-40 overflow-auto",
              darkMode ? "bg-gray-900/80 backdrop-blur-md" : "bg-white/90 backdrop-blur-md"
            )}
          >
            <div className="mb-4">
              <h3 className={cn("text-lg font-bold mb-2", darkMode ? "text-white" : "text-black")}>
                Anotações - Página {pageNumber}
              </h3>
              <div className="flex gap-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Adicione uma nota..."
                  className={cn(
                    "w-full p-2 rounded-md text-sm",
                    darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"
                  )}
                  rows={4}
                />
              </div>
              <Button onClick={addNote} className="mt-2 bg-amber-600 hover:bg-amber-500">
                <Check className="h-4 w-4 mr-1" /> Salvar
              </Button>
            </div>
            
            <div className="space-y-3">
              {notes
                .filter(note => note.page === pageNumber)
                .map((note, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-md",
                      darkMode ? "bg-gray-800/80 text-white" : "bg-gray-100 text-black"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <Pen className="h-3 w-3 mr-1 text-amber-500" />
                        <span className="text-xs text-muted-foreground">Nota {index + 1}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm mt-1">{note.text}</p>
                  </motion.div>
                ))}
                
              {notes.filter(note => note.page === pageNumber).length === 0 && (
                <div className="text-center py-8">
                  <Lightbulb className={cn("h-8 w-8 mx-auto mb-2", darkMode ? "text-amber-500/50" : "text-amber-600/50")} />
                  <p className="text-sm text-muted-foreground">
                    Adicione uma anotação para esta página
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-amber-500 border-r-amber-500 border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className={cn("text-lg", darkMode ? "text-white" : "text-black")}>
              Carregando livro... {progress}%
            </p>
          </div>
        </div>
      )}
      
      {/* PDF Viewer Content */}
      <div className={cn(
        "pdf-content h-full flex justify-center items-center px-4 overflow-auto",
        darkMode ? "bg-black text-white" : "bg-neutral-100 text-black"
      )}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          onProgress={({ loaded, total }) => {
            if (total) {
              setProgress(Math.round((loaded / total) * 100));
            }
          }}
          loading={<span>Carregando...</span>}
          className="max-h-full"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            rotate={rotation} 
            className={darkMode ? "pdf-page-dark" : "pdf-page-light"}
          />
        </Document>
      </div>
    </div>
  );
}

// Add these to your CSS file
