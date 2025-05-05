
import React from 'react';
import { motion } from 'framer-motion';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { BibliotecaBookCard } from './BibliotecaBookCard';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface KindleBookCarouselProps {
  title: string;
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
  description?: string;
  showAll?: boolean;
  accent?: boolean;
}

export function KindleBookCarousel({
  title,
  description,
  books,
  onSelectBook,
  showAll = true,
  accent = false
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
          
          {showAll && books.length > 5 && (
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
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
      <div className="relative">
        <motion.div 
          className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {books.map((book, i) => (
            <motion.div 
              key={book.id || `book-${i}`}
              variants={itemVariants}
              className="w-36 md:w-40 lg:w-48 snap-start"
              style={{ contain: 'paint' }}
            >
              <BibliotecaBookCard 
                book={book} 
                onClick={onSelectBook} 
                showBadge={i < 3} 
                accent={accent} 
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
