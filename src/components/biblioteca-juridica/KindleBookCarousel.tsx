import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { cn } from '@/lib/utils';

interface BibliotecaBookCarouselProps {
  title: string;
  description?: string;
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
  accent?: boolean;
  showAll?: boolean;
  onShowAll?: () => void;
}

export function BibliotecaBookCarousel({
  title,
  description,
  books,
  onSelectBook,
  accent = false,
  showAll = true,
  onShowAll
}: BibliotecaBookCarouselProps) {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();
  
  if (!books?.length) return null;
  
  return (
    <div className="mb-10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className={cn(
            "text-2xl font-bold",
            accent ? "text-amber-400" : ""
          )}>
            {title.toUpperCase()}
          </h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {showAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-amber-400" 
            onClick={onShowAll}
          >
            VER TODOS
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: books.length > 4,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {books.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                onSelect={onSelectBook}
                progress={getReadingProgress(book.id)}
                isFavorited={isFavorite(book.id)}
              />
            ))}
          </CarouselContent>
          
          <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 shadow-md" />
          <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 shadow-md" />
        </Carousel>
      </div>
    </div>
  );
}

interface BookCardProps {
  book: LivroJuridico;
  onSelect: (book: LivroJuridico) => void;
  progress?: {
    pagina_atual: number;
    ultima_leitura: string | Date;
    favorito: boolean;
  } | null;
  isFavorited?: boolean;
}

function BookCard({ book, onSelect, progress, isFavorited }: BookCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <CarouselItem className="pl-4 basis-full xs:basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
      <motion.div 
        className="book-card h-full cursor-pointer perspective-1000"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div 
          className="book-card-inner relative w-full h-full transition-transform duration-500"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          style={{ transformStyle: "preserve-3d" }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front - Cover */}
          <div 
            className="book-front absolute w-full h-full backface-hidden"
            style={{ 
              backfaceVisibility: "hidden",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
            }}
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted/30">
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
                  <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              
              {/* Progress indicator */}
              {progress && progress.pagina_atual > 1 && book.total_paginas && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                  <div 
                    className="h-full bg-primary" 
                    style={{ 
                      width: `${Math.min(
                        100, 
                        (progress.pagina_atual / book.total_paginas) * 100
                      )}%` 
                    }}
                  />
                </div>
              )}
              
              {/* Badges */}
              {isFavorited && (
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                    Favorito
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-1">{book.titulo}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {book.categoria || "Sem categoria"}
              </p>
            </div>
          </div>
          
          {/* Back - Details */}
          <div 
            className="book-back absolute w-full h-full backface-hidden bg-background border rounded-lg p-4"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
            }}
          >
            <h3 className="font-bold mb-2">{book.titulo}</h3>
            {book.categoria && (
              <Badge className="mb-2">{book.categoria}</Badge>
            )}
            
            <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
              {book.descricao || "Sem descrição disponível."}
            </p>
            
            {book.total_paginas && (
              <p className="text-xs">
                <Book className="inline-block mr-1 h-3 w-3" />
                {book.total_paginas} páginas
              </p>
            )}
            
            {progress && progress.pagina_atual > 1 && (
              <p className="text-xs text-primary mt-1">
                Leitura: Página {progress.pagina_atual}
                {book.total_paginas ? ` de ${book.total_paginas}` : ''}
              </p>
            )}
            
            <Button 
              size="sm" 
              className="mt-4 w-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(book);
              }}
            >
              Abrir livro
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </CarouselItem>
  );
}
