
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Bookmark } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
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
  const { isFavorite, getReadingProgress } = useBibliotecaProgresso();

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Nenhum livro encontrado</h3>
        <p className="mt-2 text-muted-foreground">
          Tente ajustar seus filtros ou termos de busca
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {books.map(book => {
        const progress = getReadingProgress(book.id);
        const favorite = isFavorite(book.id);
        
        return (
          <Card 
            key={book.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => onSelectBook(book)}
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              {book.capa_url ? (
                <img 
                  src={book.capa_url} 
                  alt={book.titulo}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 opacity-30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 w-full">
                  <h3 className="font-semibold text-white line-clamp-2">{book.titulo}</h3>
                  <p className="text-xs text-white/80 mt-1">
                    {book.autor}
                    {book.total_paginas ? ` • ${book.total_paginas} páginas` : ''}
                  </p>
                </div>
              </div>
              
              {/* Reading progress indicator */}
              {progress && progress.pagina_atual > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
                  <div 
                    className="h-full bg-primary" 
                    style={{ 
                      width: `${(progress.pagina_atual / (book.total_paginas || 100)) * 100}%` 
                    }}
                  />
                </div>
              )}
              
              {/* Favorite icon */}
              {favorite && (
                <div className="absolute top-2 right-2 bg-primary/80 text-white p-1 rounded-full">
                  <Bookmark className="h-4 w-4" />
                </div>
              )}
              
              {/* Recommendation badge */}
              {showBadge && (
                <Badge className="absolute top-2 left-2">
                  Recomendado
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {book.descricao || "Sem descrição disponível."}
                </p>
                <Button variant="secondary" className="w-full" size="sm">
                  Ler agora
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
