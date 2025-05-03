import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition } from '@/components/PageTransition';
import { BibliotecaPDFViewer } from '@/components/biblioteca-juridica/BibliotecaPDFViewer';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { BibliotecaBookModal } from '@/components/biblioteca-juridica/BibliotecaBookModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, Search } from 'lucide-react';

// Import our Kindle-style components
import { KindleBookCarousel } from '@/components/biblioteca-juridica/KindleBookCarousel';
import { KindleCategoryPills } from '@/components/biblioteca-juridica/KindleCategoryPills';
import { KindleCategoryCards } from '@/components/biblioteca-juridica/KindleCategoryCards';
import { KindleMobileNavigation } from '@/components/biblioteca-juridica/KindleMobileNavigation';

// Import styles
import '../styles/biblioteca-juridica.css';

// Mock data is kept for fallback
const mockLivros: LivroJuridico[] = [
  {
    id: '1',
    titulo: 'Código Civil Comentado',
    categoria: 'Direito Civil',
    pdf_url: '/sample.pdf',
    capa_url: '/placeholder-book-cover.png',
    descricao: 'Comentários e análises sobre o Código Civil',
    total_paginas: 540
  },
  {
    id: '2',
    titulo: 'Manual de Direito Penal',
    categoria: 'Direito Penal',
    pdf_url: '/sample.pdf',
    capa_url: '/placeholder-book-cover.png',
    descricao: 'Guia completo sobre direito penal',
    total_paginas: 320
  },
  {
    id: '3',
    titulo: 'Direito Constitucional',
    categoria: 'Direito Constitucional',
    pdf_url: '/sample.pdf',
    capa_url: '/placeholder-book-cover.png',
    descricao: 'Estudo sobre direito constitucional',
    total_paginas: 480
  },
  {
    id: '4',
    titulo: 'Direito Administrativo',
    categoria: 'Direito Administrativo',
    pdf_url: '/sample.pdf',
    capa_url: '/placeholder-book-cover.png',
    descricao: 'Compêndio de direito administrativo',
    total_paginas: 410
  }
];

// Mock suggestions
const mockSugestoes: LivroJuridico[] = [
  {
    id: '5',
    titulo: 'Direito Tributário',
    categoria: 'Direito Tributário',
    pdf_url: '/sample.pdf',
    capa_url: '/placeholder-book-cover.png',
    descricao: 'Guia completo de direito tributário',
    total_paginas: 380
  },
  {
    id: '6',
    titulo: 'Direito do Trabalho',
    categoria: 'Direito Trabalhista',
    pdf_url: '/sample.pdf',
    capa_url: '/placeholder-book-cover.png',
    descricao: 'Manual de direito trabalhista',
    total_paginas: 290
  }
];

