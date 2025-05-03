import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Menu, X, Library, BookMarked, Clock, Heart, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CinemaPDFViewer } from '@/components/biblioteca-juridica/CinemaPDFViewer';
import { BookGrid3D } from '@/components/biblioteca-juridica/BookGrid3D';
import { AtheneumBackground, AtheneumTitle, AtheneumCard, AtheneumButton } from '@/components/ui/atheneum-theme';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { useBibliotecaProgresso } from '@/hooks/use-biblioteca-juridica';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

// Define category interface 
interface CategoriaBiblioteca {
  id: string;
  nome: string;
  descricao?: string;
  imagem_url?: string;
  contador_livros?: number;
}

export default function BibliotecaJuridica() {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentBook, setCurrentBook] = useState<LivroJuridico | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('categorias');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // State for books
  const [recentBooks, setRecentBooks] = useState<LivroJuridico[]>([]);
  const [popularBooks, setPopularBooks] = useState<LivroJuridico[]>([]);
  const [progresBooks, setProgressBooks] = useState<LivroJuridico[]>([]);
  const [categorias, setCategorias] = useState<CategoriaBiblioteca[]>([]);
  const [allBooks, setAllBooks] = useState<LivroJuridico[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<LivroJuridico[]>([]);
  const [booksByCategory, setBooksByCategory] = useState<Record<string, LivroJuridico[]>>({});
  const [favoriteBooks, setFavoriteBooks] = useState<LivroJuridico[]>([]);
  
  const { user } = useAuth();
  const { getReadingProgress, isFavorite, toggleFavorite, getFavoriteBooks } = useBibliotecaProgresso();
  
  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Effect to filter books based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(allBooks);
      return;
    }
    
    const filtered = allBooks.filter(book => 
      book.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.autor && book.autor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.descricao && book.descricao.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.categoria && book.categoria.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredBooks(filtered);
  }, [searchQuery, allBooks]);
  
  // Fetch all data
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
          autor: book.area || '', // Use area as author if no author field exists
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
        
        // Set books in progress
        const inProgressBooks = transformedBooks.filter(book => {
          const progress = getReadingProgress(book.id);
          return progress && progress.pagina_atual > 1;
        }).slice(0, 5);
        
        setProgressBooks(inProgressBooks);
        
        // Get favorite books
        const favBooks = getFavoriteBooks().map(
          bookId => transformedBooks.find(book => book.id === bookId)
        ).filter(Boolean) as LivroJuridico[];
        
        setFavoriteBooks(favBooks);
        
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
      setActiveTab('todos');
    } else {
      setFilteredBooks(allBooks);
    }
  };

  return (
    <AtheneumBackground>
      {pdfUrl ? (
        <CinemaPDFViewer 
          pdfUrl={pdfUrl} 
          onClose={handleClosePdf} 
          bookTitle={currentBook?.titulo || ''} 
          book={currentBook}
        />
      ) : (
        <div className="container mx-auto pb-24 px-4 pt-6">
          {/* Hero header with parallax effect */}
          <motion.div 
            className="relative h-64 md:h-80 mb-8 rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Background image with parallax */}
            <div 
              className="absolute inset-0 bg-[url('/library-background.jpg')] bg-cover bg-center"
              style={{ 
                transform: `translateY(${scrollPosition * 0.15}px)` 
              }}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
                Atheneum
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-xl">
                Explore nossa vasta biblioteca jurídica com obras essenciais para sua formação e prática
              </p>
              
              {/* Search bar with glass effect */}
              <div className="relative mt-6 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                <Input 
                  placeholder="Buscar por título, autor ou área do direito..." 
                  className="pl-10 bg-black/30 backdrop-blur-md border-amber-700/30 focus:border-amber-500/50 shadow-lg text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
          
          {/* Mobile menu button */}
          <div className="md:hidden fixed bottom-4 right-4 z-40">
            <Button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="rounded-full h-14 w-14 shadow-lg bg-amber-600 hover:bg-amber-500"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
          
          {/* Mobile sidebar menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div 
                className="fixed inset-y-0 left-0 z-30 w-64 bg-black/90 backdrop-blur-lg border-r border-amber-900/30 md:hidden"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                <div className="p-4">
                  <div className="flex items-center mb-8 pt-4">
                    <Library className="h-6 w-6 text-amber-500 mr-2" />
                    <h2 className="text-xl font-bold text-amber-400">Atheneum</h2>
                  </div>
                  
                  <ScrollArea className="h-[calc(100vh-120px)]">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-amber-500/70 mb-3">Navegação</h3>
                        <div className="space-y-1">
                          {['categorias', 'recentes', 'populares', 'favoritos', 'em_progresso'].map((tab) => (
                            <Button
                              key={tab}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left",
                                activeTab === tab ? "bg-amber-900/20 text-amber-400" : "text-gray-300"
                              )}
                              onClick={() => {
                                setActiveTab(tab);
                                setMenuOpen(false);
                              }}
                            >
                              {{
                                categorias: <BookOpen className="mr-2 h-4 w-4" />,
                                recentes: <Clock className="mr-2 h-4 w-4" />,
                                populares: <BookMarked className="mr-2 h-4 w-4" />,
                                favoritos: <Heart className="mr-2 h-4 w-4" />,
                                em_progresso: <Plus className="mr-2 h-4 w-4" />
                              }[tab]}
                              {tab === 'categorias' ? 'Categorias' : 
                               tab === 'recentes' ? 'Adicionados Recentemente' :
                               tab === 'populares' ? 'Populares' :
                               tab === 'favoritos' ? 'Favoritos' : 'Em Progresso'}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <Separator className="border-amber-900/30" />
                      
                      <div>
                        <h3 className="text-sm font-medium text-amber-500/70 mb-3">Categorias</h3>
                        <div className="space-y-1">
                          {categorias.map((category) => (
                            <Button
                              key={category.id}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left",
                                selectedCategory === category.nome ? "bg-amber-900/20 text-amber-400" : "text-gray-300"
                              )}
                              onClick={() => {
                                handleCategorySelect(category.nome);
                                setMenuOpen(false);
                              }}
                            >
                              {category.nome}
                              <Badge className="ml-auto bg-amber-900/30 text-amber-500" variant="outline">
                                {category.contador_livros}
                              </Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Desktop sidebar and main content */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Desktop sidebar */}
            <div className="hidden md:block w-64 shrink-0">
              <div className="sticky top-6 space-y-6">
                <AtheneumCard className="p-4">
                  <h3 className="text-sm font-medium text-amber-500/70 mb-3">Navegação</h3>
                  <div className="space-y-1">
                    {['categorias', 'recentes', 'populares', 'favoritos', 'em_progresso'].map((tab) => (
                      <Button
                        key={tab}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left",
                          activeTab === tab ? "bg-amber-900/20 text-amber-400" : "text-gray-300"
                        )}
                        onClick={() => setActiveTab(tab)}
                      >
                        {{
                          categorias: <BookOpen className="mr-2 h-4 w-4" />,
                          recentes: <Clock className="mr-2 h-4 w-4" />,
                          populares: <BookMarked className="mr-2 h-4 w-4" />,
                          favoritos: <Heart className="mr-2 h-4 w-4" />,
                          em_progresso: <Plus className="mr-2 h-4 w-4" />
                        }[tab]}
                        {tab === 'categorias' ? 'Categorias' : 
                         tab === 'recentes' ? 'Adicionados Recentemente' :
                         tab === 'populares' ? 'Populares' :
                         tab === 'favoritos' ? 'Favoritos' : 'Em Progresso'}
                      </Button>
                    ))}
                  </div>
                </AtheneumCard>
                
                <AtheneumCard className="p-4">
                  <h3 className="text-sm font-medium text-amber-500/70 mb-3">Categorias</h3>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-1">
                      {categorias.map((category) => (
                        <Button
                          key={category.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-left",
                            selectedCategory === category.nome ? "bg-amber-900/20 text-amber-400" : "text-gray-300"
                          )}
                          onClick={() => handleCategorySelect(category.nome)}
                        >
                          <span className="truncate">{category.nome}</span>
                          <Badge className="ml-auto bg-amber-900/30 text-amber-500" variant="outline">
                            {category.contador_livros}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </AtheneumCard>
              </div>
            </div>
            
            {/* Main content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab + selectedCategory}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Category header */}
                  {selectedCategory && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-amber-400">
                          {selectedCategory}
                        </h2>
                        <Button variant="ghost" onClick={() => handleCategorySelect(null)}>
                          Limpar filtro
                        </Button>
                      </div>
                      <p className="text-muted-foreground">
                        {booksByCategory[selectedCategory]?.length || 0} obras encontradas
                      </p>
                    </div>
                  )}
                  
                  {/* Active tab content */}
                  <div className="space-y-12">
                    {activeTab === 'categorias' && !selectedCategory && (
                      <>
                        <div className="space-y-6">
                          <AtheneumTitle>Categorias Principais</AtheneumTitle>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categorias.slice(0, 6).map((category) => (
                              <AtheneumCard
                                key={category.id}
                                className="p-5 cursor-pointer"
                                onClick={() => handleCategorySelect(category.nome)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-lg font-bold text-amber-400">
                                    {category.nome}
                                  </h3>
                                  <Badge className="bg-amber-900/30 text-amber-500" variant="outline">
                                    {category.contador_livros}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Explore obras jurídicas relacionadas a {category.nome}
                                </p>
                                <AtheneumButton variant="outline">
                                  Ver Obras
                                </AtheneumButton>
                              </AtheneumCard>
                            ))}
                          </div>
                        </div>
                        
                        {popularBooks.length > 0 && (
                          <div>
                            <BookGrid3D
                              title="Mais Populares"
                              books={popularBooks}
                              onSelectBook={handleSelectBook}
                            />
                          </div>
                        )}
                        
                        {recentBooks.length > 0 && (
                          <div>
                            <BookGrid3D
                              title="Adicionados Recentemente"
                              books={recentBooks}
                              onSelectBook={handleSelectBook}
                            />
                          </div>
                        )}
                      </>
                    )}
                    
                    {activeTab === 'recentes' && (
                      <div className="space-y-6">
                        <AtheneumTitle>Adicionados Recentemente</AtheneumTitle>
                        <BookGrid3D
                          title="Novas Obras"
                          books={recentBooks}
                          onSelectBook={handleSelectBook}
                        />
                      </div>
                    )}
                    
                    {activeTab === 'populares' && (
                      <div className="space-y-6">
                        <AtheneumTitle>Obras Populares</AtheneumTitle>
                        <BookGrid3D
                          title="Mais Acessados"
                          books={popularBooks}
                          onSelectBook={handleSelectBook}
                        />
                      </div>
                    )}
                    
                    {activeTab === 'favoritos' && (
                      <div className="space-y-6">
                        <AtheneumTitle>Seus Favoritos</AtheneumTitle>
                        
                        {favoriteBooks.length > 0 ? (
                          <BookGrid3D
                            title="Favoritos"
                            books={favoriteBooks}
                            onSelectBook={handleSelectBook}
                          />
                        ) : (
                          <AtheneumCard className="p-8 text-center">
                            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="text-xl font-bold text-amber-400 mb-2">
                              Sem livros favoritos
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                              Você ainda não adicionou nenhum livro aos favoritos. 
                              Navegue pela biblioteca e marque seus livros preferidos.
                            </p>
                            <AtheneumButton onClick={() => setActiveTab('categorias')}>
                              Explorar Biblioteca
                            </AtheneumButton>
                          </AtheneumCard>
                        )}
                      </div>
                    )}
                    
                    {activeTab === 'em_progresso' && (
                      <div className="space-y-6">
                        <AtheneumTitle>Em Progresso</AtheneumTitle>
                        
                        {progresBooks.length > 0 ? (
                          <BookGrid3D
                            title="Leitura em Andamento"
                            books={progresBooks}
                            onSelectBook={handleSelectBook}
                          />
                        ) : (
                          <AtheneumCard className="p-8 text-center">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="text-xl font-bold text-amber-400 mb-2">
                              Sem livros em progresso
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                              Você ainda não começou a ler nenhum livro.
                              Escolha um livro e comece sua jornada de conhecimento.
                            </p>
                            <AtheneumButton onClick={() => setActiveTab('categorias')}>
                              Encontrar Livros
                            </AtheneumButton>
                          </AtheneumCard>
                        )}
                      </div>
                    )}
                    
                    {activeTab === 'todos' && (
                      <div className="space-y-6">
                        <AtheneumTitle>
                          {selectedCategory ? `Obras de ${selectedCategory}` : 'Todas as Obras'}
                        </AtheneumTitle>
                        
                        <BookGrid3D
                          title={selectedCategory || "Biblioteca Completa"}
                          books={filteredBooks}
                          onSelectBook={handleSelectBook}
                        />
                        
                        {filteredBooks.length === 0 && searchQuery && (
                          <AtheneumCard className="p-8 text-center">
                            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="text-xl font-bold text-amber-400 mb-2">
                              Nenhum resultado encontrado
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                              Não encontramos resultados para "{searchQuery}".
                              Tente buscar por outros termos.
                            </p>
                            <AtheneumButton onClick={() => setSearchQuery('')}>
                              Limpar Busca
                            </AtheneumButton>
                          </AtheneumCard>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </AtheneumBackground>
  );
}
