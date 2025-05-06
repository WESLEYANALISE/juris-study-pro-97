
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
  return (
    <EnhancedPDFViewer
      pdfUrl={pdfUrl}
      onClose={onClose}
      bookTitle={bookTitle}
      book={book}
    />
  );
}

export default BibliotecaPDFViewer;
