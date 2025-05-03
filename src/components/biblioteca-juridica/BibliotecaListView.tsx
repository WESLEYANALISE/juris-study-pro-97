
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BookMarked, Clock } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BibliotecaListViewProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
}

export const BibliotecaListView = ({
  books,
  onSelectBook
}: BibliotecaListViewProps) => {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="space-y-3"
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
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="border rounded-lg bg-card hover:bg-card/80 transition-colors overflow-hidden shadow-sm hover:shadow"
          >
            <div className="flex p-3 gap-4 items-center" onClick={() => onSelectBook(book)}>
              {/* Book Cover Thumbnail */}
              <div className="shrink-0 w-16 h-24 md:w-20 md:h-28 bg-muted rounded overflow-hidden">
                {book.capa_url ? (
                  <img
                    src={book.capa_url}
                    alt={book.titulo}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/50">
                    <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              
              {/* Book Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-base md:text-lg line-clamp-2">{book.titulo}</h3>
                  {bookIsFavorite && (
                    <BookMarked className="h-5 w-5 text-primary ml-2 shrink-0" />
                  )}
                </div>
                
                {book.autor && (
                  <p className="text-sm text-muted-foreground mt-1">{book.autor}</p>
                )}
                
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="text-xs">{book.categoria}</Badge>
                  
                  {book.total_paginas && (
                    <span className="flex items-center text-xs text-muted-foreground ml-2">
                      <Clock className="h-3 w-3 mr-1" /> {book.total_paginas} páginas
                    </span>
                  )}
                </div>
                
                {/* Progress bar */}
                {progressPercentage > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Progresso: {progressPercentage}%
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Button for larger screens */}
              <div className="hidden md:block">
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBook(book);
                  }}
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Ler
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
