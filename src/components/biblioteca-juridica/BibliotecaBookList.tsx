
import React from 'react';
import { motion } from 'framer-motion';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { Book, BookOpen, Clock, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { cn } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';

interface BibliotecaBookListProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
}

export function BibliotecaBookList({ books, onSelectBook }: BibliotecaBookListProps) {
  const { getReadingProgress, isFavorite, toggleFavorite } = useBibliotecaProgresso();
  const itemsPerPage = 15;
  const [visibleItems, setVisibleItems] = React.useState(itemsPerPage);
  const { ref, inView } = useInView();
  
  React.useEffect(() => {
    if (inView) {
      setVisibleItems(prevVisible => 
        Math.min(prevVisible + itemsPerPage, books.length)
      );
    }
  }, [inView, books.length]);
  
  // Process URL to get full path for book covers
  const processUrl = (url: string | null): string => {
    if (!url) return '/placeholder-book-cover.png';
    
    if (url.startsWith('http')) {
      return url;
    }
    
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co";
    return `${baseUrl}/storage/v1/object/public/agoravai/${url}`;
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-muted/30 py-3 px-4 rounded-lg grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground hidden md:grid">
        <div className="col-span-6">Título</div>
        <div className="col-span-2">Categoria</div>
        <div className="col-span-2">Páginas</div>
        <div className="col-span-2">Ações</div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2"
      >
        {books.slice(0, visibleItems).map((book, i) => {
          const progress = getReadingProgress(book.id);
          const bookIsFavorite = isFavorite(book.id);
          
          const progressPercentage = progress?.pagina_atual && book.total_paginas
            ? Math.round((progress.pagina_atual / book.total_paginas) * 100) 
            : 0;
          
          return (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "border bg-card hover:bg-accent/5 rounded-lg p-3 md:px-4 md:py-3 transition-colors",
                "grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-2 items-center",
                "cursor-pointer"
              )}
              onClick={() => onSelectBook(book)}
            >
              {/* Mobile layout */}
              <div className="flex items-center gap-4 md:hidden">
                <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                  {book.capa_url ? (
                    <img
                      src={processUrl(book.capa_url)}
                      alt={book.titulo}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Book className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm line-clamp-1">{book.titulo}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {book.categoria || "Geral"} • {book.total_paginas || "?"} págs
                  </p>
                  
                  {progressPercentage > 0 && (
                    <div className="w-full h-1 bg-muted mt-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Desktop layout */}
              <div className="hidden md:flex md:col-span-6 items-center gap-3">
                <div className="w-10 h-14 bg-muted rounded overflow-hidden flex-shrink-0">
                  {book.capa_url ? (
                    <img
                      src={processUrl(book.capa_url)}
                      alt={book.titulo}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Book className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                
                <div className="min-w-0">
                  <h3 className="font-medium text-sm line-clamp-1">{book.titulo}</h3>
                  
                  {progressPercentage > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span>{progressPercentage}% concluído</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="hidden md:block md:col-span-2 text-sm">
                {book.categoria || "Geral"}
              </div>
              
              <div className="hidden md:block md:col-span-2 text-sm">
                {book.total_paginas || "—"} páginas
              </div>
              
              <div className="hidden md:flex md:col-span-2 justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title={bookIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(book.id);
                  }}
                >
                  <Bookmark className={cn(
                    "h-4 w-4",
                    bookIsFavorite ? "fill-primary text-primary" : "text-muted-foreground"
                  )} />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Ler
                </Button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {visibleItems < books.length && (
        <div ref={ref} className="h-12 flex items-center justify-center">
          <div className="loading-spinner h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
