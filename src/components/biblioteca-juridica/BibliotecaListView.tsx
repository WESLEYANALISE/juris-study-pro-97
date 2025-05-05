
import React from 'react';
import { motion } from 'framer-motion';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { Badge } from '@/components/ui/badge';
import { Heart, BookOpen, Calendar } from 'lucide-react';
import { BookCover } from './BookCover';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BibliotecaListViewProps {
  livros: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
  isLoading: boolean;
}

export function BibliotecaListView({ livros, onSelectBook, isLoading }: BibliotecaListViewProps) {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex gap-4 p-4 bg-muted/10 rounded-lg">
            <div className="w-16 h-24 bg-muted rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </div>
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
    <div className="space-y-4">
      {livros.map((livro) => {
        const progresso = getReadingProgress(livro.id);
        const isFavorited = isFavorite(livro.id);
        
        // Format last read date if available
        const lastReadFormatted = progresso?.ultima_leitura 
          ? formatDistanceToNow(new Date(progresso.ultima_leitura), { 
              addSuffix: true, 
              locale: ptBR 
            })
          : null;

        return (
          <motion.div
            key={livro.id}
            className="flex gap-4 p-4 bg-card/30 rounded-lg hover:bg-card/50 cursor-pointer transition-colors"
            onClick={() => onSelectBook(livro)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Book Cover */}
            <div className="w-16 h-24 md:w-20 md:h-28 flex-shrink-0">
              <BookCover book={livro} className="w-full h-full" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium line-clamp-2">{livro.titulo}</h3>
                
                {isFavorited && (
                  <Heart className="h-4 w-4 text-red-500 flex-shrink-0 fill-current" />
                )}
              </div>
              
              {livro.autor && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">por {livro.autor}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                {livro.categoria && (
                  <Badge variant="outline" className="text-xs">
                    {livro.categoria}
                  </Badge>
                )}
                
                {livro.total_paginas && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {livro.total_paginas} páginas
                  </div>
                )}
                
                {lastReadFormatted && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {lastReadFormatted}
                  </div>
                )}
              </div>
              
              {/* Reading Progress */}
              {progresso && progresso.pagina_atual > 1 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ 
                        width: `${Math.min(Math.floor((progresso.pagina_atual / (livro.total_paginas || 100)) * 100), 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Página {progresso.pagina_atual} de {livro.total_paginas || '?'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default BibliotecaListView;
