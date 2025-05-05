
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, BookOpen, ChevronRight } from 'lucide-react';
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

export function KindleBookCarousel({
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
            accent ? "text-primary" : ""
          )}>
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {showAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-primary" 
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
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <CarouselItem className="pl-4 basis-full xs:basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
      <motion.div 
        className="book-card h-full cursor-pointer perspective-1000"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        onClick={() => onSelect(book)}
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted/30 border shadow-md">
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-background p-4">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-2 text-primary/30" />
                <h3 className="font-medium text-sm line-clamp-3">{book.titulo}</h3>
              </div>
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
          
          {/* Book info overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="font-semibold text-white text-sm line-clamp-2">{book.titulo}</h3>
            {book.categoria && (
              <span className="text-xs text-white/80 mb-1">{book.categoria}</span>
            )}
            
            {progress && progress.pagina_atual > 1 && (
              <p className="text-xs text-primary mt-1">
                {book.total_paginas 
                  ? `${progress.pagina_atual} de ${book.total_paginas} páginas`
                  : `Página ${progress.pagina_atual}`}
              </p>
            )}
            
            <Button 
              size="sm" 
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(book);
              }}
            >
              Ler agora
            </Button>
          </motion.div>
          
          {/* Badges */}
          {isFavorited && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                Favorito
              </Badge>
            </div>
          )}
        </div>
      </motion.div>
    </CarouselItem>
  );
}
