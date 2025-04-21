import React, { useState, useEffect } from "react";
import { BookOpen, Search, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent } from "@/components/ui/animated-tabs";
import { Dialog } from "@/components/ui/dialog";
import { CarouselItem } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { askGemini } from "@/services/ai-assistant";
import BookCard from "@/components/biblioteca/BookCard";
import BookList from "@/components/biblioteca/BookList";
import AnnotationsDialog from "@/components/biblioteca/AnnotationsDialog";
import AIRecommendations from "@/components/biblioteca/AIRecommendations";
import BookDetailsDialog from "@/components/biblioteca/BookDetailsDialog";
import ResponsiveCarousel from "@/components/biblioteca/ResponsiveCarousel";
import { useIsMobile } from "@/hooks/use-mobile";

interface Book {
  id: number;
  livro: string | null;
  area: string | null;
  sobre: string | null;
  imagem: string | null;
  download: string | null;
  link: string | null;
}
interface ReadBook {
  id: number;
  isRead: boolean;
}
interface FavoriteBook {
  id: number;
  isFavorite: boolean;
}
interface Annotation {
  id: string;
  bookId: number;
  text: string;
  createdAt: string;
}

const BooksByAreaSection = ({ 
  area, 
  books, 
  booksPerArea, 
  viewMode, 
  toggleViewMode, 
  readBooks, 
  favoriteBooks, 
  openBookDialog 
}: { 
  area: string; 
  books: Book[]; 
  booksPerArea: Record<string, number>; 
  viewMode: Record<string, 'grid' | 'list'>; 
  toggleViewMode: (area: string) => void; 
  readBooks: ReadBook[]; 
  favoriteBooks: FavoriteBook[]; 
  openBookDialog: (book: Book) => void; 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">{area}</h2>
          <span className="ml-2 text-sm text-muted-foreground">
            ({booksPerArea[area] || 0} livros)
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => toggleViewMode(area)} className="flex items-center gap-1">
          <ListFilter className="h-4 w-4 mr-1" />
          Ver em {viewMode[area] === "grid" ? "lista" : "grade"}
        </Button>
      </div>

      {viewMode[area] === "grid" ? (
        <ResponsiveCarousel>
          {books.map(book => (
            <CarouselItem 
              key={book.id} 
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4"
            >
              <BookCard 
                book={book} 
                isRead={!!readBooks.find(x => x.id === book.id)} 
                isFavorite={!!favoriteBooks.find(x => x.id === book.id)} 
                onClick={openBookDialog} 
              />
            </CarouselItem>
          ))}
        </ResponsiveCarousel>
      ) : (
        <BookList 
          books={books} 
          readBooks={readBooks} 
          favoriteBooks={favoriteBooks} 
          onOpenBookDialog={openBookDialog} 
        />
      )}
    </div>
  );
};

