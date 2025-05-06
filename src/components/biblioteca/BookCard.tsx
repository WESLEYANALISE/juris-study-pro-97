
import React, { useState } from 'react';
import { LivroSupa } from '@/utils/biblioteca-service';
import { Card } from '@/components/ui/card';
import { BookOpen, Heart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BookCardProps {
  book: LivroSupa;
  onSelect: () => void;
  showProgress?: boolean;
}

export function BookCard({ book, onSelect, showProgress = false }: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Default book cover if none provided
  const coverUrl = book.capa || '/placeholder-book-cover.png';
  
  // Progress data (in future can be fetched from user's reading progress)
  const progressPercent = showProgress && 'pagina_atual' in book ? 
    Math.min(Math.round((book.pagina_atual as number / 100) * 100), 100) : 
    null;
  
  return (
    <Card
      className="book-card h-full overflow-hidden cursor-pointer transition-all duration-300 relative"
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[2/3] relative">
        {/* Book Cover Image */}
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.pdf_name}
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
          <h3 className="text-white text-sm font-medium line-clamp-3">{book.pdf_name}</h3>
          <p className="text-white/80 text-xs mt-1 line-clamp-1">{book.area}</p>
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
