
import React from 'react';
import { LivroSupa } from '@/utils/biblioteca-service';
import { BookOpen } from 'lucide-react';

interface RecentBookItemProps {
  book: LivroSupa;
  onSelect: () => void;
}

export function RecentBookItem({ book, onSelect }: RecentBookItemProps) {
  // Default book cover if none provided
  const coverUrl = book.capa || '/placeholder-book-cover.png';
  
  return (
    <li>
      <button
        onClick={onSelect}
        className="w-full text-left p-2 hover:bg-muted rounded-md flex items-center gap-3 transition-colors"
      >
        {/* Thumbnail */}
        <div className="h-12 w-9 flex-shrink-0 bg-muted rounded overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.pdf_name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Book details */}
        <div className="overflow-hidden">
          <p className="text-sm font-medium line-clamp-1">{book.pdf_name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{book.area}</p>
        </div>
      </button>
    </li>
  );
}
