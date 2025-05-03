
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';

interface BibliotecaListViewProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
}

export function BibliotecaListView({
  books,
  onSelectBook
}: BibliotecaListViewProps) {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();
  
  return (
    <div className="space-y-4">
      {books.map((book) => {
        const progress = getReadingProgress(book.id);
        const isBookmarked = isFavorite(book.id);
        
        return (
          <Card 
            key={book.id} 
            className={`overflow-hidden transition-shadow hover:shadow-md ${isBookmarked ? 'border-primary/30' : ''}`}
            onClick={() => onSelectBook(book)}
          >
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Book Cover */}
                <div className="w-full sm:w-32 h-40 relative bg-muted/30">
                  {book.capa_url ? (
                    <img 
                      src={book.capa_url} 
                      alt={book.titulo}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  {/* Progress indicator */}
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
                </div>
                
                {/* Book Info */}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-medium">{book.titulo}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {book.categoria && (
                        <Badge variant="outline">{book.categoria}</Badge>
                      )}
                      {isBookmarked && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">Favoritado</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {book.descricao || "Sem descrição disponível."}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    {progress && progress.pagina_atual > 1 && (
                      <p className="text-xs text-primary">
                        {book.total_paginas 
                          ? `${progress.pagina_atual}/${book.total_paginas} páginas`
                          : `Página ${progress.pagina_atual}`}
                      </p>
                    )}
                    
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Ver detalhes <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
