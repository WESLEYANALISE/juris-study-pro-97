
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { BookOpen } from 'lucide-react';
import { JuridicalCard } from '@/components/ui/juridical-card';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';

interface BibliotecaGridViewProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
  showBadge?: boolean;
}

export function BibliotecaGridView({
  books,
  onSelectBook,
  showBadge = false
}: BibliotecaGridViewProps) {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {books.map((book) => {
        const progress = getReadingProgress(book.id);
        
        return (
          <div key={book.id} className="group">
            <JuridicalCard
              title={book.titulo}
              icon="book"
              variant={isFavorite(book.id) ? "primary" : "default"}
              className="cursor-pointer h-full overflow-hidden transition-all duration-300"
              onClick={() => onSelectBook(book)}
            >
              <div className="relative aspect-[2/3] w-full mb-2 overflow-hidden rounded bg-muted/30">
                {/* Book Cover */}
                {book.capa_url ? (
                  <img 
                    src={book.capa_url} 
                    alt={book.titulo}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Reading progress indicator */}
                {progress && progress.pagina_atual > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                    <div 
                      className="h-full bg-primary" 
                      style={{ 
                        width: `${Math.min(
                          100, 
                          book.total_paginas 
                            ? (progress.pagina_atual / book.total_paginas) * 100 
                            : 0
                        )}%` 
                      }}
                    />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  {showBadge && (
                    <Badge className="bg-primary">Recomendado</Badge>
                  )}
                  {isFavorite(book.id) && (
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                      Favorito
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="p-2">
                <h3 className="font-medium text-sm line-clamp-2">{book.titulo}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                  {book.categoria || "Categoria não definida"}
                </p>
                
                {/* Progress text */}
                {progress && progress.pagina_atual > 1 && (
                  <p className="text-xs text-primary mt-1">
                    {book.total_paginas 
                      ? `${progress.pagina_atual}/${book.total_paginas} páginas`
                      : `Página ${progress.pagina_atual}`}
                  </p>
                )}
              </div>
            </JuridicalCard>
          </div>
        );
      })}
    </div>
  );
}
