import React, { useState, useEffect } from "react";
import { BookOpen, Search, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent } from "@/components/ui/animated-tabs";
import { Dialog } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { askGemini } from "@/services/ai-assistant";
import BookCard from "@/components/biblioteca/BookCard";
import BookList from "@/components/biblioteca/BookList";
import AnnotationsDialog from "@/components/biblioteca/AnnotationsDialog";
import AIRecommendations from "@/components/biblioteca/AIRecommendations";
import BookDetailsDialog from "@/components/biblioteca/BookDetailsDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface Book { id: number; livro: string | null; area: string | null; sobre: string | null; imagem: string | null; download: string | null; link: string | null; }
interface ReadBook { id: number; isRead: boolean; }
interface FavoriteBook { id: number; isFavorite: boolean; }
interface Annotation { id: string; bookId: number; text: string; createdAt: string; }

const Biblioteca = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [readBooks, setReadBooks] = useState<ReadBook[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<FavoriteBook[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
  const [narrationVolume, setNarrationVolume] = useState(70);
  const [isNarrating, setIsNarrating] = useState(false);
  const [viewMode, setViewMode] = useState<Record<string, 'grid' | 'list'>>({});
  const [readingMode, setReadingMode] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<string>("");
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [isAnnotationsDialogOpen, setIsAnnotationsDialogOpen] = useState(false);

  const isMobile = useIsMobile();

  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('biblioteca_juridica').select('*');
        if (error) {
          throw error;
        }
        const loadedBooks = data as Book[];
        setBooks(loadedBooks);
        setFilteredBooks(loadedBooks);
        const uniqueAreas = [...new Set(loadedBooks.map(book => book.area))].filter(Boolean) as string[];
        setAreas(uniqueAreas);
        const viewModeInit = uniqueAreas.reduce((acc, area) => {
          if (area) acc[area] = 'grid';
          return acc;
        }, {} as Record<string, 'grid' | 'list'>);
        setViewMode(viewModeInit);
        const savedReadBooks = localStorage.getItem('readBooks');
        if (savedReadBooks) setReadBooks(JSON.parse(savedReadBooks));
        const savedFavoriteBooks = localStorage.getItem('favoriteBooks');
        if (savedFavoriteBooks) setFavoriteBooks(JSON.parse(savedFavoriteBooks));
        const savedRecentBooks = localStorage.getItem('recentBooks');
        if (savedRecentBooks) {
          const recentIds = JSON.parse(savedRecentBooks);
          const recentBooksData = loadedBooks.filter(book => recentIds.includes(book.id)).slice(0, 5);
          setRecentBooks(recentBooksData);
        }
        const savedAnnotations = localStorage.getItem('bookAnnotations');
        if (savedAnnotations) setAnnotations(JSON.parse(savedAnnotations));
      } catch (error) {
        const exampleBooks = [{
          id: 1,
          livro: "Constituição Federal Comentada",
          area: "Direito Constitucional",
          sobre: "Análise completa da Constituição Federal com comentários doutrinários e jurisprudenciais.",
          imagem: "https://placehold.co/200x300/7933ff/ffffff?text=Constituição+Federal",
          download: "https://example.com/download/constituicao.pdf",
          link: "https://example.com/read/constituicao"
        }, {
          id: 2,
          livro: "Manual de Direito Civil",
          area: "Direito Civil",
          sobre: "Abordagem sistemática dos principais institutos do Direito Civil brasileiro.",
          imagem: "https://placehold.co/200x300/3366ff/ffffff?text=Direito+Civil",
          download: "https://example.com/download/civil.pdf",
          link: "https://example.com/read/civil"
        }, {
          id: 3,
          livro: "Código Penal Comentado",
          area: "Direito Penal",
          sobre: "Comentários ao Código Penal com análise de jurisprudência atualizada.",
          imagem: "https://placehold.co/200x300/ff3366/ffffff?text=Direito+Penal",
          download: "https://example.com/download/penal.pdf",
          link: "https://example.com/read/penal"
        }];
        setBooks(exampleBooks);
        setFilteredBooks(exampleBooks);
        setAreas([...new Set(exampleBooks.map(book => book.area))].filter(Boolean) as string[]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => book.livro?.toLowerCase().includes(searchQuery.toLowerCase()) || book.area?.toLowerCase().includes(searchQuery.toLowerCase()) || book.sobre?.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const toggleReadStatus = (bookId: number) => {
    const updatedReadBooks = readBooks.some(item => item.id === bookId) ? readBooks.filter(item => item.id !== bookId) : [...readBooks, {
      id: bookId,
      isRead: true
    }];
    setReadBooks(updatedReadBooks);
    localStorage.setItem('readBooks', JSON.stringify(updatedReadBooks));
    toast({
      title: readBooks.some(item => item.id === bookId) ? "Livro removido da lista de lidos" : "Livro marcado como lido",
      description: "Sua biblioteca foi atualizada",
      duration: 2000
    });
  };

  const toggleFavoriteStatus = (bookId: number) => {
    const updatedFavoriteBooks = favoriteBooks.some(item => item.id === bookId) ? favoriteBooks.filter(item => item.id !== bookId) : [...favoriteBooks, {
      id: bookId,
      isFavorite: true
    }];
    setFavoriteBooks(updatedFavoriteBooks);
    localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavoriteBooks));
    toast({
      title: favoriteBooks.some(item => item.id === bookId) ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: "Suas preferências foram atualizadas",
      duration: 2000
    });
  };

  const addToRecentBooks = (book: Book) => {
    const existingRecentBooks = localStorage.getItem('recentBooks');
    let recentIds: number[] = existingRecentBooks ? JSON.parse(existingRecentBooks) : [];
    recentIds = recentIds.filter(id => id !== book.id);
    recentIds.unshift(book.id);
    recentIds = recentIds.slice(0, 5);
    localStorage.setItem('recentBooks', JSON.stringify(recentIds));
    const updatedRecentBooks = recentIds.map(id => books.find(book => book.id === id)).filter(Boolean) as Book[];
    setRecentBooks(updatedRecentBooks);
  };

  const openBookDialog = (book: Book, readingNow = false) => {
    setSelectedBook(book);
    setIsBookDialogOpen(true);
    setReadingMode(!!readingNow);
    addToRecentBooks(book);
  };

  const handleNarration = (text: string) => {
    if (!text) return;
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.volume = narrationVolume / 100;
    utterance.onend = () => setIsNarrating(false);
    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  };

  const askAiForRecommendation = async (query: string) => {
    if (!query.trim()) return {
      result: "",
      books: [] as Book[]
    };
    try {
      const prompt = `Estou procurando livros para estudar sobre: ${query}. Por favor, sugira até 3 livros que podem me ajudar, considerando que estou na área jurídica.`;
      const response = await askGemini(prompt);
      if (response.error) throw new Error(response.error);
      const keywords = query.toLowerCase().split(' ');
      const recommendedBooks = books.filter(book => keywords.some(keyword => book.livro?.toLowerCase().includes(keyword) || book.area?.toLowerCase().includes(keyword) || book.sobre?.toLowerCase().includes(keyword))).slice(0, 5);
      return {
        result: response.text,
        books: recommendedBooks
      };
    } catch (error) {
      return {
        result: "Desculpe, não foi possível obter recomendações. Por favor, tente novamente.",
        books: []
      };
    }
  };

  const toggleViewMode = (area: string) => {
    setViewMode(prev => ({
      ...prev,
      [area]: prev[area] === "grid" ? "list" : "grid"
    }));
  };

  const saveAnnotation = (bookId: number) => {
    if (!currentAnnotation.trim()) return;
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      bookId,
      text: currentAnnotation,
      createdAt: new Date().toISOString()
    };
    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    localStorage.setItem("bookAnnotations", JSON.stringify(updatedAnnotations));
    setCurrentAnnotation("");
    toast({
      title: "Anotação salva",
      description: "Sua anotação foi salva com sucesso",
      duration: 2000
    });
  };

  const updateAnnotation = (id: string, newText: string) => {
    const updatedAnnotations = annotations.map(anno => anno.id === id ? {
      ...anno,
      text: newText
    } : anno);
    setAnnotations(updatedAnnotations);
    localStorage.setItem("bookAnnotations", JSON.stringify(updatedAnnotations));
    setEditingAnnotation(null);
    toast({
      title: "Anotação atualizada",
      description: "Sua anotação foi atualizada com sucesso",
      duration: 2000
    });
  };

  const deleteAnnotation = (id: string) => {
    const updatedAnnotations = annotations.filter(anno => anno.id !== id);
    setAnnotations(updatedAnnotations);
    localStorage.setItem("bookAnnotations", JSON.stringify(updatedAnnotations));
    toast({
      title: "Anotação excluída",
      description: "Sua anotação foi removida com sucesso",
      duration: 2000
    });
  };

  const openAnnotationsDialog = () => setIsAnnotationsDialogOpen(true);

  const booksByArea = areas.reduce((acc, area) => {
    if (!area) return acc;
    acc[area] = filteredBooks.filter(book => book.area === area);
    return acc;
  }, {} as Record<string, Book[]>);

  const favoriteBooksData = books.filter(book => favoriteBooks.some(fav => fav.id === book.id));
  const readBooksData = books.filter(book => readBooks.some(rb => rb.id === book.id));
  const totalBooks = books.length;
  const booksPerArea = areas.reduce((acc, area) => {
    if (!area) return acc;
    acc[area] = books.filter(book => book.area === area).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container py-2 sm:py-4 mx-auto px-1 sm:px-0">
      <div className="mb-3 sm:mb-6 flex flex-col gap-3 sm:gap-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <BookOpen className="h-6 w-6 text-primary" />
            <div className="text-lg sm:text-xl font-semibold pl-2">Biblioteca Jurídica</div>
            <span className="text-xs sm:text-sm text-muted-foreground pl-2">
              <span className="font-semibold">{totalBooks}</span> livros disponíveis
            </span>
          </div>
          <Button variant="outline" onClick={openAnnotationsDialog} className="hidden sm:inline-block ml-3">
            <span className="mr-2">Minhas Anotações</span>
          </Button>
        </div>
        <div className="w-full max-w-sm mx-auto flex items-center relative mt-2">
          <Input
            type="text"
            placeholder="Pesquisar livros..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <div className="ml-2">
            <AIRecommendations askAiForRecommendation={() => ({ result: "", books: [] })} books={books} openBookDialog={openBookDialog} />
          </div>
        </div>
        <Button variant="outline" onClick={openAnnotationsDialog} className="sm:hidden mt-2 w-full text-xs">
          📓 Minhas Anotações
        </Button>
      </div>

      <AnimatedTabs defaultValue="areas" className="w-full">
        <AnimatedTabsList className="w-full justify-start mb-4">
          <AnimatedTabsTrigger value="areas">
            <BookOpen className="h-4 w-4 mr-1" />
            Por Área
          </AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="recentes">Recentes</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="lidos">Lidos</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="favoritos">Favoritos</AnimatedTabsTrigger>
        </AnimatedTabsList>

        <AnimatedTabsContent value="areas" slideDirection="right">
          {isLoading ? <div className="flex justify-center p-12"><p>Carregando biblioteca...</p></div> :
            areas.length > 0 ? <div className="space-y-10">
              {areas.map(area => area && booksByArea[area]?.length > 0 && (
                <div key={area} className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <h2 className="text-base md:text-xl font-semibold">{area}</h2>
                      <span className="ml-2 text-xs md:text-sm text-muted-foreground">
                        ({booksPerArea[area] || 0} livros)
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setViewMode(prev => ({ ...prev, [area]: prev[area] === "grid" ? "list" : "grid" }))} className="flex items-center gap-1">
                      <ListFilter className="h-4 w-4 mr-1" />
                      Ver em {viewMode[area] === "grid" ? "lista" : "grade"}
                    </Button>
                  </div>
                  {viewMode[area] === "grid" ? (
                    <Carousel className="w-full">
                      <CarouselContent>
                        {booksByArea[area].map(book => (
                          <CarouselItem key={book.id} className="md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2 pr-0">
                            <BookCard book={book} isRead={!!readBooks.find(x => x.id === book.id)} isFavorite={!!favoriteBooks.find(x => x.id === book.id)} onClick={openBookDialog} />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  ) : (
                    <BookList books={booksByArea[area]} readBooks={readBooks} favoriteBooks={favoriteBooks} onOpenBookDialog={openBookDialog} />
                  )}
                </div>
              ))}
            </div>
              : <p className="text-center py-12 text-muted-foreground">Nenhuma área encontrada na biblioteca.</p>}
        </AnimatedTabsContent>

        <AnimatedTabsContent value="recentes" slideDirection="right">
          {recentBooks.length > 0 ?
            <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2`}>
              {recentBooks.map(book => <div key={book.id} className="flex justify-center">
                <BookCard book={book} isRead={!!readBooks.find(x => x.id === book.id)} isFavorite={!!favoriteBooks.find(x => x.id === book.id)} onClick={openBookDialog} />
              </div>)}
            </div>
            : <p className="text-center py-10 text-muted-foreground">
              Você ainda não acessou nenhum livro recentemente.
            </p>}
        </AnimatedTabsContent>

        <AnimatedTabsContent value="lidos" slideDirection="right">
          {readBooksData.length > 0 ?
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2">
              {readBooksData.map(book => <div key={book.id} className="flex justify-center">
                <BookCard book={book} isRead={!!readBooks.find(x => x.id === book.id)} isFavorite={!!favoriteBooks.find(x => x.id === book.id)} onClick={openBookDialog} />
              </div>)}
            </div>
            : <p className="text-center py-12 text-muted-foreground">
              Você ainda não marcou nenhum livro como lido.
            </p>}
        </AnimatedTabsContent>

        <AnimatedTabsContent value="favoritos" slideDirection="right">
          {favoriteBooksData.length > 0 ?
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2">
              {favoriteBooksData.map(book => <div key={book.id} className="flex justify-center">
                <BookCard book={book} isRead={!!readBooks.find(x => x.id === book.id)} isFavorite={!!favoriteBooks.find(x => x.id === book.id)} onClick={openBookDialog} />
              </div>)}
            </div>
            : <p className="text-center py-12 text-muted-foreground">
              Você ainda não adicionou nenhum livro aos favoritos.
            </p>}
        </AnimatedTabsContent>
      </AnimatedTabs>

      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <BookDetailsDialog selectedBook={selectedBook} readingMode={readingMode} setReadingMode={setReadingMode} isNarrating={isNarrating} narrationVolume={narrationVolume} onClose={() => setIsBookDialogOpen(false)} onFavorite={id => { toggleFavoriteStatus(id); }} onRead={id => { toggleReadStatus(id); }} isFavorite={!!(selectedBook && favoriteBooks.some(f => f.id === selectedBook.id))} isRead={!!(selectedBook && readBooks.some(f => f.id === selectedBook.id))} onNarrate={() => { }} setNarrationVolume={setNarrationVolume} annotations={annotations} currentAnnotation={currentAnnotation} setCurrentAnnotation={setCurrentAnnotation} saveAnnotation={saveAnnotation} editingAnnotation={editingAnnotation} setEditingAnnotation={setEditingAnnotation} updateAnnotation={updateAnnotation} deleteAnnotation={deleteAnnotation} openAnnotationsDialog={openAnnotationsDialog} />
      </Dialog>

      <AnnotationsDialog open={isAnnotationsDialogOpen} onOpenChange={setIsAnnotationsDialogOpen} annotations={annotations} books={books} editingAnnotation={editingAnnotation} currentAnnotation={currentAnnotation} setEditingAnnotation={setEditingAnnotation} setCurrentAnnotation={setCurrentAnnotation} updateAnnotation={updateAnnotation} deleteAnnotation={deleteAnnotation} />
    </div>
  );
};

export default Biblioteca;
