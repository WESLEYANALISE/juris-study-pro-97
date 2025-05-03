
import React from 'react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { motion } from 'framer-motion';
import { BookOpen, Clock, User, Heart, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface BibliotecaListViewProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
}

export function BibliotecaListView({ books, onSelectBook }: BibliotecaListViewProps) {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };
  
  return (
    <motion.div 
      className="space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {books.map((book) => {
        const progress = getReadingProgress(book.id);
        const progressPercentage = progress && book.total_paginas 
          ? Math.min(100, (progress.pagina_atual / book.total_paginas) * 100)
          : 0;
        const isBookFavorite = isFavorite(book.id);
          
        return (
          <motion.div
            key={book.id}
            variants={item}
            whileHover={{ 
              scale: 1.01, 
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              backgroundColor: "rgba(255,255,255,0.03)"
            }}
            className="book-list-item border border-white/10 bg-black/20 backdrop-blur-sm p-4 rounded-lg flex items-center gap-4 shadow-md hover:shadow-lg transition-all"
          >
            {/* Book cover */}
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md">
              {book.capa_url ? (
                <img
                  src={book.capa_url}
                  alt={book.titulo}
                  className="h-full w-full object-cover shadow-sm"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                  }}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-amber-400/30" />
                </div>
              )}
              
              {isBookFavorite && (
                <div className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5">
                  <Heart className="h-3 w-3 text-red-400 fill-red-400" />
                </div>
              )}
            </div>
            
            {/* Book details */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <h3 className="font-medium text-lg truncate text-white">{book.titulo}</h3>
                <span className="text-xs text-amber-400/80 bg-amber-400/10 rounded-full px-2 py-0.5 hidden md:inline-block">
                  {book.categoria}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                {book.autor && (
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {book.autor}
                  </span>
                )}
                
                {book.total_paginas && (
                  <span className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {book.total_paginas} págs
                  </span>
                )}
                
                <span className="block md:hidden text-xs bg-amber-400/10 rounded-full px-2 py-0.5 text-amber-400/80">
                  {book.categoria}
                </span>
              </div>
              
              {book.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {book.descricao}
                </p>
              )}
              
              {/* Progress bar */}
              {progressPercentage > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-400">Em progresso</span>
                    <span className="text-muted-foreground">
                      {progress?.pagina_atual}/{book.total_paginas} páginas ({Math.round(progressPercentage)}%)
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-1" indicatorClassName="bg-amber-400" />
                </div>
              )}
            </div>
            
            {/* Action button */}
            <div className="ml-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "border-white/20 hover:bg-white/5 group",
                  progressPercentage > 0 && "border-amber-400/50 text-amber-400 hover:border-amber-400 hover:text-amber-300"
                )}
                onClick={() => onSelectBook(book)}
              >
                {progressPercentage > 0 ? (
                  <>Continuar <Clock className="ml-1 h-3 w-3 opacity-70" /></>
                ) : (
                  <>Ler <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </Button>
            </div>
          </motion.div>
        );
      })}
      
      {books.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Nenhum livro encontrado</p>
          <p className="text-muted-foreground text-sm">Tente ajustar seus filtros de busca</p>
        </motion.div>
      )}
    </motion.div>
  );
}
