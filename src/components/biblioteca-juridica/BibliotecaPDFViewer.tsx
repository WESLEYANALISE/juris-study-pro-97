
import React from 'react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { EnhancedPDFViewer } from './EnhancedPDFViewer';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BibliotecaPDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
  bookTitle: string;
  book: LivroJuridico | null;
}

export function BibliotecaPDFViewer({ pdfUrl, onClose, bookTitle, book }: BibliotecaPDFViewerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      >
        <EnhancedPDFViewer
          pdfUrl={pdfUrl}
          onClose={onClose}
          bookTitle={bookTitle}
          book={book}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default BibliotecaPDFViewer;
