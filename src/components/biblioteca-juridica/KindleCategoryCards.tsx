
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
      <h2 className="kindle-section-title">Explorar por categoria</h2>
      
      <div className="kindle-carousel">
        {categories.map((category) => {
          const books = booksByCategory[category] || [];
          const coverImage = books[0]?.capa_url || '/placeholder-book-cover.png';
          
          return (
            <div 
              key={category}
              className="kindle-category-card"
              onClick={() => onSelectCategory(category)}
            >
              <img 
                src={coverImage}
                alt={category}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                }}
              />
              <div className="kindle-category-overlay">
                <div className="kindle-category-title">{category}</div>
                <div className="kindle-category-count">{books.length} livros</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
