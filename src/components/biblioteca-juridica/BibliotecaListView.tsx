
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, BookText, Bookmark } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';

interface BibliotecaListViewProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
}

export function BibliotecaListView({
  books,
  onSelectBook
}: BibliotecaListViewProps) {
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
    <div className="space-y-4">
      {books.map(book => {
        const progress = getReadingProgress(book.id);
        const favorite = isFavorite(book.id);
        
        return (
          <Card 
            key={book.id} 
            className="p-4 hover:bg-accent/5 transition-colors cursor-pointer"
            onClick={() => onSelectBook(book)}
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-24 w-16 relative">
                {book.capa_url ? (
                  <img 
                    src={book.capa_url} 
                    alt={book.titulo}
                    className="h-full w-full object-cover rounded" 
                  />
                ) : (
                  <div className="h-full w-full bg-muted rounded flex items-center justify-center">
                    <BookText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {favorite && (
                  <div className="absolute -top-2 -right-2 bg-primary/80 text-white p-1 rounded-full">
                    <Bookmark className="h-3 w-3" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{book.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{book.autor}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="ml-2 whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBook(book);
                    }}
                  >
                    Ler agora
                  </Button>
                </div>
                
                <p className="mt-2 text-sm line-clamp-2">{book.descricao || "Sem descrição disponível."}</p>
                
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <span>{book.categoria}</span>
                  {book.total_paginas && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{book.total_paginas} páginas</span>
                    </>
                  )}
                  {progress && progress.pagina_atual > 1 && (
                    <>
                      <span className="mx-2">•</span>
                      <span>
                        Página {progress.pagina_atual} de {book.total_paginas || "?"}
                      </span>
                    </>
                  )}
                </div>
                
                {progress && progress.pagina_atual > 1 && book.total_paginas && (
                  <div className="mt-2 h-1 bg-primary/20 rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ 
                        width: `${(progress.pagina_atual / book.total_paginas) * 100}%` 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
