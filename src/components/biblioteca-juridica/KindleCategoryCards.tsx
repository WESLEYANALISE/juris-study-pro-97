
import React from 'react';
import { LivroJuridico } from '@/types/biblioteca-juridica';

interface KindleCategoryCardsProps {
  categories: string[];
  booksByCategory: Record<string, LivroJuridico[]>;
  onSelectCategory: (category: string) => void;
}

export function KindleCategoryCards({
  categories,
  booksByCategory,
  onSelectCategory
}: KindleCategoryCardsProps) {
  return (
    <div className="mb-8">
      <h2 className="kindle-section-title text-xl font-bold mb-4">Explorar por categoria</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const books = booksByCategory[category] || [];
          const coverImage = books[0]?.capa_url || '/placeholder-book-cover.png';
          
          return (
            <div 
              key={category}
              className="kindle-category-card relative aspect-[2/1] rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all"
              onClick={() => onSelectCategory(category)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
              <img 
                src={coverImage}
                alt={category}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <div className="text-white font-medium text-lg">{category}</div>
                <div className="text-white/80 text-sm">{books.length} livros</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
