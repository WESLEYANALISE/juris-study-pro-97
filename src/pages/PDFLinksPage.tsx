
import React, { useState } from 'react';
import { PDFLinkByArea } from '@/types/pdf-links';
import { PDFLinksByArea } from '@/components/pdf-links/PDFLinksByArea';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { BibliotecaPDFViewer } from '@/components/biblioteca-juridica/BibliotecaPDFViewer';

export default function PDFLinksPage() {
  const [selectedPDF, setSelectedPDF] = useState<PDFLinkByArea | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  
  const handleSelectPDF = (pdf: PDFLinkByArea) => {
    setSelectedPDF(pdf);
    setViewerOpen(true);
  };
  
  const handleClosePDFViewer = () => {
    setViewerOpen(false);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Biblioteca de PDFs por Área</h1>
        <p className="text-lg text-muted-foreground">
          Explore nossa coleção de PDFs organizados por área jurídica
        </p>
      </motion.div>
      
      <PDFLinksByArea onSelectPDF={handleSelectPDF} />
      
      {viewerOpen && selectedPDF && (
        <BibliotecaPDFViewer 
          pdfUrl={selectedPDF.pdf_url}
          onClose={handleClosePDFViewer}
          bookTitle={selectedPDF.pdf_name}
          book={{
            id: selectedPDF.id,
            titulo: selectedPDF.pdf_name,
            categoria: selectedPDF.area,
            pdf_url: selectedPDF.pdf_url,
            capa_url: null,
            descricao: selectedPDF.description,
            total_paginas: selectedPDF.total_pages
          }}
        />
      )}
    </div>
  );
}
