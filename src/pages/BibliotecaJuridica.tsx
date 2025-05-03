
import React, { useState, useEffect, useCallback } from "react";
import { PageTransition } from "@/components/PageTransition";
import { AtheneumBackground, AtheneumTitle } from "@/components/ui/atheneum-theme";
import { BibliotecaStyledHeader } from "@/components/biblioteca-juridica/BibliotecaStyledHeader";
import { BibliotecaCategoryScroll } from "@/components/biblioteca-juridica/BibliotecaCategoryScroll";
import { BibliotecaGridView } from "@/components/biblioteca-juridica/BibliotecaGridView";
import { BibliotecaListView } from "@/components/biblioteca-juridica/BibliotecaListView";
import { LivroJuridico } from "@/types/biblioteca-juridica";
import { useBibliotecaProgresso } from "@/hooks/use-biblioteca-juridica";
import { BookReader } from "@/components/biblioteca-juridica/BookReader";
import { useQuery } from "@tanstack/react-query";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useNavigate } from "react-router-dom";
import { useSessionStorage } from "@/hooks/use-session-storage";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, BookMarked, Search, Grid3X3, List as ListIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog } from "@/components/ui/dialog";
import { BibliotecaBookModal } from "@/components/biblioteca-juridica/BibliotecaBookModal";
import "../styles/biblioteca-juridica.css";

const BibliotecaJuridica = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [viewMode, setViewMode] = useSessionStorage<"grid" | "list">("biblioteca-view-mode", "grid");
  const [activeTab, setActiveTab] = useState<string>("categorias");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPdfReader, setShowPdfReader] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const { 
    isLoading: progressLoading, 
    getFavoriteBooks, 
    getReadingProgress, 
    isFavorite, 
    updateProgress, 
    toggleFavorite, 
    refetch 
  } = useBibliotecaProgresso();

  // Fetch books from the bibliotecatop table
  const { data: allBooks = [], isLoading } = useQuery({
    queryKey: ["biblioteca-books"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('bibliotecatop')
          .select('*');
          
        if (error) throw error;
        
        // Map the response to match the LivroJuridico type
        return (data || []).map(item => ({
          id: item.id.toString(),
          titulo: item.titulo || 'Sem título',
          autor: 'Autor não especificado', // This field may not exist in bibliotecatop
          descricao: item.descricao || null,
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
    // Just returning first 2 books as example
    return allBooks.slice(0, 2);
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

  return (
    <PageTransition>
      <AtheneumBackground variant="default" className="min-h-screen pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-6">
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
            
            {/* Tab-specific headings */}
            {activeTab === "recentes" && (
              <AtheneumTitle>Livros Recentes</AtheneumTitle>
            )}
            
            {activeTab === "favoritos" && (
              <AtheneumTitle>Meus Favoritos</AtheneumTitle>
            )}
            
            {activeTab === "todos" && (
              <AtheneumTitle>Todos os Livros</AtheneumTitle>
            )}
            
            {/* Loading state */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-pulse flex flex-col items-center">
                  <BookOpen className="h-16 w-16 text-primary/50 animate-bounce" />
                  <p className="mt-4 text-muted-foreground">Carregando biblioteca...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Empty states */}
                {displayBooks.length === 0 && (
                  <div className="text-center py-20">
                    <BookMarked className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-medium mt-4">Nenhum livro encontrado</h3>
                    {searchTerm && <p className="text-muted-foreground mt-2">Tente uma busca diferente</p>}
                    {selectedCategory && (
                      <Button variant="link" onClick={() => setSelectedCategory(null)}>
                        Limpar filtro de categoria
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Book display */}
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
            <BookReader
              book={selectedBook}
              onClose={handleReaderClose}
            />
          )}
        </AnimatePresence>
      </AtheneumBackground>
    </PageTransition>
  );
};

export default BibliotecaJuridica;
