
import React from 'react';
import { motion } from 'framer-motion';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { BibliotecaBookCard } from './BibliotecaBookCard';
import { useInView } from 'react-intersection-observer';

interface BibliotecaBookGridProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
}

export function BibliotecaBookGrid({ books, onSelectBook }: BibliotecaBookGridProps) {
  const itemsPerPage = 24;
  const [visibleItems, setVisibleItems] = React.useState(itemsPerPage);
  const { ref, inView } = useInView();
  
  React.useEffect(() => {
    if (inView) {
      setVisibleItems(prevVisible => 
        Math.min(prevVisible + itemsPerPage, books.length)
      );
    }
  }, [inView, books.length]);
  
  // Staggered animation for grid items
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
    >
      {books.slice(0, visibleItems).map((book) => (
        <motion.div key={book.id} variants={item} layout>
          <BibliotecaBookCard
            book={book}
            onClick={onSelectBook}
          />
        </motion.div>
      ))}
      
      {visibleItems < books.length && (
        <div ref={ref} className="col-span-full h-10 flex items-center justify-center my-4">
          <div className="loading-spinner h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}
