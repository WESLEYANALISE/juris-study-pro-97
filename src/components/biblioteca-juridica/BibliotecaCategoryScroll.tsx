
import React from 'react';
import { motion } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface BibliotecaCategoryScrollProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  booksByCategory: Record<string, { capa_url?: string | null }[]>;
}

export function BibliotecaCategoryScroll({
  categories,
  selectedCategory,
  onSelectCategory,
  booksByCategory
}: BibliotecaCategoryScrollProps) {
  if (!categories.length) return null;

  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold text-amber-400 mb-4">ÁREAS DO DIREITO</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4">
          {categories.map(category => {
            const isSelected = category === selectedCategory;
            const books = booksByCategory[category] || [];
            const coverImage = books[0]?.capa_url || '/placeholder-book-cover.png';
            
            return (
              <motion.div
                key={category}
                className={`
                  min-w-[280px] h-[180px] rounded-lg overflow-hidden relative cursor-pointer
                  transition-all duration-300 hover:opacity-90
                  ${isSelected ? 'ring-2 ring-amber-400 shadow-lg' : ''}
                `}
                onClick={() => onSelectCategory(isSelected ? null : category)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                  <h3 className="text-2xl font-bold uppercase">{category}</h3>
                  <p className="text-sm text-white/80">{books.length} livros</p>
                </div>
                <img 
                  src={coverImage} 
                  alt={category}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-book-cover.png";
                  }}
                />
              </motion.div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
