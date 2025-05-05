
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Book, BookOpen, FileText, Search, BookMarked, Clock, Bookmark, Grid3X3, List } from 'lucide-react';
import { toast } from 'sonner';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { Container } from '@/components/ui/container';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { BibliotecaHeroSection } from '@/components/biblioteca-juridica/BibliotecaHeroSection';
import { BibliotecaCategoryGrid } from '@/components/biblioteca-juridica/BibliotecaCategoryGrid';
import { BibliotecaReadingStats } from '@/components/biblioteca-juridica/BibliotecaReadingStats';
import { Skeleton } from '@/components/ui/skeleton';
import { BibliotecaBookList } from '@/components/biblioteca-juridica/BibliotecaBookList';
import '../styles/biblioteca-juridica.css';

// Import normal components for fallback
import { BibliotecaPDFViewer } from '@/components/biblioteca-juridica/BibliotecaPDFViewer';
import { BibliotecaBookGrid } from '@/components/biblioteca-juridica/BibliotecaBookGrid';

// Lazy load optimized components
const LazyOptimizedPDFViewer = React.lazy(() => 
  import('../components/biblioteca-juridica/OptimizedPDFViewer').then(module => 
    ({ default: module.OptimizedPDFViewer })
  )
);

const LazyBookGrid = React.lazy(() => 
  import('../components/biblioteca-juridica/LazyBibliotecaBookGrid').then(module => 
    ({ default: module.LazyBibliotecaBookGrid })
  )
);

const LazyKindleBookCarousel = React.lazy(() => 
  import('../components/biblioteca-juridica/KindleBookCarousel').then(module => 
    ({ default: module.KindleBookCarousel })
  )
);

