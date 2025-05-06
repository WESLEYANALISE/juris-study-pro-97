
import React, { useState } from 'react';
import { LivroSupa } from '@/utils/biblioteca-service';
import { Card } from '@/components/ui/card';
import { BookOpen, Heart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Define the props interface to work with both Livro and LivroSupa types
interface BookCardProps {
  book?: LivroSupa;
  livro?: any; // Support for the old Livro type
  onSelect?: () => void;
  onCardClick?: () => void; // Support for the old callback name
  showProgress?: boolean;
}

export function BookCard({ book, livro, onSelect, onCardClick, showProgress = false }: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Support both new and old prop structures
  const bookData = book || livro;
  const handleClick = onSelect || onCardClick;
  
  if (!bookData) return null;
  
  // Get the appropriate property names depending on which type we're using
  const title = 'pdf_name' in bookData ? bookData.pdf_name : bookData.livro;
  const category = 'area' in bookData ? bookData.area : bookData.area;
  const coverUrl = 'capa' in bookData ? bookData.capa : bookData.imagem;
  
  // Progress data (in future can be fetched from user's reading progress)
  const progressPercent = showProgress && 'pagina_atual' in bookData ? 
    Math.min(Math.round((bookData.pagina_atual as number / 100) * 100), 100) : 
    null;
  
  return (
    <Card
      className="book-card h-full overflow-hidden cursor-pointer transition-all duration-300 relative"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[2/3] relative">
        {/* Book Cover Image */}
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <BookOpen className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Overlay with title on hover */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 flex flex-col justify-end transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-90'
          }`}
        >
          <h3 className="text-white text-sm font-medium line-clamp-3">{title}</h3>
          <p className="text-white/80 text-xs mt-1 line-clamp-1">{category}</p>
        </div>
        
        {/* Progress bar */}
        {progressPercent !== null && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={progressPercent} className="h-1 rounded-none" />
          </div>
        )}
        
        {/* Favorite indicator (example, to be implemented with actual data) */}
        {false && (
          <div className="absolute top-2 right-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          </div>
        )}
      </div>
    </Card>
  );
}
