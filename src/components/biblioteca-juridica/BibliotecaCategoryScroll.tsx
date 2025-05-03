
import React from 'react';
import { motion } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Book, ChevronRight } from 'lucide-react';

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
    <motion.div
      className="mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
          <Book className="h-5 w-5" /> ÁREAS DO DIREITO
        </h2>
        {selectedCategory && (
          <Badge 
            variant="outline" 
            className="text-amber-400 border-amber-400/30 bg-amber-400/10 px-3 py-1 cursor-pointer hover:bg-amber-400/20"
            onClick={() => onSelectCategory(null)}
          >
            Limpar filtro <span className="ml-1 text-white/70">×</span>
          </Badge>
        )}
      </div>
      <ScrollArea className="w-full whitespace-nowrap pb-4 no-scrollbar">
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
                  ${isSelected ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/20' : 'border border-white/10'}
                `}
                onClick={() => onSelectCategory(isSelected ? null : category)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-violet-900/20 z-5 mix-blend-overlay" />
                <div className="absolute bottom-4 left-4 right-4 text-white z-20 flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold uppercase">{category}</h3>
                    <p className="text-sm text-white/80">{books.length} {books.length === 1 ? 'livro' : 'livros'}</p>
                  </div>
                  {!isSelected && <ChevronRight className="h-5 w-5 text-amber-400" />}
                </div>
                <img 
                  src={coverImage} 
                  alt={category}
                  className="object-cover w-full h-full transform transition-transform duration-700 hover:scale-110"
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
    </motion.div>
  );
}
