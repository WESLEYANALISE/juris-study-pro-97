
import React, { useState, useEffect } from 'react';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { KindleBookCarousel } from '@/components/biblioteca-juridica/KindleBookCarousel';
import { KindleCategoryPills } from '@/components/biblioteca-juridica/KindleCategoryPills';
import { KindleCategoryCards } from '@/components/biblioteca-juridica/KindleCategoryCards';
import { BibliotecaPDFViewer } from '@/components/biblioteca-juridica/BibliotecaPDFViewer';
import { EnhancedPDFViewer } from '@/components/biblioteca-juridica/EnhancedPDFViewer';
import { BibliotecaStyledHeader } from '@/components/biblioteca-juridica/BibliotecaStyledHeader';
import { BibliotecaListView } from '@/components/biblioteca-juridica/BibliotecaListView';
import { BibliotecaViewToggle } from '@/components/biblioteca-juridica/BibliotecaViewToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LivroJuridico } from '@/types/biblioteca-juridica';

import '../styles/biblioteca-juridica.css';

// Define the CategoryBiblioteca type since it's being used
interface CategoriaBiblioteca {
  id: string;
  nome: string;
  descricao?: string;
  imagem_url?: string;
  contador_livros?: number;
}

// Define props interfaces for components that are causing errors
interface KindleCategoryPillsProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

interface KindleCategoryCardsProps {
  categories: string[];
  booksByCategory: Record<string, LivroJuridico[]>;
  onSelectCategory: (category: string) => void;
}

