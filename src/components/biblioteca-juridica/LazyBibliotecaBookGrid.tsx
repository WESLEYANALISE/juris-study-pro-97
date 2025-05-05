
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { BibliotecaBookCard } from './BibliotecaBookCard';
import { useInView } from 'react-intersection-observer';

interface LazyBibliotecaBookGridProps {
  books: LivroJuridico[];
  onSelectBook: (book: LivroJuridico) => void;
}

export function LazyBibliotecaBookGrid({ books, onSelectBook }: LazyBibliotecaBookGridProps) {
  const itemsPerPage = 8; // Reduced from 12 to 8 for better initial load
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const initialRenderComplete = useRef(false);
  
  // Use intersection observer with higher threshold for better lazy loading
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: false,
    rootMargin: '250px 0px',
  });
  
  // Optimized handler for loading more books
  const loadMoreItems = useCallback(() => {
    if (visibleItems < books.length) {
      // Use requestIdleCallback when available for better performance
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          setVisibleItems(prevVisible => 
            Math.min(prevVisible + itemsPerPage, books.length)
          );
        }, { timeout: 500 });
      } else {
        // Fallback to setTimeout with a small delay
        setTimeout(() => {
          setVisibleItems(prevVisible => 
            Math.min(prevVisible + itemsPerPage, books.length)
          );
        }, 350);
      }
    }
  }, [books.length, visibleItems, itemsPerPage]);

  // Handle loading more books when user scrolls down
  React.useEffect(() => {
    if (inView) {
      loadMoreItems();
    }
    
    // Mark initial render complete after component mounts
    if (!initialRenderComplete.current) {
      initialRenderComplete.current = true;
    }
  }, [inView, loadMoreItems]);
  
  // Memoized visible books with a limit to prevent rendering too many at once
  const visibleBooks = useMemo(() => 
    books.slice(0, visibleItems), 
    [books, visibleItems]
  );
  
  // Simplified animation variants
  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  };
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {visibleBooks.map((book, index) => (
        <motion.div 
          key={book.id} 
          variants={item}
          initial={initialRenderComplete.current ? "hidden" : false}
          animate="show"
          transition={{ duration: 0.2 }} // Reduced animation duration
          layout={false} // Disable layout animation for better performance
        >
          <BibliotecaBookCard
            book={book}
            onClick={onSelectBook}
          />
        </motion.div>
      ))}
      
      {visibleItems < books.length && (
        <div ref={ref} className="col-span-full h-8 flex items-center justify-center my-4">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Export a lazy-loaded version with memo for better performance
export const LazyBookGrid = React.memo(React.lazy(() => 
  import('./LazyBibliotecaBookGrid').then(module => ({ default: module.LazyBibliotecaBookGrid }))
));
