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
import { useSugestoes } from '@/hooks/use-biblioteca-juridica'; 
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Dialog } from '@/components/ui/dialog';
import { BibliotecaBookModal } from '@/components/biblioteca-juridica/BibliotecaBookModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, BookOpen, BookPlus } from 'lucide-react';

export default function BibliotecaJuridica() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { sugestoes } = useSugestoes();
  const isMobile = useIsMobile();

  // Fetch all legal books from bibliotecatop table
  const { data: livros, isLoading, error } = useQuery({
    queryKey: ['biblioteca-juridica-top'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('bibliotecatop')
          .select('*');
        
        if (error) throw error;

        // Transform to match LivroJuridico type
        return data.map(item => ({
          id: item.id.toString(),
          titulo: item.titulo || 'Sem título',
          categoria: item.categoria || 'Geral',
          pdf_url: item.pdf_url || '',
          capa_url: item.capa_url || null,
          descricao: item.descricao || null,
          total_paginas: item.total_paginas ? parseInt(item.total_paginas) : null
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

        {sugestoes && sugestoes.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center">
              Recomendado Para Você
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                (Baseado em seus interesses)
              </span>
            </h2>
            <BibliotecaGridView 
              books={sugestoes} 
              onSelectBook={handleSelectBook}
              showBadge
            />
          </>
        )}
      </div>

      <Dialog open={showBookModal} onOpenChange={setShowBookModal}>
        <BibliotecaBookModal 
          book={selectedBook}
          onClose={handleCloseModal}
          onReadBook={handleOpenBook}
        />
      </Dialog>
    </PageTransition>
  );
}
