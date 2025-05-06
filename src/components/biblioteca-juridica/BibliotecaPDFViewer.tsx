
import React from 'react';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { EnhancedPDFViewer } from './EnhancedPDFViewer';

interface BibliotecaPDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
  bookTitle: string;
  book: LivroJuridico | null;
}

export function BibliotecaPDFViewer({ pdfUrl, onClose, bookTitle, book }: BibliotecaPDFViewerProps) {
  // Handle close with a wrapper function to ensure proper cleanup
  const handleClose = () => {
    console.log("Closing PDF viewer");
    onClose();
  };
  
  return (
    <EnhancedPDFViewer
      pdfUrl={pdfUrl}
      onClose={handleClose}
      bookTitle={bookTitle}
      book={book}
    />
  );
}

export default BibliotecaPDFViewer;
