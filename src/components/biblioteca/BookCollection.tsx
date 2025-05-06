
import React from 'react';
import { motion } from 'framer-motion';
import { LivroSupa } from '@/utils/biblioteca-service';
import { BookCard } from './BookCard';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

interface BookCollectionProps {
  title: string;
  books: LivroSupa[];
  onSelectBook: (book: LivroSupa) => void;
  isLoading: boolean;
  emptyMessage?: string;
  showProgress?: boolean;
}

export function BookCollection({
  title,
  books,
  onSelectBook,
  isLoading,
  emptyMessage = "Nenhum livro encontrado nesta categoria.",
  showProgress = false
}: BookCollectionProps) {
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nenhum livro encontrado</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {emptyMessage}
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="text-muted-foreground">{books.length} livros</span>
      </div>
      
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {books.map((book) => (
          <motion.div key={book.id} variants={itemVariants}>
            <BookCard 
              book={book} 
              onSelect={() => onSelectBook(book)} 
              showProgress={showProgress}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
