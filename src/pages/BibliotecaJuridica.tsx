
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { BibliotecaPDFViewer } from '@/components/biblioteca-juridica/BibliotecaPDFViewer';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, BookOpen, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { Container } from '@/components/ui/container';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { KindleBookCarousel } from '@/components/biblioteca-juridica/KindleBookCarousel';
import '../styles/biblioteca-juridica.css';

// Interface for our application's internal book type
interface Livro extends LivroJuridico {
  id: string;
  titulo: string;
  categoria: string;
  pdf_url: string;
  capa_url: string | null;
  descricao: string | null;
  total_paginas: number | null;
}

export default function BibliotecaJuridica() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('todos');

  const { isFavorite, getFavorites } = useBibliotecaProgresso();
  
  // Fetch books from Supabase
  useEffect(() => {
    async function fetchLivros() {
      setIsLoading(true);

      try {
        // Get books from our library
        const { data, error } = await supabase
          .from('biblioteca_juridica10')
          .select('*');

        if (error) {
          toast.error('Erro ao carregar biblioteca: ' + error.message);
          throw error;
        }

        if (data && Array.isArray(data)) {
          console.log('Livros carregados:', data.length);
          
          // Convert the data to our Livro type
          const convertedData: Livro[] = data.map(item => ({
            id: item.id,
            titulo: item.titulo,
            categoria: item.categoria,
            pdf_url: item.pdf_url,
            capa_url: item.capa_url,
            descricao: item.descricao,
            total_paginas: item.total_paginas
          }));
          
          setLivros(convertedData);
          
          // Extract categories
          const allCategories = Array.from(
            new Set(data.map((livro) => livro.categoria))
          ).filter(Boolean) as string[];
          
          setCategorias(allCategories);
        } else {
          setLivros([]);
          setCategorias([]);
        }
      } catch (error) {
        console.error('Erro ao buscar livros:', error);
        toast.error('Erro ao carregar a biblioteca');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLivros();
  }, []);

  // Filter books based on search query and current tab
  const filteredLivros = useMemo(() => {
    let result = [...livros];
    
    // Filter by search query if one exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(livro => 
        livro.titulo.toLowerCase().includes(query) || 
        livro.categoria.toLowerCase().includes(query) || 
        (livro.descricao && livro.descricao.toLowerCase().includes(query))
      );
    }
    
    // Filter by current tab
    if (currentTab !== 'todos') {
      result = result.filter(livro => livro.categoria.toLowerCase() === currentTab.toLowerCase());
    }
    
    return result;
  }, [livros, searchQuery, currentTab]);
  
  // Group books by category for carousel display
  const booksByCategory = useMemo(() => {
    if (!filteredLivros.length) return {};
    
    return filteredLivros.reduce<Record<string, Livro[]>>((acc, livro) => {
      const category = livro.categoria || 'Outros';
      
      if (!acc[category]) {
        acc[category] = [];
      }
      
      acc[category].push(livro);
      return acc;
    }, {});
  }, [filteredLivros]);
  
  // Get favorites
  const favoriteBooks = useMemo(() => {
    const favorites = getFavorites();
    return livros.filter(livro => favorites.includes(livro.id));
  }, [livros, getFavorites]);

  // Open PDF viewer
  function handleOpenPDF(livro: Livro) {
    console.log("Opening PDF:", livro);
    setSelectedBook(livro);
  }
  
  // Close PDF viewer
  function handleClosePDF() {
    setSelectedBook(null);
  }

  return (
    <JuridicalBackground variant="books" opacity={0.03}>
      <Container size="xl" className="py-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold">Biblioteca Jurídica</h1>
              <p className="text-muted-foreground">
                Explore nossa coleção de livros e documentos jurídicos
              </p>
            </motion.div>
            
            <motion.div 
              className="relative w-full md:w-64"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <Input 
                placeholder="Buscar livros..." 
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>

          {/* Category Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="w-full overflow-x-auto pb-2"
          >
            <Tabs 
              defaultValue="todos" 
              className="w-full"
              value={currentTab}
              onValueChange={setCurrentTab}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="todos" className="min-w-fit">
                  <Book className="mr-1 h-4 w-4" />
                  Todos
                </TabsTrigger>
                
                {categorias.map((categoria) => (
                  <TabsTrigger 
                    key={categoria} 
                    value={categoria.toLowerCase()}
                    className="min-w-fit"
                  >
                    {categoria === "Doutrinas" ? (
                      <Book className="mr-1 h-4 w-4" />
                    ) : categoria === "Leis" ? (
                      <FileText className="mr-1 h-4 w-4" />
                    ) : (
                      <BookOpen className="mr-1 h-4 w-4" />
                    )}
                    {categoria}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Main carousel content */}
              <div className="space-y-12">
                {/* Favorites Section */}
                {favoriteBooks.length > 0 && (
                  <KindleBookCarousel
                    title="Seus Favoritos"
                    description="Livros que você marcou como favoritos"
                    books={favoriteBooks}
                    onSelectBook={handleOpenPDF}
                    accent={true}
                  />
                )}
                
                {/* Categories Sections */}
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-muted-foreground">Carregando biblioteca...</p>
                  </div>
                ) : searchQuery ? (
                  // Search Results
                  <>
                    {filteredLivros.length > 0 ? (
                      <KindleBookCarousel
                        title="Resultados da Busca"
                        books={filteredLivros}
                        onSelectBook={handleOpenPDF}
                        showAll={false}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16">
                        <Book className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Nenhum livro encontrado</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                          Não encontramos nenhum livro correspondente aos seus critérios de busca.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  // Categories
                  Object.entries(booksByCategory).map(([category, books]) => (
                    <KindleBookCarousel
                      key={category}
                      title={category}
                      books={books}
                      onSelectBook={handleOpenPDF}
                    />
                  ))
                )}
              </div>
            </Tabs>
          </motion.div>
        </div>
        
        {/* PDF Viewer */}
        <AnimatePresence>
          {selectedBook && (
            <BibliotecaPDFViewer
              pdfUrl={selectedBook.pdf_url}
              bookTitle={selectedBook.titulo}
              onClose={handleClosePDF}
              book={selectedBook}
            />
          )}
        </AnimatePresence>
      </Container>
    </JuridicalBackground>
  );
}
