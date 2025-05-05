
import React, { useState, useRef, useEffect } from 'react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { BibliotecaBookModal } from './BibliotecaBookModal';
import { useInView } from 'react-intersection-observer';

interface KindleBookCarouselProps {
  title: string;
  description?: string;
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
  showAll?: boolean;
  accent?: boolean;
}

export function KindleBookCarousel({
  title,
  description,
  books,
  onSelectBook,
  showAll = true,
  accent = false,
}: KindleBookCarouselProps) {
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [visibleBooks, setVisibleBooks] = useState<number>(6);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  // Calculate visible books based on screen width
  useEffect(() => {
    const updateVisibleBooks = () => {
      if (window.innerWidth < 640) {
        setVisibleBooks(2);
      } else if (window.innerWidth < 768) {
        setVisibleBooks(3);
      } else if (window.innerWidth < 1024) {
        setVisibleBooks(4);
      } else {
        setVisibleBooks(6);
      }
    };

    updateVisibleBooks();
    window.addEventListener('resize', updateVisibleBooks);
    
    return () => {
      window.removeEventListener('resize', updateVisibleBooks);
    };
  }, []);
  
  // Scroll functions for carousel
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };
  
  // Book selection handler
  const handleBookClick = (book: LivroJuridico) => {
    setSelectedBook(book);
    setModalOpen(true);
  };
  
  // Book reading handler from modal
  const handleReadBook = () => {
    if (selectedBook) {
      setModalOpen(false);
      onSelectBook(selectedBook);
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`pb-8 pt-4 ${accent ? 'bg-gradient-to-r from-purple-900/10 via-primary/5 to-purple-900/10 rounded-xl p-6' : ''}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h2 
            className="text-2xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {title}
          </motion.h2>
          {description && (
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {description}
            </motion.p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={scrollRight}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div 
        ref={carouselRef}
        className="kindle-carousel flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory"
      >
        <AnimatePresence>
          {books.slice(0, showAll ? books.length : visibleBooks).map((book, index) => {
            const progress = book.id ? getReadingProgress(book.id) : null;
            const percentComplete = progress && book.total_paginas 
              ? (progress.pagina_atual / book.total_paginas) * 100 
              : 0;
            const isFavorited = book.id ? isFavorite(book.id) : false;
            const coverUrl = book.capa_url || '/placeholder-book-cover.jpg';
            
            return (
              <motion.div
                key={book.id}
                className="kindle-book-card flex-shrink-0 snap-start w-[210px] h-[310px]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -8, scale: 1.03 }}
                onClick={() => handleBookClick(book)}
              >
                <div className="relative w-full h-full flex flex-col rounded-lg overflow-hidden bg-card border shadow-lg hover:shadow-xl transition-all duration-300 perspective-1000">
                  {/* Book Cover */}
                  <div className="relative flex-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                    <img
                      src={coverUrl}
                      alt={book.titulo}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-book-cover.jpg';
                      }}
                    />
                    
                    {/* Favorite Badge */}
                    {isFavorited && (
                      <div className="absolute top-2 right-2 z-20">
                        <Bookmark className="h-5 w-5 text-primary fill-primary" />
                      </div>
                    )}
                    
                    {/* Reading Progress */}
                    {percentComplete > 0 && (
                      <div className="absolute bottom-2 left-2 right-2 z-20">
                        <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(percentComplete, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Book Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    <h3 className="text-sm font-medium text-white line-clamp-2">{book.titulo}</h3>
                    
                    <div className="flex items-center justify-between mt-1">
                      <Badge 
                        variant="outline" 
                        className="bg-black/40 text-xs text-white border-white/20"
                      >
                        {book.categoria}
                      </Badge>
                      
                      {book.autor && (
                        <span className="text-xs text-white/70">{book.autor}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover overlay with read button */}
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 z-20">
                    <Button 
                      variant="outline"
                      className="bg-transparent border-white text-white hover:bg-white/20"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Book Details Modal */}
      <BibliotecaBookModal 
        book={selectedBook}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRead={handleReadBook}
      />
    </motion.section>
  );
}
