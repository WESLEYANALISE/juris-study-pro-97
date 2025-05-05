
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { Container } from '@/components/ui/container';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { BibliotecaCategories } from '@/components/biblioteca-juridica/BibliotecaCategories';
import { BibliotecaBooks } from '@/components/biblioteca-juridica/BibliotecaBooks';
import { BookReader } from '@/components/biblioteca-juridica/BookReader';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  // Filter books based on search query and selected category
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
    
    // Filter by selected category
    if (selectedCategory && selectedCategory !== 'todos') {
      result = result.filter(livro => livro.categoria === selectedCategory);
    }
    
    return result;
  }, [livros, searchQuery, selectedCategory]);
  
  // Calculate book count by category
  const bookCountByCategory = useMemo(() => {
    return livros.reduce<Record<string, number>>((acc, livro) => {
      const categoria = livro.categoria;
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});
  }, [livros]);
  
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
  
  // Handle category selection
  function handleSelectCategory(category: string) {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search query when changing category
  }
  
  // Go back to categories
  function handleBackToCategories() {
    setSelectedCategory(null);
  }

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
            <h1 className="text-3xl font-bold">Biblioteca Jurídica</h1>
            <p className="text-muted-foreground">
              Explore nossa coleção de livros e documentos jurídicos
            </p>
          </motion.div>
          
          {/* Search - only shown when viewing categories */}
          {!selectedCategory && (
            <motion.div 
              className="relative w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <Input 
                placeholder="Buscar em toda a biblioteca..." 
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          )}

          {/* Main content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Carregando biblioteca...</p>
            </div>
          ) : searchQuery && !selectedCategory ? (
            // Global search results
            <BibliotecaBooks
              books={filteredLivros}
              category="Resultados da Busca"
              onSelectBook={handleOpenPDF}
              onBackToCategories={handleBackToCategories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          ) : selectedCategory ? (
            // Books in selected category
            <BibliotecaBooks
              books={filteredLivros}
              category={selectedCategory}
              onSelectBook={handleOpenPDF}
              onBackToCategories={handleBackToCategories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          ) : (
            // Categories view (default)
            <>
              {favoriteBooks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <BibliotecaBooks
                    books={favoriteBooks}
                    category="Seus Favoritos"
                    onSelectBook={handleOpenPDF}
                    onBackToCategories={() => {}}
                    searchQuery=""
                    onSearchChange={() => {}}
                  />
                </motion.div>
              )}
              
              <BibliotecaCategories
                categories={categorias}
                bookCountByCategory={bookCountByCategory}
                onSelectCategory={handleSelectCategory}
              />
            </>
          )}
        </div>
        
        {/* PDF Viewer */}
        {selectedBook && (
          <BookReader
            book={selectedBook}
            onClose={handleClosePDF}
          />
        )}
      </Container>
    </JuridicalBackground>
  );
}
