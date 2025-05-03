import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition } from '@/components/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BibliotecaHeader } from '@/components/biblioteca-juridica/BibliotecaHeader';
import { BibliotecaGridView } from '@/components/biblioteca-juridica/BibliotecaGridView';
import { BibliotecaListView } from '@/components/biblioteca-juridica/BibliotecaListView';
import { BibliotecaFavoritos } from '@/components/biblioteca-juridica/BibliotecaFavoritos';
import { BibliotecaRecentes } from '@/components/biblioteca-juridica/BibliotecaRecentes';
import { BibliotecaPDFViewer } from '@/components/biblioteca-juridica/BibliotecaPDFViewer';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Dialog } from '@/components/ui/dialog';
import { BibliotecaBookModal } from '@/components/biblioteca-juridica/BibliotecaBookModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, BookOpen, Book } from 'lucide-react';

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
  // State declarations - make sure all hooks are called unconditionally
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
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
        return [];
      }
    }
  });

  // Filter books based on search and category - always call this hook
  const filteredBooks = React.useMemo(() => {
    // Default to empty array if livros is undefined
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

  // Extract categories from books - always call this hook
  const categories = React.useMemo(() => {
    const books = livros || [];
    
    const uniqueCategories = new Set(books
      .filter(book => book.categoria)
      .map(book => book.categoria));
    return Array.from(uniqueCategories);
  }, [livros]);

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

  // Handle file URL construction - specifically using the agoravai bucket
  const getBucketFileUrl = (fileName: string) => {
    if (!fileName) return '';
    if (fileName.startsWith('http')) return fileName;
    
    return `${import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co"}/storage/v1/object/public/agoravai/${fileName}`;
  };

  // Organize books by sections - always call this hook
  const sections = React.useMemo(() => {
    const books = livros || [];
    
    if (books.length === 0) return [];

    // Create sections based on categories or other criteria
    const areas = Array.from(new Set(books.filter(book => book.categoria).map(book => book.categoria)));
    
    return areas.map(area => ({
      title: area,
      description: `Livros da área de ${area}`,
      books: books.filter(book => book.categoria === area).slice(0, 6)
    }));
  }, [livros]);

  // Display the PDF viewer when a book is selected - move this logic outside the return
  let content;
  if (selectedBook && !showBookModal) {
    content = (
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
  } else {
    content = (
      <PageTransition>
        <div className="container max-w-7xl mx-auto py-6 px-4 md:px-6">
          <BibliotecaHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isMobile={isMobile}
            totalBooks={livros?.length || 0}
            categoriesCount={categories.length}
          />

          {/* Hero section with stats */}
          <div className="mt-8 mb-10">
            <h1 className="text-3xl font-bold text-amber-400">ÁREAS DO DIREITO</h1>
            <p className="text-xl mt-2">
              Mais de <span className="font-bold">{livros?.length || 0} livros de Direito</span> atualizados para aprimorar seus estudos!
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-16 w-16 text-destructive opacity-30 mb-4" />
              <h3 className="text-xl font-semibold">Erro ao carregar livros</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Ocorreu um erro ao tentar carregar os livros. Por favor, tente novamente mais tarde.
              </p>
            </div>
          ) : (
            // ... keep existing code (the rest of the UI rendering)
            <>
              {/* Categories horizontal scroll like in the image */}
              <div className="overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex gap-4">
                  {categories.map(category => (
                    <div 
                      key={category}
                      className="min-w-[280px] h-[180px] rounded-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                      <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                        <h3 className="text-2xl font-bold uppercase">{category}</h3>
                      </div>
                      <img 
                        src={livros?.find(book => book.categoria === category)?.capa_url || "/placeholder-book-cover.png"} 
                        alt={category}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-book-cover.png";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic section for each category */}
              {sections.map((section, index) => (
                <div key={section.title} className="mt-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-amber-400">{section.title.toUpperCase()}</h2>
                    <button
                      className="text-amber-400 hover:underline"
                      onClick={() => setSelectedCategory(section.title)}
                    >
                      VER TODOS
                    </button>
                  </div>
                  
                  <BibliotecaGridView 
                    books={section.books} 
                    onSelectBook={handleSelectBook}
                    showBadge={index === 0} // Show badges only for the first section
                  />
                </div>
              ))}

              {/* Show all books when a category is selected */}
              {selectedCategory && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6">{selectedCategory.toUpperCase()}</h2>
                  {viewMode === 'grid' ? (
                    <BibliotecaGridView 
                      books={filteredBooks} 
                      onSelectBook={handleSelectBook}
                    />
                  ) : (
                    <BibliotecaListView 
                      books={filteredBooks} 
                      onSelectBook={handleSelectBook}
                    />
                  )}
                </div>
              )}
              
              {/* Special section: ADVOGADO DE ELITE */}
              <div className="mt-16 mb-10">
                <h2 className="text-3xl font-bold text-amber-400">ADVOGADO DE ELITE</h2>
                <p className="text-xl mt-2">
                  Torne-se um advogado de elite com livros essenciais para sua carreira!
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {(livros || []).slice(0, 3).map(book => (
                    <div 
                      key={book.id}
                      className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => handleSelectBook(book)}
                    >
                      <img 
                        src={book.capa_url || "/placeholder-book-cover.png"} 
                        alt={book.titulo}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-book-cover.png";
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          <span className="text-xs">OAB</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User-specific content: favorites and recent */}
              {user && (
                <>
                  <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center text-amber-400">
                    Seus Favoritos
                  </h2>
                  <BibliotecaFavoritos onSelectBook={handleSelectBook} />
                  
                  <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center text-amber-400">
                    Recentemente Visualizados
                  </h2>
                  <BibliotecaRecentes onSelectBook={handleSelectBook} />
                </>
              )}
            </>
          )}

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

  // Return the content determined above
  return content;
}
