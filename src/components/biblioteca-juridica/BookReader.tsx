
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

  useEffect(() => {
    if (!book || !book.pdf_url) return;

    // Store the PDF URL directly - the EnhancedPDFViewer will handle creating the full URL
    setPdfUrl(book.pdf_url);
    
    // Add class to body when PDF reader is open
    document.body.classList.add('pdf-viewer-open');
    
    return () => {
      // Remove class when PDF reader is closed
      document.body.classList.remove('pdf-viewer-open');
    };
  }, [book]);

  if (!book || !pdfUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50"
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