interface BibliotecaStyledHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  isMobile: boolean;
  totalBooks: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BibliotecaJuridica() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentBook, setCurrentBook] = useState<LivroJuridico | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('categorias');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [useEnhancedViewer, setUseEnhancedViewer] = useState(true);
  
  // State for books
  const [recentBooks, setRecentBooks] = useState<LivroJuridico[]>([]);
  const [popularBooks, setPopularBooks] = useState<LivroJuridico[]>([]);
  const [categorias, setCategorias] = useState<CategoriaBiblioteca[]>([]);
  const [allBooks, setAllBooks] = useState<LivroJuridico[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<LivroJuridico[]>([]);
  const [booksByCategory, setBooksByCategory] = useState<Record<string, LivroJuridico[]>>({});
  
  // Effect to filter books based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(allBooks);
      return;
    }
    
    const filtered = allBooks.filter(book => 
      book.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.autor && book.autor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.descricao && book.descricao.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredBooks(filtered);
  }, [searchQuery, allBooks]);
  
  useEffect(() => {
    async function fetchBibliotecaData() {
      setIsLoading(true);
      try {
        // Fetch books
        const { data: booksData, error: booksError } = await supabase
          .from('biblioteca_juridica')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (booksError) throw booksError;
        
        // Transform the data to match LivroJuridico type
        const transformedBooks: LivroJuridico[] = booksData?.map(book => ({
          id: book.id.toString(),
          titulo: book.livro || 'Sem título',
          autor: '',
          categoria: book.area || 'Geral',
          descricao: book.sobre || '',
          capa_url: book.imagem || null,
          pdf_url: book.link || '',
          data_publicacao: book.created_at,
          created_at: book.created_at
        })) || [];
        
        setAllBooks(transformedBooks);
        setFilteredBooks(transformedBooks);
        
        // Set recent books (latest 10)
        setRecentBooks(transformedBooks.slice(0, 10));
        
        // Set popular books (random 10 for demo)
        const shuffled = [...transformedBooks].sort(() => 0.5 - Math.random());
        setPopularBooks(shuffled.slice(0, 10));
        
        // Group books by category
        const booksCategoryMap: Record<string, LivroJuridico[]> = {};
        const uniqueCategories: CategoriaBiblioteca[] = [];
        
        transformedBooks.forEach(book => {
          if (!booksCategoryMap[book.categoria]) {
            booksCategoryMap[book.categoria] = [];
            uniqueCategories.push({
              id: book.categoria,
              nome: book.categoria,
              contador_livros: 1
            });
          } else {
            const catIndex = uniqueCategories.findIndex(c => c.nome === book.categoria);
            if (catIndex >= 0 && uniqueCategories[catIndex].contador_livros) {
              uniqueCategories[catIndex].contador_livros! += 1;
            }
          }
          booksCategoryMap[book.categoria].push(book);
        });
        
        setCategorias(uniqueCategories);
        setBooksByCategory(booksCategoryMap);
        
      } catch (error) {
        console.error('Error fetching biblioteca data:', error);
        toast.error('Erro ao carregar a biblioteca jurídica');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBibliotecaData();
  }, []);
  
  function handleSelectBook(book: LivroJuridico) {
    if (book.pdf_url) {
      setCurrentBook(book);
      setPdfUrl(book.pdf_url);
      // Add to body class to trigger mobile navigation hiding
      document.body.classList.add('pdf-viewer-open');
    } else {
      toast.error('Este livro não possui PDF disponível');
    }
  }
  
  function handleClosePdf() {
    setPdfUrl(null);
    setCurrentBook(null);
    // Remove from body class to show mobile navigation again
    document.body.classList.remove('pdf-viewer-open');
  }

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      setFilteredBooks(allBooks.filter(book => book.categoria === category));
    } else {
      setFilteredBooks(allBooks);
    }
  };

  return (
    <JuridicalBackground variant="scales" opacity={0.03}>
      {pdfUrl ? (
        useEnhancedViewer ? (
          <EnhancedPDFViewer 
            pdfUrl={pdfUrl} 
            onClose={handleClosePdf} 
            bookTitle={currentBook?.titulo || ''} 
            book={currentBook}
          />
        ) : (
          <BibliotecaPDFViewer 
            pdfUrl={pdfUrl} 
            onClose={handleClosePdf} 
            bookTitle={currentBook?.titulo || ''} 
            book={currentBook}
          />
        )
      ) : (
        <div className="container mx-auto pb-24 md:pb-6 px-4">
          <BibliotecaStyledHeader 
            searchTerm={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isMobile={window.innerWidth < 768}
            totalBooks={filteredBooks.length}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por título, autor ou área do direito..." 
                className="pl-10 shadow-md focus:shadow-lg transition-shadow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="categorias" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="shadow-md">
                <TabsTrigger value="categorias">Categorias</TabsTrigger>
                <TabsTrigger value="recentes">Recentes</TabsTrigger>
                <TabsTrigger value="populares">Mais lidos</TabsTrigger>
                <TabsTrigger value="todos">Todos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="categorias" className="mt-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <KindleCategoryPills 
                    categories={categorias.map(cat => cat.nome)} 
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleCategorySelect}
                  />
                  <KindleCategoryCards 
                    categories={categorias.map(cat => cat.nome)}
                    booksByCategory={booksByCategory}
                    onSelectCategory={(category) => handleCategorySelect(category)}
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="recentes" className="mt-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <KindleBookCarousel
                    title="Adicionados recentemente"
                    books={recentBooks}
                    onSelectBook={handleSelectBook}
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="populares" className="mt-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <KindleBookCarousel
                    title="Mais populares"
                    books={popularBooks}
                    onSelectBook={handleSelectBook}
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="todos" className="mt-4">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BibliotecaViewToggle 
                      view={viewMode} 
                      onViewChange={setViewMode} 
                      totalBooks={filteredBooks.length}
                    />
                    
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 gap-y-8">
                        <KindleBookCarousel
                          title="Todos os livros"
                          books={filteredBooks}
                          onSelectBook={handleSelectBook}
                        />
                      </div>
                    ) : (
                      <BibliotecaListView 
                        books={filteredBooks} 
                        onSelectBook={handleSelectBook} 
                      />
                    )}
                    
                    {filteredBooks.length === 0 && searchQuery && (
                      <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-2">Nenhum livro encontrado</h3>
                        <p className="text-muted-foreground mb-6">
                          Não encontramos nenhum livro para "{searchQuery}". Tente outros termos.
                        </p>
                        <Button onClick={() => setSearchQuery('')}>
                          Limpar busca
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      )}
    </JuridicalBackground>
  );
}
