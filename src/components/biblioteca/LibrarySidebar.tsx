
import React from 'react';
import { motion } from 'framer-motion';
import { LivroSupa } from '@/utils/biblioteca-service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Clock, BookMarked } from 'lucide-react';
import { RecentBookItem } from './RecentBookItem';

interface LibrarySidebarProps {
  areas: { name: string; count: number }[];
  selectedArea: string | null;
  onSelectArea: (area: string | null) => void;
  recentBooks: LivroSupa[];
  onSelectBook: (book: LivroSupa) => void;
}

export function LibrarySidebar({ 
  areas, 
  selectedArea, 
  onSelectArea,
  recentBooks,
  onSelectBook
}: LibrarySidebarProps) {
  return (
    <motion.div 
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: '320px', opacity: 1 }}
      className="h-full bg-card border-r overflow-hidden hidden md:block"
    >
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span>Biblioteca</span>
        </h2>
      </div>

      <ScrollArea className="h-[calc(100vh-65px)] pb-20">
        <div className="p-4">
          {/* Areas Section */}
          <div className="mb-6">
            <h3 className="text-sm uppercase font-medium text-muted-foreground mb-3">
              Áreas Jurídicas
            </h3>
            <ul className="space-y-1">
              {areas.map((area) => (
                <li key={area.name}>
                  <button
                    onClick={() => onSelectArea(area.name)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex justify-between items-center ${
                      selectedArea === area.name 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="truncate">{area.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {area.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Books Section */}
          <div className="mb-6">
            <h3 className="text-sm uppercase font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Lidos Recentemente</span>
            </h3>
            
            {recentBooks.length === 0 ? (
              <p className="text-muted-foreground text-sm italic px-3">
                Nenhum livro lido recentemente
              </p>
            ) : (
              <ul className="space-y-2">
                {recentBooks.slice(0, 3).map((book) => (
                  <RecentBookItem 
                    key={book.id}
                    book={book}
                    onSelect={() => onSelectBook(book)}
                  />
                ))}
              </ul>
            )}
          </div>
          
          {/* Saved Collections Section (placeholder for future) */}
          <div>
            <h3 className="text-sm uppercase font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              <span>Coleções Salvas</span>
            </h3>
            <p className="text-muted-foreground text-sm italic px-3">
              Crie suas coleções personalizadas de livros (em breve)
            </p>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
