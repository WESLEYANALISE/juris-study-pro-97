
import React, { useState } from 'react';
import { BookOpen, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BibliotecaBookCardProps {
  book: LivroJuridico;
  onClick: (book: LivroJuridico) => void;
  showBadge?: boolean;
  accent?: boolean;
}

export function BibliotecaBookCard({ book, onClick, showBadge = false, accent = false }: BibliotecaBookCardProps) {
  const { getReadingProgress, isFavorite, toggleFavorite } = useBibliotecaProgresso();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(book.id);
    toast.success(
      bookIsFavorite ? "Livro removido dos favoritos" : "Livro adicionado aos favoritos"
    );
  };

  return (
    <motion.div
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 } 
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(book)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "book-card group relative cursor-pointer",
        "aspect-[2/3] overflow-hidden rounded-lg border",
        "shadow-lg transition-all duration-300",
        accent ? "border-primary/30" : "border-border"
      )}
      style={{ 
        perspective: '1500px',
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    >
      {/* Cover image with 3D effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-card/80 to-card"
        animate={{ 
          rotateY: isHovering ? -15 : 0,
          boxShadow: isHovering ? '5px 5px 30px rgba(0,0,0,0.2)' : '0px 0px 0px rgba(0,0,0,0)'
        }}
        transition={{ type: 'spring', stiffness: 300 }}
        style={{ backfaceVisibility: 'hidden', transformOrigin: 'left center' }}
      >
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
      </motion.div>
      
      {/* Book shadow (3D effect) */}
      <div 
        className={cn(
          "absolute left-0 -bottom-2 right-0 h-8 bg-black/40 blur-md rounded-full transform-gpu",
          "opacity-0 group-hover:opacity-50 transition-opacity duration-300 scale-x-75"
        )}
      ></div>
      
      {/* Book info overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex flex-col justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovering ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="font-medium text-sm text-white line-clamp-2 mb-1">
          {book.titulo}
        </h3>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-white/80">
            {book.total_paginas ? `${book.total_paginas} págs` : ''}
          </p>
          
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "p-1 rounded-full bg-white/10 backdrop-blur-sm",
              "hover:bg-white/20 transition-colors"
            )}
          >
            {bookIsFavorite ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <BookmarkPlus className="h-4 w-4 text-white" />
            )}
          </button>
        </div>
      </motion.div>
      
      {/* Badges */}
      <div className="absolute top-0 right-0 p-2 flex flex-col gap-1 items-end">
        {showBadge && (
          <span className="bg-primary/90 text-white text-xs px-2 py-0.5 rounded-md shadow-lg">
            Novo
          </span>
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
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
