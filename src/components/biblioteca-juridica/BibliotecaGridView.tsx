
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { BookOpen, Star, Clock, Heart } from 'lucide-react';
import { JuridicalCard } from '@/components/ui/juridical-card';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { motion } from 'framer-motion';

interface BibliotecaGridViewProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
  showBadge?: boolean;
}

export function BibliotecaGridView({
  books,
  onSelectBook,
  showBadge = false
}: BibliotecaGridViewProps) {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {books.map((book) => {
        const progress = getReadingProgress(book.id);
        const isFavoriteBook = isFavorite(book.id);
        
        return (
          <motion.div 
            key={book.id} 
            className="group perspective-1000"
            variants={item}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="w-full h-full transform-style-3d transition-transform duration-500 hover:rotate-y-5">
              <Card
                className="cursor-pointer h-full overflow-hidden transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/10"
                onClick={() => onSelectBook(book)}
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-md bg-black">
                  {/* Book Cover */}
                  {book.capa_url ? (
                    <img 
                      src={book.capa_url} 
                      alt={book.titulo}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <BookOpen className="h-16 w-16 text-amber-400/30" />
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  
                  {/* Reading progress indicator */}
                  {progress && progress.pagina_atual > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                      <div 
                        className="h-full bg-amber-400" 
                        style={{ 
                          width: `${Math.min(
                            100, 
                            book.total_paginas 
                              ? (progress.pagina_atual / book.total_paginas) * 100 
                              : 0
                          )}%` 
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {showBadge && (
                      <Badge className="bg-amber-400/80 text-black font-semibold">Recente</Badge>
                    )}
                    {isFavoriteBook && (
                      <Badge variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20">
                        <Heart className="h-3 w-3 mr-1 text-red-400 fill-red-400" />
                        Favorito
                      </Badge>
                    )}
                  </div>
                  
                  {/* Book title overlay on the cover */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-bold text-white line-clamp-2 text-shadow">{book.titulo}</h3>
                    {book.autor && (
                      <p className="text-xs text-white/80 mt-1">{book.autor}</p>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-black/30">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                    <span className="bg-white/10 rounded-full px-2 py-0.5">{book.categoria}</span>
                    {book.total_paginas && (
                      <span className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1 text-amber-400/70" />
                        {book.total_paginas} págs
                      </span>
                    )}
                  </div>
                  
                  {/* Progress text */}
                  {progress && progress.pagina_atual > 1 && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                      <p className="text-xs text-amber-400">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Progresso
                      </p>
                      <p className="text-xs font-medium text-white">
                        {book.total_paginas 
                          ? `${progress.pagina_atual}/${book.total_paginas}`
                          : `Pág. ${progress.pagina_atual}`}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
