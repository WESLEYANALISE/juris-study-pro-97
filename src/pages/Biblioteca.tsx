import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { BookOpen, Download, Search, Heart, ListFilter, Volume2, PencilLine, X, Bookmark, BookOpenCheck, Lamp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent } from "@/components/ui/animated-tabs";
import { motion } from "framer-motion";
import { AskAssistant } from "@/components/AskAssistant";
import { askGemini } from "@/services/ai-assistant";
import { useToast } from "@/hooks/use-toast";

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
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<Book[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
  const [narrationVolume, setNarrationVolume] = useState(70);
  const [isNarrating, setIsNarrating] = useState(false);
  const [viewMode, setViewMode] = useState<Record<string, 'grid' | 'list'>>({});
  const [readingMode, setReadingMode] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<string>("");
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [isAnnotationsDialogOpen, setIsAnnotationsDialogOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase.from('biblioteca_juridica').select('*');
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
        if (savedReadBooks) {
          setReadBooks(JSON.parse(savedReadBooks));
        }
        
        const savedFavoriteBooks = localStorage.getItem('favoriteBooks');
        if (savedFavoriteBooks) {
          setFavoriteBooks(JSON.parse(savedFavoriteBooks));
        }
        
        const savedRecentBooks = localStorage.getItem('recentBooks');
        if (savedRecentBooks) {
          const recentIds = JSON.parse(savedRecentBooks);
          const recentBooksData = loadedBooks.filter(book => recentIds.includes(book.id)).slice(0, 5);
          setRecentBooks(recentBooksData);
        }
        
        const savedAnnotations = localStorage.getItem('bookAnnotations');
        if (savedAnnotations) {
          setAnnotations(JSON.parse(savedAnnotations));
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        const exampleBooks = [
          {
            id: 1,
            livro: "Constituição Federal Comentada",
            area: "Direito Constitucional",
            sobre: "Análise completa da Constituição Federal com comentários doutrinários e jurisprudenciais.",
            imagem: "https://placehold.co/200x300/7933ff/ffffff?text=Constituição+Federal",
            download: "https://example.com/download/constituicao.pdf",
            link: "https://example.com/read/constituicao"
          },
          {
            id: 2,
            livro: "Manual de Direito Civil",
            area: "Direito Civil",
            sobre: "Abordagem sistemática dos principais institutos do Direito Civil brasileiro.",
            imagem: "https://placehold.co/200x300/3366ff/ffffff?text=Direito+Civil",
            download: "https://example.com/download/civil.pdf",
            link: "https://example.com/read/civil"
          },
          {
            id: 3,
            livro: "Código Penal Comentado",
            area: "Direito Penal",
            sobre: "Comentários ao Código Penal com análise de jurisprudência atualizada.",
            imagem: "https://placehold.co/200x300/ff3366/ffffff?text=Direito+Penal",
            download: "https://example.com/download/penal.pdf",
            link: "https://example.com/read/penal"
          }
        ];
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
      const filtered = books.filter(book => 
        book.livro?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        book.area?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        book.sobre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const toggleReadStatus = (bookId: number) => {
    const updatedReadBooks = readBooks.some(item => item.id === bookId) 
      ? readBooks.filter(item => item.id !== bookId) 
      : [...readBooks, { id: bookId, isRead: true }];
    
    setReadBooks(updatedReadBooks);
    localStorage.setItem('readBooks', JSON.stringify(updatedReadBooks));
    
    toast({
      title: readBooks.some(item => item.id === bookId) 
        ? "Livro removido da lista de lidos" 
        : "Livro marcado como lido",
      description: "Sua biblioteca foi atualizada",
      duration: 2000
    });
  };

  const toggleFavoriteStatus = (bookId: number) => {
    const updatedFavoriteBooks = favoriteBooks.some(item => item.id === bookId) 
      ? favoriteBooks.filter(item => item.id !== bookId) 
      : [...favoriteBooks, { id: bookId, isFavorite: true }];
    
    setFavoriteBooks(updatedFavoriteBooks);
    localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavoriteBooks));
    
    toast({
      title: favoriteBooks.some(item => item.id === bookId) 
        ? "Removido dos favoritos" 
        : "Adicionado aos favoritos",
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
    
    const updatedRecentBooks = recentIds
      .map(id => books.find(book => book.id === id))
      .filter(Boolean) as Book[];
    setRecentBooks(updatedRecentBooks);
  };

  const openBookDialog = (book: Book) => {
    setSelectedBook(book);
    setIsBookDialogOpen(true);
    setReadingMode(false);
    addToRecentBooks(book);
  };

  const handleNarration = (text: string) => {
    if (!text) return;
    
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.volume = narrationVolume / 100;
    utterance.onend = () => setIsNarrating(false);
    
    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  };

  const askAiForRecommendation = async () => {
    if (!aiQuery.trim()) return;
    
    setIsAiLoading(true);
    try {
      const prompt = `Estou procurando livros para estudar sobre: ${aiQuery}. 
      Por favor, sugira até 3 livros que podem me ajudar, considerando que estou na área jurídica.`;
      
      const response = await askGemini(prompt);
      if (response.error) {
        throw new Error(response.error);
      }
      
      setAiResult(response.text);
      
      const keywords = aiQuery.toLowerCase().split(' ');
      const recommendedBooks = books.filter(book => 
        keywords.some(keyword => 
          book.livro?.toLowerCase().includes(keyword) || 
          book.area?.toLowerCase().includes(keyword) || 
          book.sobre?.toLowerCase().includes(keyword)
        )
      ).slice(0, 5);
      
      setAiRecommendations(recommendedBooks);
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      setAiResult("Desculpe, não foi possível obter recomendações. Por favor, tente novamente.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleViewMode = (area: string) => {
    setViewMode(prev => ({
      ...prev,
      [area]: prev[area] === 'grid' ? 'list' : 'grid'
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
    localStorage.setItem('bookAnnotations', JSON.stringify(updatedAnnotations));
    
    setCurrentAnnotation("");
    
    toast({
      title: "Anotação salva",
      description: "Sua anotação foi salva com sucesso",
      duration: 2000
    });
  };

  const updateAnnotation = (id: string, newText: string) => {
    const updatedAnnotations = annotations.map(anno => 
      anno.id === id ? { ...anno, text: newText } : anno
    );
    
    setAnnotations(updatedAnnotations);
    localStorage.setItem('bookAnnotations', JSON.stringify(updatedAnnotations));
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
    localStorage.setItem('bookAnnotations', JSON.stringify(updatedAnnotations));
    
    toast({
      title: "Anotação excluída",
      description: "Sua anotação foi removida com sucesso",
      duration: 2000
    });
  };

  const openAnnotationsDialog = () => {
    setIsAnnotationsDialogOpen(true);
  };

  const renderBookCard = (book: Book) => {
    const isRead = readBooks.some(item => item.id === book.id);
    const isFavorite = favoriteBooks.some(item => item.id === book.id);
    
    return (
      <motion.div 
        whileHover={{ scale: 1.05 }} 
        transition={{ type: "spring", stiffness: 400, damping: 17 }} 
        className="relative cursor-pointer" 
        onClick={() => openBookDialog(book)}
      >
        <div className="relative w-[150px] h-[220px] rounded-md overflow-hidden shadow-lg group">
          <div 
            className="w-full h-full flex items-center justify-center text-center p-2" 
            style={{
              backgroundImage: book.imagem ? `url(${book.imagem})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!book.imagem && 
              <span className="text-sm font-medium text-primary-foreground">
                {book.livro || "Livro sem título"}
              </span>
            }
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
            <p className="text-xs text-white font-medium line-clamp-2">
              {book.livro || "Livro sem título"}
            </p>
          </div>
          
          <div className="absolute top-1 right-1 flex flex-col gap-1">
            {isRead && 
              <div className="bg-green-500 rounded-full p-1 shadow-md">
                <BookOpenCheck size={14} className="text-white" />
              </div>
            }
            {isFavorite && 
              <div className="bg-red-500 rounded-full p-1 shadow-md">
                <Heart size={14} className="text-white" />
              </div>
            }
          </div>
        </div>
      </motion.div>
    );
  };

  const renderBookList = (areaBooks: Book[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Livro</TableHead>
            <TableHead>Sobre</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
            <TableHead className="w-[100px] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {areaBooks.map(book => (
            <TableRow key={book.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openBookDialog(book)}>
              <TableCell className="font-medium">{book.livro}</TableCell>
              <TableCell className="line-clamp-2 text-sm text-muted-foreground">{book.sobre || "Sem descrição"}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center space-x-2">
                  {readBooks.some(item => item.id === book.id) && 
                    <div className="text-green-500" title="Lido">
                      <BookOpenCheck size={16} />
                    </div>
                  }
                  {favoriteBooks.some(item => item.id === book.id) && 
                    <div className="text-red-500" title="Favorito">
                      <Heart size={16} />
                    </div>
                  }
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center space-x-2">
                  {book.link && 
                    <Button size="sm" variant="ghost" title="Ler agora" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBook(book);
                      setIsBookDialogOpen(true);
                      setReadingMode(true);
                    }}>
                      <BookOpen size={16} />
                    </Button>
                  }
                  {book.download && 
                    <Button size="sm" variant="ghost" title="Download" asChild>
                      <a href={book.download} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                        <Download size={16} />
                      </a>
                    </Button>
                  }
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const booksByArea = areas.reduce((acc, area) => {
    if (!area) return acc;
    acc[area] = filteredBooks.filter(book => book.area === area);
    return acc;
  }, {} as Record<string, Book[]>);

  const favoriteBooksData = books.filter(book => 
    favoriteBooks.some(fav => fav.id === book.id)
  );
  
  const readBooksData = books.filter(book => 
    readBooks.some(rb => rb.id === book.id)
  );

  const totalBooks = books.length;
  const booksPerArea = areas.reduce((acc, area) => {
    if (!area) return acc;
    acc[area] = books.filter(book => book.area === area).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container py-4 mx-[18px] px-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Biblioteca Jurídica</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold">{totalBooks}</span> livros disponíveis
          </div>
          
          <div className="relative w-full max-w-sm">
            <Input 
              type="text" 
              placeholder="Pesquisar livros..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10" 
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="relative" 
            onClick={() => setIsAiPopoverOpen(true)}
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 3 
              }}
            >
              <Lamp className="h-5 w-5 text-amber-500" />
            </motion.div>
          </Button>
          
          <Button variant="outline" onClick={openAnnotationsDialog}>
            <PencilLine className="h-4 w-4 mr-2" />
            Anotações
          </Button>
        </div>
      </div>
      
      <AnimatedTabs defaultValue="areas" className="w-full">
        <AnimatedTabsList className="w-full justify-start mb-4">
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
            <div className="space-y-10">
              {areas.map(area => area && booksByArea[area]?.length > 0 && (
                <div key={area} className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold">{area}</h2>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({booksPerArea[area] || 0} livros)
                      </span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleViewMode(area)}
                      className="flex items-center gap-1"
                    >
                      <ListFilter className="h-4 w-4 mr-1" />
                      Ver em {viewMode[area] === 'grid' ? 'lista' : 'grade'}
                    </Button>
                  </div>
                  
                  {viewMode[area] === 'grid' ? (
                    <Carousel className="w-full">
                      <CarouselContent>
                        {booksByArea[area].map(book => (
                          <CarouselItem key={book.id} className="basis-auto md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                            {renderBookCard(book)}
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-0" />
                      <CarouselNext className="right-0" />
                    </Carousel>
                  ) : (
                    renderBookList(booksByArea[area])
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-muted-foreground">
              Nenhuma área encontrada na biblioteca.
            </p>
          )}
        </AnimatedTabsContent>
        
        <AnimatedTabsContent value="recentes" slideDirection="right">
          {recentBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4">
              {recentBooks.map(book => (
                <div key={book.id} className="flex justify-center">
                  {renderBookCard(book)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-muted-foreground">
              Você ainda não acessou nenhum livro recentemente.
            </p>
          )}
        </AnimatedTabsContent>
        
        <AnimatedTabsContent value="lidos" slideDirection="right">
          {readBooksData.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4">
              {readBooksData.map(book => (
                <div key={book.id} className="flex justify-center">
                  {renderBookCard(book)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-muted-foreground">
              Você ainda não marcou nenhum livro como lido.
            </p>
          )}
        </AnimatedTabsContent>
        
        <AnimatedTabsContent value="favoritos" slideDirection="right">
          {favoriteBooksData.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4">
              {favoriteBooksData.map(book => (
                <div key={book.id} className="flex justify-center">
                  {renderBookCard(book)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-muted-foreground">
              Você ainda não adicionou nenhum livro aos favoritos.
            </p>
          )}
        </AnimatedTabsContent>
      </AnimatedTabs>
      
      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <DialogContent className={`max-w-4xl ${readingMode ? 'h-[80vh]' : 'max-h-[90vh]'}`}>
          {selectedBook && !readingMode && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">{selectedBook.livro}</DialogTitle>
                  <DialogClose className="rounded-full h-6 w-6 flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </DialogClose>
                </div>
                <DialogDescription className="text-primary">
                  {selectedBook.area}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div 
                    className="w-[150px] h-[220px] rounded-md overflow-hidden shadow-lg" 
                    style={{
                      backgroundImage: selectedBook.imagem ? `url(${selectedBook.imagem})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: 'rgba(var(--primary), 0.2)'
                    }}
                  >
                    {!selectedBook.imagem && (
                      <div className="w-full h-full flex items-center justify-center p-2 text-center">
                        <span className="text-sm font-medium">
                          {selectedBook.livro}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavoriteStatus(selectedBook.id);
                      }} 
                      className={favoriteBooks.some(fav => fav.id === selectedBook.id) 
                        ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 dark:bg-red-900/30 dark:text-red-400" 
                        : ""}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={e => {
                        e.stopPropagation();
                        toggleReadStatus(selectedBook.id);
                      }} 
                      className={readBooks.some(rb => rb.id === selectedBook.id) 
                        ? "bg-green-100 text-green-500 hover:bg-green-200 hover:text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                        : ""}
                    >
                      <BookOpenCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Sinopse</h3>
                    <div className="relative">
                      <p className="text-sm">{selectedBook.sobre || "Sinopse não disponível"}</p>
                      
                      {selectedBook.sobre && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-0 right-0" 
                          onClick={() => handleNarration(selectedBook.sobre || "")}
                        >
                          <Volume2 className={`h-4 w-4 ${isNarrating ? "text-primary" : ""}`} />
                        </Button>
                      )}
                    </div>
                    
                    {isNarrating && (
                      <div className="mt-2">
                        <p className="text-xs mb-1">Volume: {narrationVolume}%</p>
                        <Slider 
                          value={[narrationVolume]} 
                          min={0} 
                          max={100} 
                          step={5} 
                          onValueChange={value => setNarrationVolume(value[0])} 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Anotações</h3>
                    <div className="space-y-2">
                      <Input
                        placeholder="Adicione sua anotação sobre este livro..."
                        value={currentAnnotation}
                        onChange={e => setCurrentAnnotation(e.target.value)}
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => saveAnnotation(selectedBook.id)}
                        disabled={!currentAnnotation.trim()}
                      >
                        Salvar anotação
                      </Button>
                    </div>
                    
                    {annotations.filter(a => a.bookId === selectedBook.id).length > 0 && (
                      <div className="mt-3 max-h-[150px] overflow-y-auto space-y-2">
                        {annotations
                          .filter(a => a.bookId === selectedBook.id)
                          .map(annotation => (
                            <div key={annotation.id} className="p-2 text-sm border rounded-md">
                              <p className="line-clamp-2">{annotation.text}</p>
                              <div className="flex justify-end mt-1 space-x-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setEditingAnnotation(annotation.id);
                                    setCurrentAnnotation(annotation.text);
                                  }} 
                                  className="h-7 px-2"
                                >
                                  <PencilLine className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => deleteAnnotation(annotation.id)} 
                                  className="h-7 px-2 text-red-500 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between mt-4">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={openAnnotationsDialog}
                  >
                    <PencilLine className="h-4 w-4 mr-2" />
                    Ver todas anotações
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  {selectedBook.download && (
                    <Button variant="outline" asChild>
                      <a href={selectedBook.download} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  )}
                  
                  {selectedBook.link && (
                    <Button 
                      onClick={() => setReadingMode(true)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ler Agora
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
          
          {selectedBook && readingMode && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{selectedBook.livro}</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setReadingMode(false)}
                  >
                    Voltar aos detalhes
                  </Button>
                  <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center border">
                    <X className="h-4 w-4" />
                  </DialogClose>
                </div>
              </div>
              
              <div className="flex-1 w-full h-full min-h-[60vh]">
                {selectedBook.link ? (
                  <iframe 
                    src={selectedBook.link} 
                    className="w-full h-full rounded-md border"
                    title={selectedBook.livro || "Leitura"}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p>Link de leitura não disponível para este livro.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAnnotationsDialogOpen} onOpenChange={setIsAnnotationsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Minhas Anotações</DialogTitle>
            <DialogDescription>
              Todas as suas anotações de livros
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
            {annotations.length > 0 ? (
              annotations.map(annotation => {
                const book = books.find(b => b.id === annotation.bookId);
                return (
                  <Card key={annotation.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{book?.livro || "Livro desconhecido"}</CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(annotation.createdAt).toLocaleDateString('pt-BR')}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              if (editingAnnotation === annotation.id) {
                                updateAnnotation(annotation.id, currentAnnotation);
                              } else {
                                setEditingAnnotation(annotation.id);
                                setCurrentAnnotation(annotation.text);
                              }
                            }}
                          >
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => deleteAnnotation(annotation.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      {editingAnnotation === annotation.id ? (
                        <div className="space-y-2">
                          <Input
                            value={currentAnnotation}
                            onChange={e => setCurrentAnnotation(e.target.value)}
                            className="w-full"
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingAnnotation(null)}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => updateAnnotation(annotation.id, currentAnnotation)}
                            >
                              Salvar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{annotation.text}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Você ainda não tem anotações.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsAnnotationsDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Popover open={isAiPopoverOpen} onOpenChange={setIsAiPopoverOpen}>
        <PopoverContent className="w-[450px] p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  repeatDelay: 1 
                }}
              >
                <Lamp className="h-5 w-5 text-amber-500" />
              </motion.div>
              <h3 className="text-lg font-semibold">Assistente de Recomendação</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Descreva o assunto que você quer estudar e receba recomendações de livros.
            </p>
            
            <div className="flex items-center gap-2">
              <Input 
                value={aiQuery} 
                onChange={e => setAiQuery(e.target.value)} 
                placeholder="Ex: Quero aprender sobre contratos de trabalho" 
                className="flex-1" 
              />
              <Button 
                onClick={askAiForRecommendation} 
                disabled={isAiLoading || !aiQuery.trim()} 
                size="sm"
              >
                {isAiLoading ? "Buscando..." : "Perguntar"}
              </Button>
            </div>
            
            {aiResult && (
              <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                <p className="font-medium mb-2">Resposta do Assistente:</p>
                <p>{aiResult}</p>
              </div>
            )}
            
            {aiRecommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Livros relacionados em nossa biblioteca:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {aiRecommendations.map(book => (
                    <div 
                      key={book.id} 
                      className="p-2 border rounded-md cursor-pointer hover:bg-accent" 
                      onClick={() => {
                        openBookDialog(book);
                        setIsAiPopoverOpen(false);
                      }}
                    >
                      <p className="text-xs font-medium truncate">{book.livro}</p>
                      <p className="text-xs text-muted-foreground">{book.area}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Biblioteca;
