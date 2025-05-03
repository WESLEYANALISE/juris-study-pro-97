
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { EnhancedPDFViewer } from './EnhancedPDFViewer';

interface BookReaderProps {
  book: LivroJuridico;
  onClose: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({ book, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (!book || !book.pdf_url) return;

    // Store the PDF URL directly - the EnhancedPDFViewer will handle creating the full URL
    setPdfUrl(book.pdf_url);
    
    // Add class to body when PDF reader is open to prevent scrolling
    document.body.classList.add('pdf-viewer-open');
    
    // Small delay to ensure smooth animation
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => {
      // Remove class when PDF reader is closed
      document.body.classList.remove('pdf-viewer-open');
      clearTimeout(timer);
    };
  }, [book]);

  if (!book || !pdfUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      >
        <EnhancedPDFViewer
          pdfUrl={pdfUrl}
          bookTitle={book.titulo}
          onClose={onClose}
          book={book}
        />
      </motion.div>
    </AnimatePresence>
  );
};
