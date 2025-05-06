import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LivroSupa, 
  fetchBooksByArea, 
  fetchBookAreas, 
  getRecentlyReadBooks,
  getFavoriteBooks
} from '@/utils/biblioteca-service';
import { LibraryHeader } from '@/components/biblioteca/LibraryHeader';
import { LibrarySidebar } from '@/components/biblioteca/LibrarySidebar';
import { BookCollection } from '@/components/biblioteca/BookCollection';
import { AreaGrid } from '@/components/biblioteca/AreaGrid';
import { BookReader } from '@/components/biblioteca/BookReader';
import { BookSearchResults } from '@/components/biblioteca/BookSearchResults';
import { MobileNavigation } from '@/components/biblioteca/MobileNavigation';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import '../styles/biblioteca.css';

export default function BibliotecaJuridicaPage() {
  // State for library data
  const [booksByArea, setBooksByArea] = useState<{ [key: string]: LivroSupa[] }>({});
  const [areas, setAreas] = useState<{ name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<LivroSupa | null>(null);
  const [recentBooks, setRecentBooks] = useState<LivroSupa[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<LivroSupa[]>([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('areas');
  const [showReader, setShowReader] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Load library data
  useEffect(() => {
    async function loadLibraryData() {
      setIsLoading(true);
      
      try {
        // Load books and areas
        const booksData = await fetchBooksByArea();
        const areasData = await fetchBookAreas();
        setBooksByArea(booksData);
        setAreas(areasData);

        // Load user-specific data
        try {
          const recentData = await getRecentlyReadBooks(6);
          setRecentBooks(recentData);
        } catch (error) {
          console.error('Error loading recent books:', error);
          setRecentBooks([]);
        }

        try {
          const favoritesData = await getFavoriteBooks();
          setFavoriteBooks(favoritesData);
        } catch (error) {
          console.error('Error loading favorite books:', error);
          setFavoriteBooks([]);
        }
      } catch (error) {
        console.error('Error loading library data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadLibraryData();
  }, []);

  // Handle book selection
  const handleSelectBook = (book: LivroSupa) => {
    setSelectedBook(book);
    setShowReader(true);
  };

  // Handle reader close
  const handleCloseReader = () => {
    setShowReader(false);
  };

  // Handle area selection
  const handleSelectArea = (area: string | null) => {
    setSelectedArea(area);
    setActiveTab('books');
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setActiveTab('search');
    }
  };

  // Get filtered books for current view
  const getFilteredBooks = (): LivroSupa[] => {
    if (!selectedArea) return [];
    return booksByArea[selectedArea] || [];
  };

  return (
    <JuridicalBackground variant="books" opacity={0.03}>
      <Container size="full" className="p-0 max-w-full">
        <div className="biblioteca-container flex h-screen">
          {/* Sidebar for desktop */}
          {!isMobile && (
            <LibrarySidebar 
              areas={areas}
              selectedArea={selectedArea}
              onSelectArea={handleSelectArea}
              recentBooks={recentBooks}
              onSelectBook={handleSelectBook}
            />
          )}
          
          <div className="flex-1 overflow-auto h-full pb-16 md:pb-0">
            {/* Header with search */}
            <LibraryHeader 
              onSearch={handleSearch}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            
            <div className="p-4 md:p-6">
              {/* Main content based on active tab */}
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="areas">Áreas</TabsTrigger>
                  <TabsTrigger value="books" disabled={!selectedArea}>
                    {selectedArea || 'Livros'}
                  </TabsTrigger>
                  <TabsTrigger value="favorites">Favoritos</TabsTrigger>
                  <TabsTrigger value="recent">Recentes</TabsTrigger>
                  <TabsTrigger value="search" disabled={!searchQuery}>
                    Resultados
                  </TabsTrigger>
                </TabsList>
                
                {/* Areas Grid View */}
                <TabsContent value="areas">
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-40" />
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <AreaGrid
                        areas={areas}
                        onSelectArea={handleSelectArea}
                      />
                    </motion.div>
                  )}
                </TabsContent>
                
                {/* Books in Selected Area */}
                <TabsContent value="books">
                  {selectedArea && (
                    <BookCollection
                      title={selectedArea}
                      books={getFilteredBooks()}
                      onSelectBook={handleSelectBook}
                      isLoading={isLoading}
                    />
                  )}
                </TabsContent>
                
                {/* Favorites */}
                <TabsContent value="favorites">
                  <BookCollection
                    title="Meus Favoritos"
                    books={favoriteBooks}
                    onSelectBook={handleSelectBook}
                    isLoading={isLoading}
                    emptyMessage="Você ainda não adicionou livros aos favoritos."
                  />
                </TabsContent>
                
                {/* Recently Read */}
                <TabsContent value="recent">
                  <BookCollection
                    title="Lidos Recentemente"
                    books={recentBooks}
                    onSelectBook={handleSelectBook}
                    isLoading={isLoading}
                    emptyMessage="Você ainda não leu nenhum livro."
                    showProgress
                  />
                </TabsContent>
                
                {/* Search Results */}
                <TabsContent value="search">
                  <BookSearchResults
                    query={searchQuery}
                    onSelectBook={handleSelectBook}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Book Reader Modal */}
          {showReader && selectedBook && (
            <BookReader
              book={selectedBook}
              onClose={handleCloseReader}
            />
          )}
          
          {/* Mobile Navigation */}
          {isMobile && (
            <MobileNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              areas={areas}
            />
          )}
        </div>
      </Container>
    </JuridicalBackground>
  );
}
