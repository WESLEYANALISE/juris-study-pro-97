
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { Button } from '@/components/ui/button';
import { BibliotecaBookCard } from './BibliotecaBookCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface KindleBookCarouselProps {
  title: string;
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
  description?: string;
  showAll?: boolean;
  accent?: boolean;
  onShowAll?: () => void;
}

export function KindleBookCarousel({
  title,
  description,
  books,
  onSelectBook,
  showAll = true,
  accent = false,
  onShowAll
}: KindleBookCarouselProps) {
  // Early return if no books
  if (!books.length) return null;
  
  // Animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0
    }
  };

  return (
    <div className="mb-12">
      {/* Header */}
      <div className={`flex flex-col mb-4 ${accent ? "bg-primary/5 p-4 rounded-lg" : ""}`}>
        <div className="flex justify-between items-center">
          <motion.h2 
            className="text-2xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h2>
          
          {showAll && books.length > 5 && onShowAll && (
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={onShowAll}>
              Ver todos ({books.length})
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {description && (
          <motion.p 
            className="text-sm text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {description}
          </motion.p>
        )}
      </div>
      
      {/* Carousel */}
      <Carousel
        opts={{
          align: "start",
          loop: books.length > 5,
        }}
        className="w-full"
      >
        <CarouselContent>
          {books.map((book, i) => (
            <CarouselItem 
              key={book.id || `book-${i}`} 
              className="basis-1/2 xs:basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 pl-4"
            >
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="show"
                className="w-full"
                style={{ contain: 'paint' }}
              >
                <BibliotecaBookCard 
                  book={book} 
                  onClick={onSelectBook} 
                  showBadge={i < 3} 
                  accent={accent} 
                />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
}
