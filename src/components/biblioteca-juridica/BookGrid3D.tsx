
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Book, Bookmark, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AtheneumCard, AtheneumButton } from '@/components/ui/atheneum-theme';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BookGrid3DProps {
  title: string;
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
}

export function BookGrid3D({ title, books, onSelectBook }: BookGrid3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();

  // Calculate visible books based on the active index
  const visibleBooks = books.slice(activeIndex, activeIndex + 5);
  
  // Navigation handlers
  const handlePrevious = () => {
    setActiveIndex(Math.max(0, activeIndex - 5));
  };
  
  const handleNext = () => {
    setActiveIndex(Math.min(books.length - 5, activeIndex + 5));
  };

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
          {title}
        </h2>
        
        {books.length > 5 && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevious} 
              disabled={activeIndex === 0}
              className="border-amber-700/50 hover:bg-amber-950/30"
            >
              <ChevronLeft className="h-4 w-4 text-amber-400" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {activeIndex + 1}-{Math.min(activeIndex + 5, books.length)} de {books.length}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNext} 
              disabled={activeIndex >= books.length - 5}
              className="border-amber-700/50 hover:bg-amber-950/30"
            >
              <ChevronRight className="h-4 w-4 text-amber-400" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="relative perspective-1000">
        <div className="flex space-x-6 p-4">
          <AnimatePresence initial={false} mode="popLayout">
            {visibleBooks.map((book, index) => {
              const isHovered = hoveredIndex === index;
              const progress = getReadingProgress(book.id);
              const isFav = isFavorite(book.id);
              const progressPercentage = book.total_paginas && progress?.pagina_atual 
                ? (progress.pagina_atual / book.total_paginas) * 100 
                : 0;
                
              return (
                <motion.div
                  key={book.id}
                  className="flex-shrink-0 w-48 relative"
                  initial={{ opacity: 0, rotateY: -30, z: -100 }}
                  animate={{ 
                    opacity: 1, 
                    rotateY: isHovered ? 0 : -15,
                    z: isHovered ? 50 : 0,
                    scale: isHovered ? 1.1 : 1,
                    transition: { duration: 0.5 }
                  }}
                  exit={{ opacity: 0, rotateY: 30, z: -100 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onSelectBook(book)}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="relative h-64 rounded-lg overflow-hidden shadow-xl transform-style-3d cursor-pointer">
                    {/* Book cover */}
                    {book.capa_url ? (
                      <div className="absolute inset-0">
                        <img 
                          src={book.capa_url} 
                          alt={book.titulo}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                          }}
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
                        <Book className="h-16 w-16 text-purple-300/50" />
                      </div>
                    )}
                    
                    {/* Book spine effect */}
                    <div className="absolute left-0 top-0 w-4 h-full bg-gradient-to-r from-black/60 to-transparent" />
                    
                    {/* Book information */}
                    <div className="absolute inset-x-0 bottom-0 p-3 z-10 transform-style-3d">
                      <h3 className="font-bold text-white line-clamp-2 text-shadow">
                        {book.titulo}
                      </h3>
                      <p className="text-xs text-white/70 mt-1 line-clamp-1">
                        {book.categoria}
                      </p>
                    </div>
                    
                    {/* Reading progress */}
                    {progressPercentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-900/30">
                        <div className="h-full bg-amber-500" style={{ width: `${progressPercentage}%` }} />
                      </div>
                    )}
                    
                    {/* Favorite icon */}
                    {isFav && (
                      <div className="absolute top-2 right-2">
                        <Bookmark className="h-5 w-5 text-amber-400 drop-shadow-md" fill="currentColor" />
                      </div>
                    )}
                    
                    {/* Interactive overlay for hovered state */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/90 to-transparent"
                        >
                          <AtheneumButton
                            variant="default"
                            className="w-full mt-2 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectBook(book);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" /> Ler Agora
                          </AtheneumButton>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
