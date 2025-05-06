
import React, { useState, useEffect } from 'react';
import { LivroSupa, searchBooks } from '@/utils/biblioteca-service';
import { BookCard } from './BookCard';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchIcon, BookOpenIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface BookSearchResultsProps {
  query: string;
  onSelectBook: (book: LivroSupa) => void;
}

export function BookSearchResults({ query, onSelectBook }: BookSearchResultsProps) {
  const [results, setResults] = useState<LivroSupa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    async function performSearch() {
      if (!query) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const searchResults = await searchBooks(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Error searching books:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    performSearch();
  }, [query]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <SearchIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Resultados para "{query}"</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  // No results found
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpenIcon className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Não encontramos nenhum livro que corresponda a "{query}". Tente ajustar os termos da busca.
        </p>
      </div>
    );
  }
  
  // Show results
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <SearchIcon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Resultados para "{query}"</h2>
        <span className="ml-auto text-muted-foreground">{results.length} livros encontrados</span>
      </div>
      
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {results.map((book) => (
          <motion.div 
            key={book.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BookCard 
              book={book} 
              onSelect={() => onSelectBook(book)} 
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
