
import React, { useState, useEffect } from 'react';
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, Volume2, BookmarkPlus, BookmarkCheck, AlertCircle } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useToast } from '@/hooks/use-toast';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { motion } from 'framer-motion';

interface BibliotecaBookModalProps {
  book: LivroJuridico | null;
  onClose: () => void;
  onReadBook: () => void;
}

export function BibliotecaBookModal({
  book,
  onClose,
  onReadBook
}: BibliotecaBookModalProps) {
  const { toast } = useToast();
  const { isFavorite, toggleFavorite, getReadingProgress } = useBibliotecaProgresso();
  const [coverLoaded, setCoverLoaded] = useState<boolean>(false);
  const [coverError, setCoverError] = useState<boolean>(false);
  
  useEffect(() => {
    setCoverLoaded(false);
    setCoverError(false);
  }, [book]);
  
  const handleDownload = () => {
    if (!book || !book.pdf_url) {
      toast({
        title: "Download indisponível",
        description: "O PDF não está disponível para download."
      });
      return;
    }
    
    // Create PDF URL
    const pdfUrl = book.pdf_url.startsWith('http') 
      ? book.pdf_url 
      : `${import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co"}/storage/v1/object/public/agoravai/${book.pdf_url}`;
    
    window.open(pdfUrl, '_blank');
  };
  
  const handleToggleFavorite = async () => {
    if (!book) return;
    await toggleFavorite(book.id);
  };
  
  // If no book is selected
  if (!book) {
    return null;
  }
  
  const isFav = isFavorite(book.id);
  const readingProgress = getReadingProgress(book.id);
  const hasStartedReading = readingProgress && readingProgress.pagina_atual > 1;
  
  // Handle book cover
  const coverUrl = book.capa_url 
    ? book.capa_url.startsWith('http')
      ? book.capa_url
      : `${import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co"}/storage/v1/object/public/agoravai/${book.capa_url}`
    : '/placeholder-book-cover.png';

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/3 flex justify-center">
            <div className="relative aspect-[2/3] w-44 rounded-lg overflow-hidden shadow-lg">
              {!coverLoaded && !coverError && (
                <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Carregando...</span>
                </div>
              )}
              
              {coverError && (
                <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-muted-foreground text-xs text-center">
                    Capa não disponível
                  </span>
                </div>
              )}
              
              <motion.img
                src={coverUrl}
                alt={book.titulo}
                className={`object-cover w-full h-full ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: coverLoaded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                onLoad={() => setCoverLoaded(true)}
                onError={(e) => {
                  setCoverError(true);
                  (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                  setCoverLoaded(true);
                }}
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                {book.total_paginas && (
                  <Badge variant="outline" className="bg-primary/90 text-white">
                    {book.total_paginas} páginas
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full sm:w-2/3">
            <DialogTitle className="text-2xl">
              {book.titulo}
            </DialogTitle>
            
            <div className="mt-2 flex flex-wrap gap-2">
              {book.categoria && (
                <Badge>{book.categoria}</Badge>
              )}
              {book.autor && (
                <Badge variant="outline">{book.autor}</Badge>
              )}
            </div>
            
            {hasStartedReading && (
              <div className="mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary" 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${book.total_paginas 
                          ? Math.min(100, (readingProgress.pagina_atual / book.total_paginas) * 100) 
                          : 0}%` 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {readingProgress.pagina_atual}/{book.total_paginas || '?'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Sobre este livro</h3>
              <p className="text-muted-foreground">
                {book.descricao || "Sem descrição disponível para este livro."}
              </p>
            </div>
          </div>
        </div>
      </DialogHeader>
      
      <DialogFooter className="sm:justify-between gap-2 flex-wrap mt-4">
        <div className="flex gap-2 flex-wrap">
          <Button variant="default" onClick={onReadBook} className="gap-2">
            <BookOpen className="h-4 w-4" /> 
            {hasStartedReading ? 'Continuar Leitura' : 'Ler Agora'}
          </Button>
          
          <Button variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={isFav ? "default" : "ghost"}
            onClick={handleToggleFavorite}
            className="gap-2"
          >
            {isFav ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
            {isFav ? "Favoritado" : "Favoritar"}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
