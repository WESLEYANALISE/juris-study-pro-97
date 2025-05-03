
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
        <h2 className="kindle-section-title">{title}</h2>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="kindle-see-all"
          >
            Ver tudo <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>
      
      {label && (
        <p className="text-sm text-gray-400 mb-3">{label}</p>
      )}
      
      <div className="kindle-carousel">
        {books.map((book) => {
          const progress = getReadingProgress(book.id);
          const hasKindleUnlimited = Math.random() > 0.7; // Just for demo
          
          return (
            <div 
              key={book.id}
              className="kindle-book-card"
              onClick={() => onSelectBook(book)}
            >
              <div className="kindle-book-cover">
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
                  <div className="kindle-unlimited-badge">
                    <span>Kindle Unlimited</span>
                  </div>
                )}
              </div>
              
              <h3 className="kindle-book-title">{book.titulo}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}
