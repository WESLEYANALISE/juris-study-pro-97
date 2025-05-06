
import React, { useState, useEffect } from 'react';
import { Livro9Item, fetchLivro9Areas, fetchLivro9ByAreaName } from '@/utils/livro9-service';
import { motion } from 'framer-motion';
import { BookOpen, Search, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { Container } from '@/components/ui/container';
import { BibliotecaPDFViewer } from '@/components/biblioteca-juridica/BibliotecaPDFViewer';

export default function Livro9Page() {
  const [areas, setAreas] = useState<{name: string, count: number}[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [books, setBooks] = useState<Livro9Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPDF, setSelectedPDF] = useState<Livro9Item | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  
  // Fetch available areas
  useEffect(() => {
    async function loadAreas() {
      const areasData = await fetchLivro9Areas();
      setAreas(areasData);
      setIsLoading(false);
    }
    
    loadAreas();
  }, []);
  
  // Fetch books when area changes
  useEffect(() => {
    async function loadBooks() {
      if (selectedArea) {
        setIsLoading(true);
        const booksData = await fetchLivro9ByAreaName(selectedArea);
        setBooks(booksData);
        setIsLoading(false);
      } else {
        setBooks([]);
      }
    }
    
    loadBooks();
  }, [selectedArea]);
  
  // Handle area selection
  const handleSelectArea = (area: string) => {
    setSelectedArea(area);
    setSearchQuery('');
  };
  
  // Handle book selection
  const handleSelectBook = (book: Livro9Item) => {
    setSelectedPDF(book);
    setViewerOpen(true);
  };
  
  // Handle PDF viewer close
  const handleCloseViewer = () => {
    setViewerOpen(false);
  };
  
  // Filter books by search query
  const filteredBooks = books.filter(book => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      book.pdf_name.toLowerCase().includes(query) ||
      book.area.toLowerCase().includes(query) ||
      (book.description && book.description.toLowerCase().includes(query))
    );
  });
  
  return (
    <JuridicalBackground variant="books" opacity={0.03}>
      <Container size="xl" className="py-6">
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold">Livro9 - PDFs por Área</h1>
            <p className="text-muted-foreground">
              PDFs do bucket "agoravai" organizados por área
            </p>
          </motion.div>
          
          {/* Main content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Carregando livros...</p>
            </div>
          ) : selectedArea ? (
            // Books view
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedArea(null)}
                    className="mr-2"
                    size="sm"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
                  </Button>
                  <h2 className="text-2xl font-bold">{selectedArea}</h2>
                  <Badge className="ml-3">{filteredBooks.length} PDFs</Badge>
                </div>
                
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Buscar PDFs..." 
                    className="pl-9 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {filteredBooks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum PDF encontrado</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Não encontramos nenhum PDF que corresponda aos seus critérios de busca.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredBooks.map((book) => (
                    <motion.div 
                      key={book.id}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="cursor-pointer"
                      onClick={() => handleSelectBook(book)}
                    >
                      <Card className="h-full flex flex-col overflow-hidden">
                        <div className="aspect-[3/2] relative bg-muted">
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                          </div>
                        </div>
                        
                        <CardContent className="p-3 flex-grow">
                          <h3 className="font-medium line-clamp-2 text-sm">{book.pdf_name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {book.area}
                          </p>
                          {book.total_pages && (
                            <p className="text-xs text-primary mt-1">
                              {book.total_pages} páginas
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Areas view
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Áreas Disponíveis</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {areas.map((area) => (
                  <Card 
                    key={area.name}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSelectArea(area.name)}
                  >
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{area.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {area.count} PDFs
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* PDF Viewer */}
        {viewerOpen && selectedPDF && (
          <BibliotecaPDFViewer 
            pdfUrl={selectedPDF.pdf_url}
            onClose={handleCloseViewer}
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
      </Container>
    </JuridicalBackground>
  );
}
