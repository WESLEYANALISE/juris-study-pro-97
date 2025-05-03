
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

    // Determine if the PDF URL is absolute or relative
    const isAbsoluteUrl = book.pdf_url.startsWith('http');
    
    // If it's a relative path, prefix with the Supabase storage URL
    const fullPdfUrl = isAbsoluteUrl 
      ? book.pdf_url 
      : `${import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co"}/storage/v1/object/public/agoravai/${book.pdf_url}`;
    
    setPdfUrl(fullPdfUrl);
    
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
