
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { BibliotecaBookModal } from './BibliotecaBookModal';
import { cn } from '@/lib/utils';

interface KindleBookCarouselProps {
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
}: KindleBookCarouselProps) {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Process book cover URL to ensure it's a full URL
  const processBookCoverUrl = (url: string | null): string => {
    if (!url) return '/placeholder-book-cover.png';
    
    // Already a full URL
    if (url.startsWith('http')) {
      return url;
    }
    
    // Add the Supabase storage URL prefix if it's just a path
    const storageBaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co";
    return `${storageBaseUrl}/storage/v1/object/public/agoravai/${url}`;
  };
  
  const handleSelectBook = (book: LivroJuridico) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };
  
  const handleReadBook = () => {
    if (selectedBook) {
      onSelectBook(selectedBook);
      setIsModalOpen(false);
    }
  };
  
  // Function to navigate carousel
  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById(`kindle-carousel-${title.replace(/\s+/g, '-')}`);
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  if (!books?.length) return null;
  
  return (
    <div className="mb-10 relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className={cn(
            "text-2xl font-bold",
            accent ? "text-amber-400" : ""
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
            className="gap-1" 
            onClick={onShowAll}
          >
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full shadow-md"
          onClick={() => scrollContainer('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full shadow-md"
          onClick={() => scrollContainer('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Book carousel */}
      <div 
        id={`kindle-carousel-${title.replace(/\s+/g, '-')}`}
        className="kindle-carousel flex space-x-4 overflow-x-auto pb-4 no-scrollbar"
      >
        {books.map((book) => {
          const progress = getReadingProgress(book.id);
          const progressPercentage = progress?.pagina_atual && book.total_paginas
            ? Math.round((progress.pagina_atual / book.total_paginas) * 100)
            : 0;
          
          const coverUrl = processBookCoverUrl(book.capa_url);
          const isFavorited = isFavorite(book.id);
          
          return (
            <motion.div
              key={book.id}
              className="kindle-book-card flex-shrink-0 w-[160px] max-h-[300px] group"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => handleSelectBook(book)}
            >
              <div className="relative h-full rounded-md overflow-hidden flex flex-col">
                {/* Book cover */}
                <div className="aspect-[2/3] relative bg-muted rounded-md overflow-hidden">
                  <img
                    src={coverUrl}
                    alt={book.titulo}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <h3 className="text-sm font-medium text-white line-clamp-2">
                      {book.titulo}
                    </h3>
                    {book.autor && (
                      <p className="text-xs text-white/80 mt-1 line-clamp-1">
                        {book.autor}
                      </p>
                    )}
                  </div>
                  
                  {/* Badges */}
                  {isFavorited && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-primary/90 text-white">
                        <BookOpen className="h-3 w-3 mr-1" /> Favorito
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Progress bar */}
                {progressPercentage > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Book details modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <BibliotecaBookModal 
          book={selectedBook} 
          onClose={() => setIsModalOpen(false)} 
          onReadBook={handleReadBook}
        />
      </Dialog>
    </div>
  );
}
