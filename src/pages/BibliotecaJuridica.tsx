import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition } from '@/components/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BibliotecaHeader } from '@/components/biblioteca-juridica/BibliotecaHeader';
import { BibliotecaListView } from '@/components/biblioteca-juridica/BibliotecaListView';
import { BibliotecaGridView } from '@/components/biblioteca-juridica/BibliotecaGridView';
import { BibliotecaFavoritos } from '@/components/biblioteca-juridica/BibliotecaFavoritos';
import { BibliotecaRecentes } from '@/components/biblioteca-juridica/BibliotecaRecentes';
import { BibliotecaPDFViewer } from '@/components/biblioteca-juridica/BibliotecaPDFViewer';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Dialog } from '@/components/ui/dialog';
import { BibliotecaBookModal } from '@/components/biblioteca-juridica/BibliotecaBookModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, BookOpen, BookPlus } from 'lucide-react';

// Mock data for development
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fetch books from biblioteca_juridica10 table
  const { data: livros, isLoading, error } = useQuery({
    queryKey: ['biblioteca-juridica'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('biblioteca_juridica10')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        return data.map(item => ({
          id: item.id,
          titulo: item.titulo,
          categoria: item.categoria,
          subcategoria: item.subcategoria,
          autor: item.autor,
          pdf_url: item.pdf_url,
          capa_url: item.capa_url,
          descricao: item.descricao,
          total_paginas: item.total_paginas,
          data_publicacao: item.data_publicacao
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

  // Filter books based on search and category
  const filteredBooks = React.useMemo(() => {
    if (!livros) return [];
    
    return livros.filter(book => {
      const matchesSearch = !searchTerm || 
        book.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.autor && book.autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (book.descricao && book.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || book.categoria === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [livros, searchTerm, selectedCategory]);

  // Extract categories from books
  const categories = React.useMemo(() => {
    if (!livros) return [];
    
    const uniqueCategories = new Set(livros.map(book => book.categoria));
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

  // Handle file URL construction
  const getBucketFileUrl = (fileName: string) => {
    return `${import.meta.env.VITE_SUPABASE_URL || "https://phzcazcyjhlmdchcjagy.supabase.co"}/storage/v1/object/public/agoravai/${fileName}`;
  };

  if (selectedBook && !showBookModal) {
    return (
      <BibliotecaPDFViewer 
        livro={{
          id: selectedBook.id,
          nome: selectedBook.titulo,
          pdf: selectedBook.pdf_url.startsWith('http') ? selectedBook.pdf_url : getBucketFileUrl(selectedBook.pdf_url),
          capa_url: selectedBook.capa_url || undefined
        }} 
        onClose={() => setSelectedBook(null)} 
      />
    );
  }

  return (
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

        <Tabs defaultValue="todos" className="mt-6">
          <div className="relative overflow-auto pb-1">
            <TabsList className="mb-6 flex-wrap inline-flex w-auto max-w-full">
              <TabsTrigger value="todos" onClick={() => setSelectedCategory(null)}>
                Todos
              </TabsTrigger>
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="todos" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : filteredBooks.length > 0 ? (
              viewMode === 'grid' ? (
                <BibliotecaGridView 
                  books={filteredBooks} 
                  onSelectBook={handleSelectBook}
                />
              ) : (
                <BibliotecaListView 
                  books={filteredBooks} 
                  onSelectBook={handleSelectBook}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-xl font-semibold">Nenhum livro encontrado</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  Não encontramos livros correspondentes à sua busca. Tente ajustar os critérios de pesquisa.
                </p>
              </div>
            )}
          </TabsContent>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
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
            </TabsContent>
          ))}
        </Tabs>

        {user && (
          <>
            <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center">
              Seus Favoritos
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                (Livros que você marcou como favoritos)
              </span>
            </h2>
            <BibliotecaFavoritos onSelectBook={handleSelectBook} />
            
            <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center">
              Recentemente Visualizados
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                (Últimos livros que você acessou)
              </span>
            </h2>
            <BibliotecaRecentes onSelectBook={handleSelectBook} />
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
