
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BookMarked } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { Badge } from '@/components/ui/badge';

interface BibliotecaGridViewProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
  showBadge?: boolean;
}

export const BibliotecaGridView = ({
  books,
  onSelectBook,
  showBadge = false
}: BibliotecaGridViewProps) => {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();

  // Animação para o container grid
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Animação para cada item do grid
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {books.map((book) => {
        const progress = book.id ? getReadingProgress(book.id) : null;
        const progressPercentage = progress?.pagina_atual && book.total_paginas
          ? Math.round((progress.pagina_atual / book.total_paginas) * 100)
          : 0;
        
        const bookIsFavorite = book.id ? isFavorite(book.id) : false;

        return (
          <motion.div
            key={book.id}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="book-3d"
            onClick={() => onSelectBook(book)}
          >
            <div className="kindle-book-card group relative aspect-[2/3] overflow-hidden rounded-lg border bg-background shadow-md transition-all duration-300 hover:shadow-lg">
              {/* Cover Image */}
              <div className="book-3d-cover absolute inset-0 bg-gradient-to-b from-muted/80 to-muted">
                {book.capa_url ? (
                  <img
                    src={book.capa_url}
                    alt={book.titulo}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <BookOpen className="h-16 w-16 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              
              {/* Overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="font-medium text-sm text-white line-clamp-2 mb-1 text-shadow">
                  {book.titulo}
                </h3>
                {book.autor && (
                  <p className="text-xs text-white/80 line-clamp-1 text-shadow">
                    {book.autor}
                  </p>
                )}
              </div>
              
              {/* Badges */}
              <div className="absolute top-0 right-0 p-2 flex flex-col gap-1">
                {showBadge && (
                  <Badge variant="secondary" className="opacity-90">
                    Novo
                  </Badge>
                )}
                
                {bookIsFavorite && (
                  <Badge variant="outline" className="bg-primary/90 text-white">
                    <BookMarked className="h-3 w-3 mr-1" /> Favorito
                  </Badge>
                )}
              </div>
              
              {/* Progress bar */}
              {progressPercentage > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
