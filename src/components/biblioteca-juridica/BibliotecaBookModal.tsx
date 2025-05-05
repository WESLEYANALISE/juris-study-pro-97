
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { motion } from 'framer-motion';

interface BibliotecaBookModalProps {
  book: LivroJuridico | null;
  open: boolean;
  onClose: () => void;
  onRead: () => void;
}

export function BibliotecaBookModal({
  book,
  open,
  onClose,
  onRead
}: BibliotecaBookModalProps) {
  const { isFavorite, toggleFavorite } = useBibliotecaProgresso();
  const [isDownloading, setIsDownloading] = useState(false);
  
  if (!book) return null;
  
  const handleDownload = () => {
    setIsDownloading(true);
    
    // Format PDF URL
    const pdfUrl = book.pdf_url.startsWith('http') 
      ? book.pdf_url 
      : `https://yovocuutiwwmbempxcyo.supabase.co/storage/v1/object/public/agoravai/${book.pdf_url}`;
    
    // Create download link and click it
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${book.titulo.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setIsDownloading(false);
    }, 1000);
  };
  
  const handleToggleFavorite = () => {
    if (book.id) {
      toggleFavorite(book.id);
    }
  };
  
  const coverUrl = book.capa_url || '/placeholder-book-cover.jpg';

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{book.titulo}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-48 h-64 overflow-hidden rounded-lg shadow-lg">
              <img 
                src={coverUrl} 
                alt={book.titulo}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-book-cover.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-2 left-2">
                {book.total_paginas && (
                  <Badge variant="secondary">{book.total_paginas} páginas</Badge>
                )}
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="col-span-1 md:col-span-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge>{book.categoria}</Badge>
              {book.autor && <Badge variant="outline">{book.autor}</Badge>}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Sinopse</h3>
            <p className="text-muted-foreground">
              {book.descricao || "Nenhuma descrição disponível para este livro."}
            </p>
          </motion.div>
        </div>
        
        <DialogFooter className="gap-2 flex-wrap">
          <Button 
            onClick={onRead}
            className="transition-all duration-300 hover:scale-105"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Ler Agora
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDownload}
            disabled={isDownloading}
            className="transition-all duration-300 hover:scale-105"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Baixando...' : 'Download'}
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleToggleFavorite}
            className={`transition-all duration-300 hover:scale-105 ${book.id && isFavorite(book.id) ? 'text-primary' : ''}`}
          >
            {book.id && isFavorite(book.id) ? (
              <>
                <BookmarkCheck className="mr-2 h-4 w-4" />
                Favoritado
              </>
            ) : (
              <>
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Favoritar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
