
import React, { useState } from 'react';
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, Volume2, BookmarkPlus } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useToast } from '@/hooks/use-toast';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';

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
  const { isFavorite, toggleFavorite } = useBibliotecaProgresso();
  
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
  
  // Handle book cover
  const coverUrl = book.capa_url || '/placeholder-book-cover.png';

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/3 flex justify-center">
            <div className="relative aspect-[2/3] w-44 rounded-lg overflow-hidden shadow-lg">
              <img
                src={coverUrl}
                alt={book.titulo}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
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
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Sobre este livro</h3>
              <p className="text-muted-foreground">
                {book.descricao || "Sem descrição disponível para este livro."}
              </p>
            </div>
          </div>
        </div>
      </DialogHeader>
      
      <DialogFooter className="sm:justify-between gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Button variant="default" onClick={onReadBook}>
            <BookOpen className="mr-2 h-4 w-4" /> Ler Agora
          </Button>
          
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            onClick={handleToggleFavorite}
            className={isFav ? "text-primary" : ""}
          >
            <BookmarkPlus className="mr-2 h-4 w-4" />
            {isFav ? "Favoritado" : "Favoritar"}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
