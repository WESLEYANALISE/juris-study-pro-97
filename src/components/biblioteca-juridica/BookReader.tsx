import React, { useState } from 'react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Maximize2,
  Minimize2,
  SunMoon,
  ZoomIn,
  ZoomOut,
  Fullscreen
} from 'lucide-react';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BibliotecaPDFViewer } from './BibliotecaPDFViewer';
import { CinemaPDFViewer } from './CinemaPDFViewer';

interface BookReaderProps {
  book: LivroJuridico;
  onClose: () => void;
}

export function BookReader({ book, onClose }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(book.total_paginas || 100);
  const [readingMode, setReadingMode] = useState<'light' | 'dark'>('dark');
  const [cinemaMode, setCinemaMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<'preview' | 'pdf'>('preview');
  
  const { getReadingProgress, updateProgress, toggleFavorite, isFavorite } = useBibliotecaProgresso();
  
  const progress = getReadingProgress(book.id);
  const initialPage = progress?.pagina_atual || 1;
  const isBookmarked = isFavorite(book.id);

  // Construct proper PDF URL
  const getPdfUrl = () => {
    if (!book.pdf_url) return '';
    
    // If it already has http(s)://, return as is
    if (book.pdf_url.startsWith('http')) {
      return book.pdf_url;
    }
    
    // Otherwise, construct the full URL with Supabase storage path
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yovocuutiwwmbempxcyo.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/agoravai/${book.pdf_url}`;
  };
  
  const pdfUrl = getPdfUrl();
  
  // Load page when component mounts
  React.useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);
  
  // Save progress when page changes
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setCurrentPage(newPage);
    updateProgress(book.id, newPage);
  };
  
  const handleNextPage = () => handlePageChange(currentPage + 1);
  const handlePrevPage = () => handlePageChange(currentPage - 1);
  
  const handleToggleFavorite = async () => {
    await toggleFavorite(book.id);
    toast.success(isBookmarked ? "Removido dos favoritos" : "Adicionado aos favoritos");
  };
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  
  const toggleReadingMode = () => {
    setReadingMode(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const toggleCinemaMode = () => {
    setCinemaMode(prev => !prev);
  };

  const openPdfViewer = () => {
    if (pdfUrl) {
      setViewMode('pdf');
    } else {
      toast.error("PDF não disponível para este livro");
    }
  };
  
  // When in cinema mode with PDF viewer, render CinemaPDFViewer
  if (cinemaMode && viewMode === 'pdf') {
    return (
      <CinemaPDFViewer
        pdfUrl={pdfUrl}
        onClose={() => setCinemaMode(false)}
        bookTitle={book.titulo}
        book={book}
      />
    );
  }

  // When viewing PDF in regular mode
  if (viewMode === 'pdf') {
    return (
      <BibliotecaPDFViewer
        pdfUrl={pdfUrl}
        onClose={() => setViewMode('preview')}
        bookTitle={book.titulo}
        book={book}
      />
    );
  }
  
  // Preview mode (default)
  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "fixed inset-0 z-50 bg-black/95 flex flex-col",
          cinemaMode && "bg-black"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header */}
        {!cinemaMode && (
          <motion.header
            className="p-4 flex items-center justify-between border-b border-white/10"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="ml-2 text-lg font-medium truncate max-w-md">{book.titulo}</h1>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
                <Heart className={`h-5 w-5 ${isBookmarked ? "fill-red-400 text-red-400" : ""}`} />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => toast.success("Link copiado para o clipboard")}>
                <Share2 className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={toggleReadingMode}>
                <SunMoon className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={toggleCinemaMode}>
                <Maximize2 className="h-5 w-5" />
              </Button>
            </div>
          </motion.header>
        )}
        
        {/* Main content */}
        <div className="flex-1 overflow-hidden flex items-center justify-center relative">
          {/* PDF Viewer (simulated) */}
          <div
            className={cn(
              "max-w-4xl mx-auto w-full h-full flex items-center justify-center relative",
              readingMode === 'dark' ? 'text-white' : 'text-black'
            )}
          >
            <div 
              className={cn(
                "w-full h-full max-h-[85vh] border border-white/10 rounded-md overflow-hidden relative",
                readingMode === 'light' ? 'bg-white' : 'bg-gray-900',
                cinemaMode && "rounded-none max-h-screen"
              )}
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <div 
                className={cn(
                  "flex flex-col items-center justify-center h-full",
                  readingMode === 'light' ? 'text-black' : 'text-white'
                )}
              >
                <p className="text-xl font-medium mb-2">Página {currentPage} de {totalPages}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Pré-visualização do livro
                </p>
                <img 
                  src={book.capa_url || '/placeholder-book-cover.png'} 
                  alt={book.titulo}
                  className="w-40 h-56 object-cover rounded shadow-md mb-6" 
                />
                <p className="text-center max-w-md px-4 mb-8">
                  {book.descricao || `Visualização do livro "${book.titulo}". Use os controles abaixo para navegar ou abrir o PDF completo.`}
                </p>
                
                <Button 
                  variant="default" 
                  onClick={openPdfViewer}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Abrir PDF Completo
                </Button>
              </div>
              
              {/* Cinema mode exit button */}
              {cinemaMode && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 bg-black/50 rounded-full"
                  onClick={toggleCinemaMode}
                >
                  <Minimize2 className="h-5 w-5" />
                </Button>
              )}
            </div>
            
            {/* Page navigation buttons */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full hover:bg-black/70"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full hover:bg-black/70"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Footer */}
        {!cinemaMode && (
          <motion.footer 
            className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-md"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="max-w-4xl mx-auto">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Página {currentPage} de {totalPages}</span>
                  <span>
                    {Math.round((currentPage / totalPages) * 100)}% concluído
                  </span>
                </div>
                <Progress 
                  value={(currentPage / totalPages) * 100}
                  className="h-1.5"
                  indicatorClassName="bg-amber-400"
                />
              </div>
              
              {/* Controls */}
              <div className="flex justify-between items-center">
                {/* Page input */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-white/10"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
                      className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground">/ {totalPages}</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-white/10"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Zoom controls */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-xs w-12 text-center">{zoom}%</span>
                  
                  <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  
                  <div className="mx-2 h-6 border-r border-white/10"></div>
                  
                  <Tabs defaultValue={readingMode} onValueChange={(v) => setReadingMode(v as 'light' | 'dark')}>
                    <TabsList className="bg-white/5 border border-white/10">
                      <TabsTrigger value="dark" className="text-xs">Escuro</TabsTrigger>
                      <TabsTrigger value="light" className="text-xs">Claro</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <Button variant="outline" size="sm" onClick={toggleCinemaMode} className="gap-1.5">
                    <Fullscreen className="h-4 w-4" />
                    <span className="text-xs">Cinema</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.footer>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
