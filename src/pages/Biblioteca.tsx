
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import BookDetailsDialog from "@/components/biblioteca/BookDetailsDialog";
import AnnotationsDialog from "@/components/biblioteca/AnnotationsDialog";
import BibliotecaHeader from "@/components/biblioteca/BibliotecaHeader";
import BibliotecaSearchBar from "@/components/biblioteca/BibliotecaSearchBar";
import BibliotecaTabs from "@/components/biblioteca/BibliotecaTabs";

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
    setTimeout(() => {
      const bookDialog = document.querySelector('[role="dialog"]');
      if (bookDialog) {
        (bookDialog as HTMLElement).focus();
      }
    }, 100);
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

  const askAiForRecommendation = async (query: string): Promise<{
    result: string;
    books: Book[];
  }> => {
    if (!query.trim()) return Promise.resolve({
      result: "",
      books: [] as Book[]
    });
    try {
      const prompt = `Estou procurando livros para estudar sobre: ${query}. Por favor, sugira até 3 livros que podem me ajudar, considerando que estou na área jurídica.`;
      const response = await (await import("@/services/ai-assistant")).askGemini(prompt);
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
      <BibliotecaHeader totalBooks={totalBooks} onOpenAnnotations={openAnnotationsDialog} />

      <BibliotecaSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        books={books}
        onOpenAnnotations={openAnnotationsDialog}
        askAiForRecommendation={askAiForRecommendation}
        openBookDialog={openBookDialog}
      />

      <BibliotecaTabs
        areas={areas}
        booksByArea={booksByArea}
        booksPerArea={booksPerArea}
        viewMode={viewMode}
        readBooks={readBooks}
        favoriteBooks={favoriteBooks}
        toggleViewMode={toggleViewMode}
        openBookDialog={openBookDialog}
        isLoading={isLoading}
        recentBooks={recentBooks}
        allRead={readBooks}
        favoriteBookIds={favoriteBooks}
        readBooksData={readBooksData}
        favoriteBooksData={favoriteBooksData}
        openAnnotationsDialog={openAnnotationsDialog}
      />

      <BookDetailsDialog
        selectedBook={selectedBook}
        readingMode={readingMode}
        setReadingMode={setReadingMode}
        isNarrating={isNarrating}
        narrationVolume={narrationVolume}
        onClose={() => setIsBookDialogOpen(false)}
        onFavorite={id => { toggleFavoriteStatus(id); }}
        onRead={id => { toggleReadStatus(id); }}
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
    </div>
  );
};

export default Biblioteca;
