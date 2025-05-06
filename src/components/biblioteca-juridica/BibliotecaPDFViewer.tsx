
import React, { useState } from 'react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { EnhancedPDFViewer } from './EnhancedPDFViewer';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        {/* Close button in top-right corner */}
        <Button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] bg-black/50 hover:bg-black/70 text-white border border-white/20 rounded-full"
          size="icon"
        >
          <X className="h-5 w-5" />
        </Button>
        
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