export default function BibliotecaJuridica() {
  // State declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fetch books from bibliotecatop table
  const { data: livros, isLoading, error } = useQuery({
    queryKey: ['biblioteca-juridica-top'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('bibliotecatop')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        return data.map(item => ({
          id: item.id.toString(),
          titulo: item.titulo,
          categoria: item.categoria,
          pdf_url: item.pdf_url,
          capa_url: item.capa_url,
          descricao: item.descricao,
          total_paginas: typeof item.total_paginas === 'string' ? parseInt(item.total_paginas, 10) : item.total_paginas
        })) as LivroJuridico[];
      } catch (err) {
        console.error('Error fetching books:', err);
        toast({
          title: 'Erro ao carregar biblioteca',
          description: 'Não foi possível carregar os livros. Por favor, tente novamente.',
          variant: 'destructive'
        });
        return mockLivros; // Use mock data as fallback
      }
    }
  });

  // Track recently viewed books (mock implementation)
  const [recentlyViewed, setRecentlyViewed] = useState<LivroJuridico[]>([]);
  
  // Populate recently viewed with some random books for demo
  useEffect(() => {
    if (livros && livros.length) {
      const randomBooks = [...livros]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      setRecentlyViewed(randomBooks);
    }
  }, [livros]);

  // Filter books based on search and category
  const filteredBooks = React.useMemo(() => {
    const books = livros || [];
    
    if (!searchTerm && !selectedCategory) return books;
    
    return books.filter(book => {
      const matchesSearch = !searchTerm || 
        (book.titulo && book.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (book.categoria && book.categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (book.descricao && book.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || book.categoria === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [livros, searchTerm, selectedCategory]);

  // Extract categories from books
  const categories = React.useMemo(() => {
    const books = livros || [];
    
    const uniqueCategories = new Set(books
      .filter(book => book.categoria)
      .map(book => book.categoria));
    return Array.from(uniqueCategories);
  }, [livros]);

  // Group books by category
  const booksByCategory = React.useMemo(() => {
    const books = livros || [];
    const result: Record<string, LivroJuridico[]> = {};
    
    categories.forEach(category => {
      result[category] = books.filter(book => book.categoria === category);
    });
    
    return result;
  }, [livros, categories]);

  // Recommended books (simulated based on categories)
  const recommendedBooks = React.useMemo(() => {
    if (!livros) return [];
    
    // Get books from a random category or two
    const randomCategories = [...categories]
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
      
    return livros.filter(book => 
      randomCategories.includes(book.categoria!)
    ).slice(0, 10);
  }, [livros, categories]);

  // Handle opening a book modal
  const handleSelectBook = (book: LivroJuridico) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  // Handle closing the book modal
  const handleCloseModal = () => {
    setShowBookModal(false);
  };

  // Handle opening a book for reading
  const handleOpenBook = () => {
    if (!selectedBook) return;
    setShowBookModal(false);
    // We'll keep the selected book state for the PDF viewer
  };

  // Handle file URL construction
  const getBucketFileUrl = (fileName: string) => {
    if (!fileName) return '';
    if (fileName.startsWith('http')) return fileName;
    
    return `${import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co"}/storage/v1/object/public/agoravai/${fileName}`;
  };

  // Handle tab change 
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'search') {
      // Focus search input when selecting search tab
      const searchInput = document.getElementById('kindle-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  // Render the component based on conditions
  if (selectedBook && !showBookModal) {
    return (
      <BibliotecaPDFViewer 
        livro={{
          id: selectedBook.id,
          nome: selectedBook.titulo,
          pdf: getBucketFileUrl(selectedBook.pdf_url),
          capa_url: selectedBook.capa_url ? getBucketFileUrl(selectedBook.capa_url) : undefined
        }} 
        onClose={() => setSelectedBook(null)} 
      />
    );
  }

  return (
    <PageTransition>
      <div className="kindle-container min-h-screen pb-20 md:pb-8">
        <div className="container max-w-7xl mx-auto py-4 px-4 md:px-6">
          {/* Search input always visible at top */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="kindle-search-input"
              placeholder="Pesquisar livros..."
              className="pl-10 bg-gray-800/50 border-gray-700 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-amber-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-semibold">Erro ao carregar livros</h3>
              <p className="text-gray-400 max-w-md mt-2">
                Ocorreu um erro ao tentar carregar os livros. Por favor, tente novamente mais tarde.
              </p>
            </div>
          ) : (
            <div className="kindle-like-carousel space-y-6">
              {/* Category Pills at top */}
              <KindleCategoryPills
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />

              {/* Show filtered books if search or category is active */}
              {(searchTerm || selectedCategory) ? (
                <KindleBookCarousel 
                  title={selectedCategory || "Resultados da pesquisa"} 
                  books={filteredBooks}
                  onSelectBook={handleSelectBook}
                  label={filteredBooks.length > 0 ? 
                    `${filteredBooks.length} livros encontrados` : 
                    "Nenhum livro encontrado"}
                />
              ) : (
                <>
                  {/* Para Você section */}
                  <KindleBookCarousel
                    title="Para você"
                    books={recommendedBooks}
                    onSelectBook={handleSelectBook}
                    onViewAll={() => {}}
                  />
                  
                  {/* Recently viewed section */}
                  {recentlyViewed.length > 0 && (
                    <KindleBookCarousel
                      title="Lidos recentemente"
                      books={recentlyViewed}
                      onSelectBook={handleSelectBook}
                    />
                  )}
                  
                  {/* Category cards for navigation */}
                  <KindleCategoryCards
                    categories={categories}
                    booksByCategory={booksByCategory}
                    onSelectCategory={(category) => setSelectedCategory(category)}
                  />
                  
                  {/* Popular books section */}
                  <KindleBookCarousel
                    title="Populares"
                    books={livros?.slice(0, 10) || []}
                    onSelectBook={handleSelectBook}
                    onViewAll={() => {}}
                  />
                </>
              )}
            </div>
          )}
          
          {/* Mobile Navigation Bar */}
          <KindleMobileNavigation 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        <Dialog open={showBookModal} onOpenChange={setShowBookModal}>
          <BibliotecaBookModal 
            book={selectedBook}
            onClose={handleCloseModal}
            onReadBook={handleOpenBook}
          />
        </Dialog>
      </div>
    </PageTransition>
  );
}
