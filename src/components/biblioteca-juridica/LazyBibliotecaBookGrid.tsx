
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { BibliotecaBookCard } from './BibliotecaBookCard';
import { useInView } from 'react-intersection-observer';

interface LazyBibliotecaBookGridProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
}

export function LazyBibliotecaBookGrid({ books, onSelectBook }: LazyBibliotecaBookGridProps) {
  const itemsPerPage = 12; // Reduced from 24 to 12 for better initial load
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const initialRenderComplete = useRef(false);
  
  // Use intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
    rootMargin: '200px 0px',
  });
  
  // Handle loading more books when user scrolls down
  useEffect(() => {
    if (inView && visibleItems < books.length) {
      // Add delay to prevent too many renders at once
      const timer = setTimeout(() => {
        setVisibleItems(prevVisible => 
          Math.min(prevVisible + itemsPerPage, books.length)
        );
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [inView, books.length, visibleItems]);

  // Mark initial render complete after component mounts
  useEffect(() => {
    initialRenderComplete.current = true;
  }, []);
  
  // Memoized visible books to prevent unnecessary re-renders
  const visibleBooks = useMemo(() => 
    books.slice(0, visibleItems), 
    [books, visibleItems]
  );
  
  // Animation variants with reduced complexity
  const container = {
    show: {
      transition: {
        staggerChildren: 0.03 // Reduced from 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  };
  
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
    >
      {visibleBooks.map((book, index) => (
        <motion.div 
          key={book.id} 
          variants={item}
          // Don't animate initial items on first load for better performance
          initial={initialRenderComplete.current ? "hidden" : false}
          layout
        >
          <BibliotecaBookCard
            book={book}
            onClick={onSelectBook}
          />
        </motion.div>
      ))}
      
      {visibleItems < books.length && (
        <div ref={ref} className="col-span-full h-10 flex items-center justify-center my-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}

// Export a lazy-loaded version
export const LazyBookGrid = React.lazy(() => 
  import('./LazyBibliotecaBookGrid').then(module => ({ default: module.LazyBibliotecaBookGrid }))
);