const BooksGrid = ({ 
  books, 
  readBooks, 
  favoriteBooks, 
  openBookDialog, 
  emptyMessage 
}: { 
  books: Book[]; 
  readBooks: ReadBook[]; 
  favoriteBooks: FavoriteBook[]; 
  openBookDialog: (book: Book) => void; 
  emptyMessage: string;
}) => {
  if (books.length === 0) {
    return (
      <p className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2 md:p-4">
      {books.map(book => (
        <div key={book.id} className="flex justify-center">
          <BookCard 
            book={book} 
            isRead={!!readBooks.find(x => x.id === book.id)} 
            isFavorite={!!favoriteBooks.find(x => x.id === book.id)} 
            onClick={openBookDialog} 
          />
        </div>
      ))}
    </div>
  );
};

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container py-4 px-2 md:px-4 mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold">{totalBooks}</span> livros disponíveis
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Input 
              type="text" 
              placeholder="Pesquisar livros..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10" 
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          <AIRecommendations 
            askAiForRecommendation={askAiForRecommendation} 
            books={books} 
            openBookDialog={openBookDialog} 
          />
          
          <Button 
            variant="outline" 
            onClick={openAnnotationsDialog}
          >
            Anotações
          </Button>
        </div>
      </div>

      <AnimatedTabs defaultValue="areas" className="w-full">
        <AnimatedTabsList className="w-full overflow-x-auto scrollbar-none justify-start mb-4">
          <AnimatedTabsTrigger value="areas">Por Área</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="recentes">Recentes</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="lidos">Lidos</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="favoritos">Favoritos</AnimatedTabsTrigger>
        </AnimatedTabsList>

        <AnimatedTabsContent value="areas" slideDirection="right">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <p>Carregando biblioteca...</p>
            </div>
          ) : areas.length > 0 ? (
            <div className="space-y-8">
              {areas.map(area => (
                area && booksByArea[area]?.length > 0 && (
                  <BooksByAreaSection
                    key={area}
                    area={area}
                    books={booksByArea[area]}
                    booksPerArea={booksPerArea}
                    viewMode={viewMode}
                    toggleViewMode={toggleViewMode}
                    readBooks={readBooks}
                    favoriteBooks={favoriteBooks}
                    openBookDialog={openBookDialog}
                  />
                )
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-muted-foreground">
              Nenhuma área encontrada na biblioteca.
            </p>
          )}
        </AnimatedTabsContent>

        <AnimatedTabsContent value="recentes" slideDirection="right">
          <BooksGrid
            books={recentBooks}
            readBooks={readBooks}
            favoriteBooks={favoriteBooks}
            openBookDialog={openBookDialog}
            emptyMessage="Você ainda não acessou nenhum livro recentemente."
          />
        </AnimatedTabsContent>

        <AnimatedTabsContent value="lidos" slideDirection="right">
          <BooksGrid
            books={readBooksData}
            readBooks={readBooks}
            favoriteBooks={favoriteBooks}
            openBookDialog={openBookDialog}
            emptyMessage="Você ainda não marcou nenhum livro como lido."
          />
        </AnimatedTabsContent>

        <AnimatedTabsContent value="favoritos" slideDirection="right">
          <BooksGrid
            books={favoriteBooksData}
            readBooks={readBooks}
            favoriteBooks={favoriteBooks}
            openBookDialog={openBookDialog}
            emptyMessage="Você ainda não adicionou nenhum livro aos favoritos."
          />
        </AnimatedTabsContent>
      </AnimatedTabs>

      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <BookDetailsDialog 
          selectedBook={selectedBook} 
          readingMode={readingMode} 
          setReadingMode={setReadingMode} 
          isNarrating={isNarrating} 
          narrationVolume={narrationVolume} 
          onClose={() => setIsBookDialogOpen(false)} 
          onFavorite={toggleFavoriteStatus} 
          onRead={toggleReadStatus} 
          isFavorite={!!(selectedBook && favoriteBooks.some(f => f.id === selectedBook.id))} 
          isRead={!!(selectedBook && readBooks.some(f => f.id === selectedBook.id))} 
          onNarrate={handleNarration} 
          setNarrationVolume={setNarrationVolume} 
          annotations={annotations} 
          currentAnnotation={currentAnnotation} 
          setCurrentAnnotation={setCurrentAnnotation} 
          saveAnnotation={saveAnnotation} 
          editingAnnotation={editingAnnotation} 
          setEditingAnnotation={setEditingAnnotation} 
          updateAnnotation={updateAnnotation} 
          deleteAnnotation={deleteAnnotation} 
          openAnnotationsDialog={openAnnotationsDialog} 
        />
      </Dialog>

      <AnnotationsDialog 
        open={isAnnotationsDialogOpen} 
        onOpenChange={setIsAnnotationsDialogOpen} 
        annotations={annotations} 
        books={books} 
        editingAnnotation={editingAnnotation} 
        currentAnnotation={currentAnnotation} 
        setEditingAnnotation={setEditingAnnotation} 
        setCurrentAnnotation={setCurrentAnnotation} 
        updateAnnotation={updateAnnotation} 
        deleteAnnotation={deleteAnnotation} 
      />
    </motion.div>
  );
};

export default Biblioteca;
