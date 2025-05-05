
import React, { useState } from 'react';
import { BookOpen, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { cn } from '@/lib/utils';

interface BibliotecaBookCardProps {
  book: LivroJuridico;
  onClick: (book: LivroJuridico) => void;
  showBadge?: boolean;
  accent?: boolean;
}

export function BibliotecaBookCard({ book, onClick, showBadge = false, accent = false }: BibliotecaBookCardProps) {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const progress = book.id ? getReadingProgress(book.id) : null;
  const bookIsFavorite = book.id ? isFavorite(book.id) : false;
  
  const progressPercentage = progress?.pagina_atual && book.total_paginas
    ? Math.round((progress.pagina_atual / book.total_paginas) * 100) 
    : 0;
    
  // Process cover URL to ensure it's valid
  const getCoverUrl = () => {
    if (!book.capa_url) return '/placeholder-book-cover.png';
    
    if (book.capa_url.startsWith('http')) {
      return book.capa_url;
    }
    
    return `${import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co"}/storage/v1/object/public/agoravai/${book.capa_url}`;
  };

  return (
    <motion.div
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 } 
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(book)}
      className={cn(
        "book-card group relative cursor-pointer",
        "aspect-[2/3] overflow-hidden rounded-lg border",
        "shadow-lg transition-all duration-300",
        accent ? "border-primary/30" : "border-border"
      )}
      style={{ 
        perspective: '1000px',
        willChange: 'transform'
      }}
    >
      {/* Cover image with 3D effect */}
      <div className="book-card-inner h-full w-full absolute inset-0 transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-b from-card/80 to-card">
          <div className="h-full w-full overflow-hidden">
            {/* Image loading skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/20" />
              </div>
            )}
            
            {/* Error placeholder */}
            {imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50">
                <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground mt-2">Capa não disponível</p>
              </div>
            )}
            
            <img
              src={getCoverUrl()}
              alt={book.titulo}
              className={cn(
                "h-full w-full object-cover transition-all duration-300 group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error("Error loading book cover:", book.id, book.capa_url);
                setImageError(true);
                setImageLoaded(false);
              }}
              loading="lazy"
            />
          </div>
        </div>
      </div>
      
      {/* Book info overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <h3 className="font-medium text-sm text-white line-clamp-2 mb-1">
          {book.titulo}
        </h3>
        {book.autor && (
          <p className="text-xs text-white/80 line-clamp-1">
            {book.autor}
          </p>
        )}
      </div>
      
      {/* Badges */}
      <div className="absolute top-0 right-0 p-2 flex flex-col gap-1 items-end">
        {showBadge && (
          <span className="bg-primary/90 text-white text-xs px-2 py-0.5 rounded-md shadow-lg">
            Novo
          </span>
        )}
        
        {bookIsFavorite && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-background/80 backdrop-blur-sm p-1 rounded-full"
          >
            <BookmarkCheck className="h-4 w-4 text-primary" />
          </motion.div>
        )}
      </div>
      
      {/* Progress indicator */}
      {progressPercentage > 0 && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-1 bg-muted/30">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
