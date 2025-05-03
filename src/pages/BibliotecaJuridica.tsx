
import React, { useState, useEffect, useCallback } from "react";
import { PageTransition } from "@/components/PageTransition";
import { AtheneumBackground } from "@/components/ui/atheneum-theme";
import { BibliotecaStyledHeader } from "@/components/biblioteca-juridica/BibliotecaStyledHeader";
import { BibliotecaCategoryScroll } from "@/components/biblioteca-juridica/BibliotecaCategoryScroll";
import { BibliotecaGridView } from "@/components/biblioteca-juridica/BibliotecaGridView";
import { BibliotecaListView } from "@/components/biblioteca-juridica/BibliotecaListView";
import { LivroJuridico } from "@/types/biblioteca-juridica";
import { useBibliotecaProgresso } from "@/hooks/use-biblioteca-juridica";
import { BookReader } from "@/components/biblioteca-juridica/BookReader";
import { useQuery } from "@tanstack/react-query";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSessionStorage } from "@/hooks/use-session-storage";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, BookMarked, Bookmark, Clock, List as ListIcon, Grid3X3, Search } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Dialog } from "@/components/ui/dialog";
import { BibliotecaBookModal } from "@/components/biblioteca-juridica/BibliotecaBookModal";
import { toast } from "sonner";
import "../styles/biblioteca-juridica.css";

// Define a type for the book response from Supabase
interface BibliotecaBookResponse {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  pdf_url: string;
  capa_url: string;
  total_paginas: string;
  autor?: string; // Optional field
}

