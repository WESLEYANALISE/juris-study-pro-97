
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BibliotecaPDFViewer } from '@/components/biblioteca-juridica/BibliotecaPDFViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Book, BookOpen, FileText, LibraryBig } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { LivroJuridico } from '@/types/biblioteca-juridica';

// Define interface for our application's internal book type
interface Livro {
  id: string; // Changed from number to string to match the database
  titulo: string;
  categoria: string;
  pdf_url: string;
  capa_url: string | null;
  descricao: string | null;
  total_paginas: number | null;
}

export default function BibliotecaJuridica() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('todos');

  const { user } = useAuth();
  
  // Fetch books from Supabase
  useEffect(() => {
    async function fetchLivros() {
      setIsLoading(true);

      try {
        // Get books from our library
        const { data, error } = await supabase
          .from('biblioteca_juridica10') // Using the table name
          .select('*');

        if (error) {
          toast.error('Erro ao carregar biblioteca: ' + error.message);
          throw error;
        }

        if (data && Array.isArray(data)) {
          console.log('Livros carregados:', data.length);
          
          // Convert the data to our Livro type
          const convertedData: Livro[] = data.map(item => ({
            id: item.id,
            titulo: item.titulo,
            categoria: item.categoria,
            pdf_url: item.pdf_url,
            capa_url: item.capa_url,
            descricao: item.descricao,
            total_paginas: item.total_paginas
          }));
          
          setLivros(convertedData);
          
          // Extract categories
          const allCategories = Array.from(
            new Set(data.map((livro) => livro.categoria))
          ).filter(Boolean) as string[];
          
          setCategorias(allCategories);
        } else {
          setLivros([]);
          setCategorias([]);
        }
      } catch (error) {
        console.error('Erro ao buscar livros:', error);
        toast.error('Erro ao carregar a biblioteca');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLivros();
  }, []);

  // Get filtered books based on category and search query
  const filteredLivros = useMemo(() => {
    let result = [...livros];
    
    // Filter by category if one is selected
    if (selectedCategoria) {
      result = result.filter(livro => livro.categoria === selectedCategoria);
    }
    
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
      result = result.filter(livro => livro.categoria.toLowerCase() === currentTab.toLowerCase());
    }
    
    return result;
  }, [livros, selectedCategoria, searchQuery, currentTab]);

  function handleOpenPDF(livro: Livro) {
    console.log("Opening PDF:", livro);
    // Convert Livro to LivroJuridico when passing to PDF viewer
    const livroJuridico: LivroJuridico = {
      id: livro.id,
      titulo: livro.titulo,
      categoria: livro.categoria,
      pdf_url: livro.pdf_url,
      capa_url: livro.capa_url,
      descricao: livro.descricao || undefined,
      total_paginas: livro.total_paginas || undefined
    };
    setSelectedBook(livroJuridico);
  }
  
  function handleClosePDF() {
    setSelectedBook(null);
  }

  return (
    <JuridicalBackground variant="books" opacity={0.05}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <motion.h1 
                className="text-3xl font-bold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Biblioteca Jurídica
              </motion.h1>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Explore nossa coleção de livros e documentos jurídicos
              </motion.p>
            </div>
            
            <motion.div 
              className="relative w-full md:w-64"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search h-4 w-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <Input 
                placeholder="Buscar livros..." 
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>

          {/* Categorias em abas */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="w-full overflow-x-auto pb-2"
          >
            <Tabs 
              defaultValue="todos" 
              className="w-full"
              value={currentTab}
              onValueChange={setCurrentTab}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="todos" className="min-w-fit">
                  <LibraryBig className="mr-1 h-4 w-4" />
                  Todos
                </TabsTrigger>
                
                {categorias.slice(0, 5).map((categoria) => (
                  <TabsTrigger 
                    key={categoria} 
                    value={categoria.toLowerCase()}
                    className="min-w-fit"
                  >
                    {categoria === "Doutrinas" ? (
                      <Book className="mr-1 h-4 w-4" />
                    ) : categoria === "Leis" ? (
                      <FileText className="mr-1 h-4 w-4" />
                    ) : (
                      <BookOpen className="mr-1 h-4 w-4" />
                    )}
                    {categoria}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Main content area */}
              <TabsContent value="todos" className="mt-0">
                <BookGrid 
                  livros={filteredLivros} 
                  isLoading={isLoading} 
                  onOpenBook={handleOpenPDF}
                />
              </TabsContent>
              
              {/* Category specific content */}
              {categorias.map((categoria) => (
                <TabsContent 
                  key={categoria} 
                  value={categoria.toLowerCase()}
                  className="mt-0"
                >
                  <BookGrid 
                    livros={filteredLivros} 
                    isLoading={isLoading} 
                    onOpenBook={handleOpenPDF}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
        
        {/* PDF Viewer */}
        <AnimatePresence>
          {selectedBook && (
            <BibliotecaPDFViewer
              pdfUrl={selectedBook.pdf_url}
              bookTitle={selectedBook.titulo}
              onClose={handleClosePDF}
              book={selectedBook}
            />
          )}
        </AnimatePresence>
      </div>
    </JuridicalBackground>
  );
}

interface BookGridProps {
  livros: Livro[];
  isLoading: boolean;
  onOpenBook: (livro: Livro) => void;
}

const BookGrid: React.FC<BookGridProps> = ({ livros, isLoading, onOpenBook }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <BookSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (livros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Book className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nenhum livro encontrado</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Não encontramos nenhum livro correspondente aos seus critérios de busca.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {livros.map((livro, index) => (
        <motion.div
          key={livro.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="book-card"
        >
          <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-primary" onClick={() => onOpenBook(livro)}>
            <div className="aspect-[3/4] relative overflow-hidden bg-muted">
              {livro.capa_url ? (
                <img
                  src={livro.capa_url}
                  alt={livro.titulo}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/book-placeholder.png';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
                  <div className="text-center">
                    <Book className="h-12 w-12 mx-auto mb-2 text-primary/60" />
                    <h3 className="font-medium text-sm line-clamp-3">{livro.titulo}</h3>
                  </div>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <Badge variant="outline" className="mb-2">
                {livro.categoria}
              </Badge>
              <h3 className="font-semibold line-clamp-2 mb-1">{livro.titulo}</h3>
              <p className="text-xs text-muted-foreground">
                {livro.total_paginas ? `${livro.total_paginas} páginas` : 'Sem informação de páginas'}
              </p>
              
              <Button variant="default" size="sm" className="w-full mt-3">
                <BookOpen className="mr-2 h-4 w-4" />
                Ler agora
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

const BookSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden h-full">
      <div className="aspect-[3/4] bg-muted animate-pulse" />
      <CardContent className="p-4">
        <div className="h-5 w-16 bg-muted animate-pulse rounded mb-2" />
        <div className="h-6 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded mb-4" />
        <div className="h-8 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
};