// Loading fallback component
const LoadingFallback = () => (
  <div className="w-full flex justify-center py-12">
    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function BibliotecaJuridica() {
  const [livros, setLivros] = useState<LivroJuridico[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isPDFReady, setIsPDFReady] = useState<boolean>(false);

  const { isFavorite, getFavorites, getReadingProgress } = useBibliotecaProgresso();
  
  // Optimized data loading with fewer re-renders
  useEffect(() => {
    let isMounted = true;
    
    async function fetchLivros() {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('bibliotecatop')
          .select('*');

        if (error) {
          throw error;
        }

        if (data && Array.isArray(data) && isMounted) {
          console.log('Livros carregados:', data.length);
          
          const convertedData: LivroJuridico[] = data.map(item => ({
            id: item.id.toString(),
            titulo: item.titulo || 'Sem título',
            categoria: item.categoria || 'Geral',
            pdf_url: item.pdf_url || '',
            capa_url: item.capa_url || null,
            descricao: item.descricao || null,
            total_paginas: item.total_paginas ? parseInt(item.total_paginas) : null
          }));
          
          setLivros(convertedData);
          
          // Extract categories
          const allCategories = Array.from(
            new Set(data.map((livro) => livro.categoria))
          ).filter(Boolean) as string[];
          
          setCategorias(allCategories);
        }
      } catch (error) {
        console.error('Erro ao buscar livros:', error);
        if (isMounted) {
          toast.error('Erro ao carregar a biblioteca');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchLivros();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered books with memoization for performance
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
      if (currentTab === 'favoritos') {
        const favorites = getFavorites();
        result = result.filter(livro => favorites.includes(livro.id));
      } else if (currentTab === 'recentes') {
        // Sort by most recently accessed
        result = result.sort((a, b) => {
          const progressA = getReadingProgress(a.id);
          const progressB = getReadingProgress(b.id);
          
          if (!progressA && progressB) return 1;
          if (progressA && !progressB) return -1;
          if (!progressA && !progressB) return 0;
          
          return new Date(progressB!.ultima_leitura).getTime() - 
                 new Date(progressA!.ultima_leitura).getTime();
        });
      } else {
        result = result.filter(livro => livro.categoria?.toLowerCase() === currentTab.toLowerCase());
      }
    }
    
    return result;
  }, [livros, searchQuery, currentTab, getFavorites, getReadingProgress]);
  
  // Group books by category with memoization
  const booksByCategory = useMemo(() => {
    if (!filteredLivros.length) return {};
    
    if (currentTab === 'favoritos' || currentTab === 'recentes' || searchQuery) {
      // For these tabs, return a single group with all filtered books
      return {
        [currentTab === 'favoritos' ? 'Favoritos' : 
         currentTab === 'recentes' ? 'Recentes' : 
         'Resultados da busca']: filteredLivros
      };
    }
    
    // Otherwise group by category
    return filteredLivros.reduce<Record<string, LivroJuridico[]>>((acc, livro) => {
      const category = livro.categoria || 'Outros';
      
      if (!acc[category]) {
        acc[category] = [];
      }
      
      acc[category].push(livro);
      return acc;
    }, {});
  }, [filteredLivros, currentTab, searchQuery]);
  
  // Favorites and recently accessed books
  const favoriteBooks = useMemo(() => {
    const favorites = getFavorites();
    return livros.filter(livro => favorites.includes(livro.id));
  }, [livros, getFavorites]);

  const recentBooks = useMemo(() => {
    return livros
      .filter(livro => getReadingProgress(livro.id))
      .sort((a, b) => {
        const progressA = getReadingProgress(a.id);
        const progressB = getReadingProgress(b.id);
        
        if (!progressA && progressB) return 1;
        if (progressA && !progressB) return -1;
        if (!progressA && !progressB) return 0;
        
        return new Date(progressB!.ultima_leitura).getTime() - 
               new Date(progressA!.ultima_leitura).getTime();
      })
      .slice(0, 6);
  }, [livros, getReadingProgress]);

  // Open PDF viewer
  function handleOpenPDF(livro: LivroJuridico) {
    console.log("Opening PDF:", livro);
    setSelectedBook(livro);
    
    // Reset PDF ready state
    setIsPDFReady(false);
    
    // Start preloading the PDF viewer
    const img = new Image();
    if (livro.capa_url) {
      img.src = livro.capa_url;
    }
    
    // Mark PDF as ready after a small delay
    setTimeout(() => {
      setIsPDFReady(true);
    }, 200);
  }
  
  // Close PDF viewer
  function handleClosePDF() {
    setSelectedBook(null);
    setIsPDFReady(false);
  }

  // Get the number of books in progress
  const booksInProgressCount = useMemo(() => {
    return livros.filter(livro => {
      const progress = getReadingProgress(livro.id);
      return progress && progress.pagina_atual > 1;
    }).length;
  }, [livros, getReadingProgress]);

  return (
    <JuridicalBackground variant="books" opacity={0.03}>
      <Container size="xl" className="py-6">
        {/* Hero Section */}
        <BibliotecaHeroSection 
          totalBooks={livros.length} 
          inProgressCount={booksInProgressCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="space-y-8 mt-8">
          {/* Navigation and View Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-4">
            <Tabs 
              defaultValue={currentTab}
              value={currentTab}
              onValueChange={setCurrentTab}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-4 sm:grid-cols-7 w-full">
                <TabsTrigger value="todos" className="text-xs sm:text-sm">
                  <Book className="h-4 w-4 mr-1.5 hidden sm:inline" /> 
                  Todos
                </TabsTrigger>
                
                <TabsTrigger value="favoritos" className="text-xs sm:text-sm">
                  <Bookmark className="h-4 w-4 mr-1.5 hidden sm:inline" /> 
                  Favoritos
                </TabsTrigger>
                
                <TabsTrigger value="recentes" className="text-xs sm:text-sm">
                  <Clock className="h-4 w-4 mr-1.5 hidden sm:inline" /> 
                  Recentes
                </TabsTrigger>
                
                {categorias.slice(0, 4).map((categoria) => (
                  <TabsTrigger 
                    key={categoria} 
                    value={categoria.toLowerCase()}
                    className="text-xs sm:text-sm"
                  >
                    {categoria === "Doutrinas" ? (
                      <Book className="h-4 w-4 mr-1.5 hidden sm:inline" />
                    ) : categoria === "Leis" ? (
                      <FileText className="h-4 w-4 mr-1.5 hidden sm:inline" />
                    ) : (
                      <BookOpen className="h-4 w-4 mr-1.5 hidden sm:inline" />
                    )}
                    {categoria}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            {/* View mode toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div>
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-8">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-40" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="livros" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="livros">Biblioteca</TabsTrigger>
                  <TabsTrigger value="categorias">Categorias</TabsTrigger>
                  <TabsTrigger value="estatisticas">Meu Progresso</TabsTrigger>
                </TabsList>
                
                <TabsContent value="livros" className="space-y-8">
                  {filteredLivros.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Book className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Nenhum livro encontrado</h3>
                      <p className="text-muted-foreground max-w-md">
                        {searchQuery 
                          ? "Não encontramos nenhum livro correspondente aos seus critérios de busca."
                          : currentTab === 'favoritos'
                            ? "Você ainda não adicionou nenhum livro aos favoritos."
                            : "Não há livros disponíveis nesta categoria."}
                      </p>
                      
                      {(currentTab !== 'todos' || searchQuery) && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => {
                            setCurrentTab('todos');
                            setSearchQuery('');
                          }}
                        >
                          Ver todos os livros
                        </Button>
                      )}
                    </div>
                  ) : viewMode === 'grid' ? (
                    <Suspense fallback={<BibliotecaBookGrid books={filteredLivros.slice(0, 12)} onSelectBook={handleOpenPDF} />}>
                      <LazyBookGrid books={filteredLivros} onSelectBook={handleOpenPDF} />
                    </Suspense>
                  ) : (
                    <BibliotecaBookList books={filteredLivros} onSelectBook={handleOpenPDF} />
                  )}
                  
                  {/* Featured Collections */}
                  {currentTab === 'todos' && !searchQuery && (
                    <div className="space-y-12 pt-8 border-t">
                      {recentBooks.length > 0 && (
                        <Suspense fallback={<LoadingFallback />}>
                          <LazyKindleBookCarousel
                            title="Continue Lendo"
                            description="Retome suas leituras de onde parou"
                            books={recentBooks}
                            onSelectBook={handleOpenPDF}
                            accent={true}
                          />
                        </Suspense>
                      )}
                      
                      {favoriteBooks.length > 0 && (
                        <Suspense fallback={<LoadingFallback />}>
                          <LazyKindleBookCarousel
                            title="Seus Favoritos"
                            description="Livros que você marcou como favoritos"
                            books={favoriteBooks}
                            onSelectBook={handleOpenPDF}
                            accent={false}
                          />
                        </Suspense>
                      )}
                      
                      {/* Categories carousels - load only one at a time */}
                      {Object.entries(booksByCategory)
                        .filter(([category]) => category !== 'Outros')
                        .slice(0, 2) // Limit initial categories to 2
                        .map(([category, books]) => (
                          <Suspense key={category} fallback={<LoadingFallback />}>
                            <LazyKindleBookCarousel
                              title={category}
                              books={books}
                              onSelectBook={handleOpenPDF}
                            />
                          </Suspense>
                        ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="categorias">
                  <BibliotecaCategoryGrid 
                    categories={categorias} 
                    bookCounts={categorias.reduce((acc, cat) => {
                      acc[cat] = livros.filter(l => l.categoria === cat).length;
                      return acc;
                    }, {} as Record<string, number>)}
                    onSelectCategory={(cat) => setCurrentTab(cat.toLowerCase())}
                  />
                </TabsContent>
                
                <TabsContent value="estatisticas">
                  <BibliotecaReadingStats books={livros} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
        
        {/* PDF Viewer - use lazy loaded optimized version */}
        <AnimatePresence mode="wait">
          {selectedBook && (
            <Suspense fallback={
              <BibliotecaPDFViewer
                pdfUrl={selectedBook.pdf_url}
                bookTitle={selectedBook.titulo}
                onClose={handleClosePDF}
                book={selectedBook}
              />
            }>
              <LazyOptimizedPDFViewer
                pdfUrl={selectedBook.pdf_url}
                bookTitle={selectedBook.titulo}
                onClose={handleClosePDF}
                book={selectedBook}
              />
            </Suspense>
          )}
        </AnimatePresence>
      </Container>
    </JuridicalBackground>
  );
}
