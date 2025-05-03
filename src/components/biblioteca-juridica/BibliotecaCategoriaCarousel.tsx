
import React from 'react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { cn } from '@/lib/utils';

interface BibliotecaCategoriaCarouselProps {
  title: string;
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
}

export function BibliotecaCategoriaCarousel({
  title,
  books,
  onSelectBook
}: BibliotecaCategoriaCarouselProps) {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();
  
  if (!books.length) return null;
  
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
          Ver todos ({books.length})
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: books.length > 5,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {books.map((book) => {
            const progress = getReadingProgress(book.id);
            const isFavorited = isFavorite(book.id);
            
            return (
              <CarouselItem key={book.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <div className="h-full">
                  <Card
                    className={cn(
                      "cursor-pointer overflow-hidden transition-all hover:shadow-lg h-full",
                      isFavorited && "border-primary/30"
                    )}
                    onClick={() => onSelectBook(book)}
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted/30">
                      {book.capa_url ? (
                        <img 
                          src={book.capa_url} 
                          alt={book.titulo}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
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
                      <div className="absolute top-2 right-2">
                        {isFavorited && (
                          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                            Favorito
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1">{book.titulo}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {book.categoria}
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
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2" />
        </div>
      </Carousel>
    </div>
  );
}
