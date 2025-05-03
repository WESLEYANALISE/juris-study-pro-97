
import React from 'react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { motion } from 'framer-motion';
import { BookOpen, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BibliotecaListViewProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
}

export function BibliotecaListView({ books, onSelectBook }: BibliotecaListViewProps) {
  const { getReadingProgress } = useBibliotecaProgresso();
  
  return (
    <div className="space-y-3">
      {books.map((book) => {
        const progress = getReadingProgress(book.id);
        const progressPercentage = progress && book.total_paginas 
          ? Math.min(100, (progress.pagina_atual / book.total_paginas) * 100)
          : 0;
          
        return (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="book-list-item border bg-card p-3 flex items-center gap-3 shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Book cover */}
            <div className="relative h-20 w-14 shrink-0">
              {book.capa_url ? (
                <img
                  src={book.capa_url}
                  alt={book.titulo}
                  className="h-full w-full object-cover rounded shadow-sm"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                  }}
                />
              ) : (
                <div className="h-full w-full bg-gray-800 rounded flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              {progressPercentage > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                  <div 
                    className="h-full bg-amber-400" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}
            </div>
            
            {/* Book details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base truncate">{book.titulo}</h3>
              
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                {book.autor && (
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {book.autor}
                  </span>
                )}
                
                {book.total_paginas && (
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {book.total_paginas} págs
                  </span>
                )}
              </div>
              
              {book.descricao && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                  {book.descricao}
                </p>
              )}
            </div>
            
            {/* Action button */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "shrink-0",
                progressPercentage > 0 && "border-amber-400 text-amber-600 hover:bg-amber-50"
              )}
              onClick={() => onSelectBook(book)}
            >
              {progressPercentage > 0 ? 'Continuar' : 'Ler'}
            </Button>
          </motion.div>
        );
      })}
      
      {books.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Nenhum livro encontrado</p>
        </div>
      )}
    </div>
  );
}
