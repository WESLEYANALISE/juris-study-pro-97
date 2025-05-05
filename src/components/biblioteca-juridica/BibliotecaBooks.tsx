
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, Search } from 'lucide-react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';

interface BibliotecaBooksProps {
  books: LivroJuridico[];
  category: string;
  onSelectBook: (book: LivroJuridico) => void;
  onBackToCategories: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const BibliotecaBooks: React.FC<BibliotecaBooksProps> = ({
  books,
  category,
  onSelectBook,
  onBackToCategories,
  searchQuery,
  onSearchChange,
}) => {
  const { getReadingProgress, isFavorite } = useBibliotecaProgresso();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };
  
  // Calculate grid columns based on number of books
  const gridCols = books.length > 10 
    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={onBackToCategories}
            className="mr-2"
            size="sm"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          <h2 className="text-2xl font-bold">
            {category === 'todos' ? 'Todos os Livros' : category}
          </h2>
          <Badge className="ml-3">{books.length} livros</Badge>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Buscar livros..." 
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      {books.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum livro encontrado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Não encontramos nenhum livro que corresponda aos seus critérios de busca.
          </p>
        </div>
      ) : (
        <motion.div
          className={`grid ${gridCols} gap-4 sm:gap-6`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {books.map((book) => {
            const progress = book.id ? getReadingProgress(book.id) : null;
            const progressPercentage = progress?.pagina_atual && book.total_paginas
              ? Math.round((progress.pagina_atual / book.total_paginas) * 100)
              : 0;
            
            return (
              <motion.div 
                key={book.id}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="cursor-pointer"
                onClick={() => onSelectBook(book)}
              >
                <Card className="h-full flex flex-col overflow-hidden">
                  <div className="aspect-[2/3] relative bg-muted">
                    {book.capa_url ? (
                      <img
                        src={book.capa_url}
                        alt={book.titulo}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-book-cover.png';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {/* Favorite badge */}
                    {book.id && isFavorite(book.id) && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="default">
                          Favorito
                        </Badge>
                      </div>
                    )}
                    
                    {/* Reading progress */}
                    {progressPercentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                        {progressPercentage}% lido
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-3 flex-grow">
                    <h3 className="font-medium line-clamp-2 text-sm">{book.titulo}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {book.categoria}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};
