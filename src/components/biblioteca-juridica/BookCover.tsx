
import React from 'react';
import { LivroJuridico } from '@/types/biblioteca-juridica';

interface BookCoverProps {
  book: LivroJuridico;
  className?: string;
}

export function BookCover({ book, className = "" }: BookCoverProps) {
  // Use the specified image for all book covers
  const defaultCoverImage = "https://imgur.com/7Z3fHZB.png";
  
  return (
    <div className={`relative ${className}`}>
      <img
        src={defaultCoverImage}
        alt={book.titulo}
        className="w-full h-full object-cover rounded-md"
        loading="lazy"
      />
      
      {/* Optional title overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-md">
        <h3 className="text-xs md:text-sm text-white font-medium line-clamp-2">{book.titulo}</h3>
        {book.autor && (
          <p className="text-xs text-gray-300 line-clamp-1">{book.autor}</p>
        )}
      </div>
    </div>
  );
}

export default BookCover;