const BibliotecaJuridica = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [viewMode, setViewMode] = useSessionStorage<"grid" | "list">("biblioteca-view-mode", "grid");
  const [activeTab, setActiveTab] = useState<string>("categorias");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPdfReader, setShowPdfReader] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const {
    isLoading: progressLoading,
    getFavoriteBooks,
    getReadingProgress,
    isFavorite,
    updateProgress,
    toggleFavorite,
    refetch
  } = useBibliotecaProgresso();

  // Fetch books from the bibliotecatop table with error handling
  const {
    data: allBooks = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["biblioteca-books"],
    queryFn: async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('bibliotecatop').select('*');
        
        if (error) {
          console.error('Error fetching books:', error);
          toast.error("Erro ao carregar a biblioteca", {
            description: "Não foi possível obter os livros. Por favor, tente novamente."
          });
          throw error;
        }

        // Map the response to match the LivroJuridico type
        return (data || []).map((item: BibliotecaBookResponse) => ({
          id: item.id.toString(),
          titulo: item.titulo || 'Sem título',
          autor: item.autor || 'Autor não especificado',
          descricao: item.descricao || 'Nenhuma descrição disponível.',
          categoria: item.categoria || 'Geral',
          subcategoria: null,
          pdf_url: item.pdf_url || '',
          capa_url: item.capa_url || null,
          total_paginas: item.total_paginas ? parseInt(item.total_paginas) : 100
        })) as LivroJuridico[];
      } catch (err) {
        console.error('Error fetching books:', err);
        return [];
      }
    }
  });

  // Filter books based on search and category
  const filteredBooks = React.useMemo(() => {
    if (!allBooks) return [];
    return allBooks.filter(book => {
      const matchesSearch = searchTerm === "" || 
        book.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (book.autor && book.autor.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (book.descricao && book.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
        
      const matchesCategory = selectedCategory === null || book.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allBooks, searchTerm, selectedCategory]);

  // Get all categories from books
  const categories = React.useMemo(() => {
    if (!allBooks) return [];
    const uniqueCategories = [...new Set(allBooks.map(book => book.categoria))];
    return uniqueCategories;
  }, [allBooks]);

  // Group books by category for display in the category scroll
  const booksByCategory = React.useMemo(() => {
    if (!allBooks) return {};
    return allBooks.reduce<Record<string, LivroJuridico[]>>((acc, book) => {
      if (!acc[book.categoria]) {
        acc[book.categoria] = [];
      }
      acc[book.categoria].push(book);
      return acc;
    }, {});
  }, [allBooks]);

  // Get favorite books
  const favoriteBooks = React.useMemo(() => {
    if (!allBooks || progressLoading) return [];
    const favoriteIds = getFavoriteBooks();
    return allBooks.filter(book => favoriteIds.includes(book.id));
  }, [allBooks, getFavoriteBooks, progressLoading]);

  // Get recently viewed books (mock for now)
  const recentBooks = React.useMemo(() => {
    if (!allBooks) return [];
    // Would normally come from user history in database
    // Just returning first few books as example
    return allBooks.slice(0, 4);
  }, [allBooks]);

  // Handle book selection
  const handleBookSelect = (book: LivroJuridico) => {
    setSelectedBook(book);
    setIsModalOpen(true); // Open modal first
  };

  // Handle book reader close
  const handleReaderClose = () => {
    setSelectedBook(null);
    setShowPdfReader(false);
  };

  // Handle reading the book after viewing details
  const handleReadBook = () => {
    setIsModalOpen(false); // Close the modal
    setShowPdfReader(true); // Show the PDF reader
  };

  // Handle category selection
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      setActiveTab("categorias");
    }
  };

  // Get books to display based on active tab
  const displayBooks = React.useMemo(() => {
    switch (activeTab) {
      case "recentes":
        return recentBooks;
      case "favoritos":
        return favoriteBooks;
      case "categorias":
        return filteredBooks;
      case "todos":
      default:
        return filteredBooks;
    }
  }, [activeTab, filteredBooks, recentBooks, favoriteBooks]);

  // Tratar erro de carregamento
  if (error) {
    return (
      <PageTransition>
        <AtheneumBackground variant="default" className="min-h-screen">
          <div className="container mx-auto py-12 px-4 text-center">
            <div className="bg-destructive/10 rounded-lg p-8 max-w-lg mx-auto">
              <h2 className="text-2xl font-bold mb-4">Erro ao carregar a biblioteca</h2>
              <p className="text-muted-foreground mb-6">
                Ocorreu um problema ao carregar os livros. Por favor, tente novamente mais tarde.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="mx-auto"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </AtheneumBackground>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AtheneumBackground variant="default" className="min-h-screen pb-20 md:pb-6">
        <div className="container mx-auto py-[21px] px-[6px]">
          {/* Header with search and view controls */}
          <BibliotecaStyledHeader 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            viewMode={viewMode} 
            onViewModeChange={setViewMode} 
            isMobile={isMobile} 
            totalBooks={allBooks.length} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          {/* Main content */}
          <div className="mt-6">
            {/* Category scroll - only visible when on categories tab */}
            {activeTab === "categorias" && (
              <BibliotecaCategoryScroll 
                categories={categories} 
                selectedCategory={selectedCategory} 
                onSelectCategory={handleCategorySelect} 
                booksByCategory={booksByCategory} 
              />
            )}
            
            {/* Tab-specific headings with animations */}
            <AnimatePresence mode="wait">
              {activeTab === "recentes" && (
                <motion.div
                  key="recentes"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <Clock className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Livros Recentes</h2>
                </motion.div>
              )}
              
              {activeTab === "favoritos" && (
                <motion.div
                  key="favoritos"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <BookMarked className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Meus Favoritos</h2>
                </motion.div>
              )}
              
              {activeTab === "todos" && (
                <motion.div
                  key="todos"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Todos os Livros</h2>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Loading state with animation */}
            {isLoading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center py-20"
              >
                <motion.div 
                  className="flex flex-col items-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <BookOpen className="h-16 w-16 text-primary/50" />
                  <p className="mt-4 text-muted-foreground">Carregando biblioteca...</p>
                </motion.div>
              </motion.div>
            ) : (
              <>
                {/* Empty states with animations */}
                {displayBooks.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    {activeTab === "favoritos" ? (
                      <>
                        <BookMarked className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-medium mt-4">Nenhum livro favoritado</h3>
                        <p className="text-muted-foreground mt-2">
                          Adicione livros aos seus favoritos para acessá-los facilmente aqui
                        </p>
                      </>
                    ) : searchTerm ? (
                      <>
                        <Search className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-medium mt-4">Nenhum livro encontrado</h3>
                        <p className="text-muted-foreground mt-2">Tente uma busca diferente</p>
                      </>
                    ) : selectedCategory ? (
                      <>
                        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-medium mt-4">Nenhum livro encontrado</h3>
                        <Button variant="link" onClick={() => setSelectedCategory(null)}>
                          Limpar filtro de categoria
                        </Button>
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-medium mt-4">Biblioteca vazia</h3>
                        <p className="text-muted-foreground mt-2">
                          Não há livros disponíveis no momento
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
                
                {/* Book display with view mode switch animation */}
                {displayBooks.length > 0 && (
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={viewMode} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      transition={{ duration: 0.3 }}
                    >
                      {viewMode === "grid" ? (
                        <BibliotecaGridView 
                          books={displayBooks} 
                          onSelectBook={handleBookSelect} 
                          showBadge={activeTab === "recentes"} 
                        />
                      ) : (
                        <BibliotecaListView 
                          books={displayBooks} 
                          onSelectBook={handleBookSelect} 
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Book details modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <BibliotecaBookModal 
            book={selectedBook} 
            onClose={() => setIsModalOpen(false)} 
            onReadBook={handleReadBook} 
          />
        </Dialog>
        
        {/* Book reader (full screen) */}
        <AnimatePresence>
          {selectedBook && showPdfReader && (
            <BookReader book={selectedBook} onClose={handleReaderClose} />
          )}
        </AnimatePresence>
      </AtheneumBackground>
    </PageTransition>
  );
};

export default BibliotecaJuridica;
