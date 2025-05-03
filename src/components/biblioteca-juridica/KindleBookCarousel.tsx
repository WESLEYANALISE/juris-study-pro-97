
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';

interface KindleBookCarouselProps {
  title: string;
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
  onViewAll?: () => void;
  label?: string;
}

export function KindleBookCarousel({
  title,
  books,
  onSelectBook,
  onViewAll,
  label
}: KindleBookCarouselProps) {
  const { getReadingProgress } = useBibliotecaProgresso();
  
  if (!books?.length) return null;
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="kindle-section-title font-bold text-xl">{title}</h2>
        {onViewAll && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewAll}
            className="kindle-see-all flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Ver tudo <ChevronRight className="h-4 w-4 ml-1" />
          </motion.button>
        )}
      </div>
      
      {label && (
        <p className="text-sm text-gray-400 mb-3">{label}</p>
      )}
      
      <div className="kindle-carousel grid grid-flow-col auto-cols-[calc(40%-0.75rem)] sm:auto-cols-[calc(30%-0.75rem)] md:auto-cols-[calc(25%-0.75rem)] lg:auto-cols-[calc(20%-0.75rem)] gap-3 overflow-x-auto pb-4 snap-x scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {books.map((book) => {
          const progress = getReadingProgress(book.id);
          const hasKindleUnlimited = Math.random() > 0.7; // Just for demo
          
          return (
            <motion.div 
              key={book.id}
              className="kindle-book-card snap-start shadow-lg hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
              onClick={() => onSelectBook(book)}
            >
              <div className="kindle-book-cover relative aspect-[2/3] rounded-md overflow-hidden">
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
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <span className="text-xs text-gray-400">Sem capa</span>
                  </div>
                )}
                
                {/* Title overlay on the cover with gradient for better readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-2">
                  <h3 className="text-white font-medium text-sm line-clamp-2">{book.titulo}</h3>
                </div>
                
                {/* Progress bar at bottom if there's reading progress */}
                {progress && progress.pagina_atual > 1 && book.total_paginas && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div 
                      className="h-full bg-amber-400" 
                      style={{ 
                        width: `${Math.min(
                          100, 
                          (progress.pagina_atual / book.total_paginas) * 100
                        )}%` 
                      }}
                    />
                  </div>
                )}
                
                {/* Kindle Unlimited badge for some books */}
                {hasKindleUnlimited && (
                  <div className="absolute top-0 right-0 bg-amber-400 text-black text-xs px-1.5 py-0.5 m-1 rounded-sm font-medium shadow-md">
                    <span>Unlimited</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
