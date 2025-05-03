
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
import "../styles/biblioteca-juridica.css";

const BibliotecaJuridica = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [viewMode, setViewMode] = useSessionStorage<"grid" | "list">("biblioteca-view-mode", "grid");
  const [activeTab, setActiveTab] = useState<string>("categorias");
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const { isLoading: progressLoading, getFavoriteBooks } = useBibliotecaProgresso();

  // Fetch books from the database
  const { data: allBooks = [], isLoading } = useQuery({
    queryKey: ["biblioteca-books"],
    queryFn: async () => {
      // Mock data for now, replace with actual fetch when available
      return [
        {
          id: "1", 
          titulo: "Código Civil Comentado",
          autor: "Maria Helena Diniz",
          descricao: "Análise completa do Código Civil brasileiro com jurisprudências atualizadas",
          categoria: "Direito Civil",
          subcategoria: "Códigos",
          pdf_url: "/sample.pdf",
          capa_url: "https://images-na.ssl-images-amazon.com/images/I/41-0S6VnpxL._SX346_BO1,204,203,200_.jpg",
          total_paginas: 1200
        },
        {
          id: "2", 
          titulo: "Manual de Direito Penal",
          autor: "Guilherme Nucci",
          descricao: "Obra fundamental sobre os princípios e aplicações do Direito Penal brasileiro",
          categoria: "Direito Penal",
          subcategoria: "Manuais",
          pdf_url: "/sample.pdf",
          capa_url: "https://m.media-amazon.com/images/I/41IxjG6GxrL._SY445_SX342_.jpg",
          total_paginas: 850
        },
        {
          id: "3", 
          titulo: "Curso de Direito Constitucional",
          autor: "Pedro Lenza",
          descricao: "Análise completa da Constituição Federal com foco em concursos públicos",
          categoria: "Direito Constitucional",
          subcategoria: "Cursos",
          pdf_url: "/sample.pdf",
          capa_url: "https://m.media-amazon.com/images/I/41VRgMiDr2L._SY445_SX342_.jpg",
          total_paginas: 1560
        },
        {
          id: "4", 
          titulo: "Direito Administrativo Descomplicado",
          autor: "Marcelo Alexandrino",
          descricao: "Manual prático de Direito Administrativo voltado para concursos",
          categoria: "Direito Administrativo",
          subcategoria: "Manuais",
          pdf_url: "/sample.pdf",
          capa_url: "https://m.media-amazon.com/images/I/51jt5G69g1L._SY445_SX342_.jpg",
          total_paginas: 1100
        }
      ] as LivroJuridico[];
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
  };
  
  // Handle book reader close
  const handleReaderClose = () => {
    setSelectedBook(null);
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
        
        {/* Book reader modal */}
        <AnimatePresence>
          {selectedBook && (
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
