
import React from 'react';
import { motion } from 'framer-motion';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { BookCover } from './BookCover';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';

interface BibliotecaGridViewProps {
  livros: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
  isLoading: boolean;
}

export function BibliotecaGridView({ livros, onSelectBook, isLoading }: BibliotecaGridViewProps) {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] bg-muted rounded-md"></div>
            <div className="h-4 bg-muted rounded mt-2 w-3/4"></div>
            <div className="h-3 bg-muted rounded mt-1 w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (livros.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum livro encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {livros.map((livro) => {
        const progresso = getReadingProgress(livro.id);
        const isFavorited = isFavorite(livro.id);

        return (
          <motion.div
            key={livro.id}
            className="cursor-pointer group relative"
            onClick={() => onSelectBook(livro)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Book Cover */}
            <BookCover book={livro} className="aspect-[2/3] shadow-md group-hover:shadow-lg transition-shadow" />
            
            {/* Favorite Icon */}
            {isFavorited && (
              <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                <Heart className="h-3 w-3 fill-white text-white" />
              </div>
            )}
            
            {/* Progress Badge */}
            {progresso && progresso.pagina_atual > 1 && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  {Math.min(Math.floor((progresso.pagina_atual / (livro.total_paginas || 100)) * 100), 100)}%
                </Badge>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default BibliotecaGridView;
