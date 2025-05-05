
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, Bookmark } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface KindleBookCarouselProps {
  title: string;
  description?: string;
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
  accent?: boolean;
  showAll?: boolean;
}

export const KindleBookCarousel: React.FC<KindleBookCarouselProps> = ({
  title,
  description,
  books,
  onSelectBook,
  accent = false,
  showAll = true,
}) => {
  const navigate = useNavigate();
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100
      }
    }
  };
  
  if (!books.length) return null;
  
  return (
    <motion.div
      className={`p-6 rounded-lg ${accent ? 'bg-muted/50' : ''}`}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        {showAll && books.length > 6 && (
          <Button 
            variant="outline" 
            onClick={() => navigate(`/vermais/biblioteca?categoria=${title}`)}
            className="hidden sm:flex"
          >
            Ver todos <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="relative">
        <div className="flex space-x-6 overflow-x-auto pb-4 px-1 -mx-1 scrollbar-thin">
          {books.map((book) => {
            const progress = book.id ? getReadingProgress(book.id) : null;
            const progressPercentage = progress?.pagina_atual && book.total_paginas
              ? Math.round((progress.pagina_atual / book.total_paginas) * 100)
              : 0;
            
            return (
              <motion.div 
                key={book.id}
                className="flex-shrink-0 w-32 sm:w-36 md:w-40"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => onSelectBook(book)}
              >
                <div className="cursor-pointer">
                  <div className="aspect-[2/3] relative rounded-md overflow-hidden bg-muted">
                    {book.capa_url ? (
                      <img
                        src={book.capa_url}
                        alt={book.titulo}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {/* Favorite indicator */}
                    {book.id && isFavorite(book.id) && (
                      <div className="absolute top-2 right-2">
                        <Bookmark className="h-4 w-4 fill-primary text-primary" />
                      </div>
                    )}
                    
                    {/* Progress indicator */}
                    {progressPercentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <h4 className="font-medium line-clamp-2 text-sm">{book.titulo}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{book.categoria}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {showAll && books.length > 4 && (
        <Button 
          variant="outline" 
          onClick={() => navigate(`/vermais/biblioteca?categoria=${title}`)}
          className="w-full sm:hidden mt-4"
        >
          Ver todos <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
};
